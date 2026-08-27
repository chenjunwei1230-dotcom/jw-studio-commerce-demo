from __future__ import annotations

from decimal import Decimal
from uuid import uuid4

from app.domain.checkout import (
    CheckoutIssue,
    CheckoutRequest,
    CheckoutResult,
    CheckoutSummary,
    CheckoutSummaryItem,
    CheckoutValidationError,
    format_money,
)
from app.services.catalog import CatalogUnavailableError, fetch_products


def _selection_key(product_id: str, selected_options: dict[str, str]) -> str:
    options_key = "&".join(
        f"{option_name}={selected_options[option_name]}"
        for option_name in sorted(selected_options)
    )
    return f"{product_id}::{options_key}"


def _option_issues(
    item_index: int,
    product_options: dict[str, list[str]],
    selected_options: dict[str, str],
) -> list[CheckoutIssue]:
    field = f"items[{item_index}].selected_options"
    issues: list[CheckoutIssue] = []
    required_option_names = {
        option_name for option_name, values in product_options.items() if values
    }

    missing_options = sorted(required_option_names - selected_options.keys())
    if missing_options:
        issues.append(
            CheckoutIssue(
                field=field,
                code="missing_required_options",
                message=f"Choose the required options: {', '.join(missing_options)}.",
            )
        )

    unknown_options = sorted(set(selected_options) - set(product_options))
    if unknown_options:
        issues.append(
            CheckoutIssue(
                field=field,
                code="unknown_options",
                message=f"These options are not available: {', '.join(unknown_options)}.",
            )
        )

    invalid_values = sorted(
        option_name
        for option_name, option_value in selected_options.items()
        if option_name in product_options and option_value not in product_options[option_name]
    )
    if invalid_values:
        issues.append(
            CheckoutIssue(
                field=field,
                code="invalid_option_values",
                message=f"Choose an available value for: {', '.join(invalid_values)}.",
            )
        )

    return issues


def calculate_demo_checkout(request: CheckoutRequest) -> CheckoutResult:
    try:
        products_by_id = {product.id: product for product in fetch_products()}
    except CatalogUnavailableError:
        raise

    issues: list[CheckoutIssue] = []
    seen_selection_keys: set[str] = set()
    summary_items: list[CheckoutSummaryItem] = []
    subtotal = Decimal("0")
    currency: str | None = None

    for item_index, item in enumerate(request.items):
        field = f"items[{item_index}]"
        product = products_by_id.get(item.product_id)
        if product is None:
            issues.append(
                CheckoutIssue(
                    field=f"{field}.product_id",
                    code="unknown_product",
                    message="Choose a product from the authoritative collection.",
                )
            )
            continue

        issues.extend(_option_issues(item_index, product.options, item.selected_options))
        selection_key = _selection_key(product.id, item.selected_options)
        if selection_key in seen_selection_keys:
            issues.append(
                CheckoutIssue(
                    field=field,
                    code="duplicate_selection",
                    message="Combine matching product selections before checkout.",
                )
            )
        seen_selection_keys.add(selection_key)

        if currency is None:
            currency = product.currency
        elif product.currency != currency:
            issues.append(
                CheckoutIssue(
                    field=f"{field}.product_id",
                    code="currency_mismatch",
                    message="All demo checkout items must use the same currency.",
                )
            )

        unit_price = product.price
        line_total = unit_price * item.quantity
        subtotal += line_total
        summary_items.append(
            CheckoutSummaryItem(
                product_id=product.id,
                name=product.name,
                selected_options=dict(item.selected_options),
                quantity=item.quantity,
                unit_price=format_money(unit_price),
                line_total=format_money(line_total),
                currency=product.currency,
            )
        )

    if issues:
        raise CheckoutValidationError(issues)

    if currency is None:
        raise CheckoutValidationError(
            [
                CheckoutIssue(
                    field="items",
                    code="empty_items",
                    message="Add at least one product selection before checkout.",
                )
            ]
        )

    return CheckoutResult(
        payment_method=request.payment_method,
        message="Demo payment approved. No real payment was processed.",
        synthetic_reference=f"demo-{uuid4().hex[:12]}",
        summary=CheckoutSummary(
            items=summary_items,
            subtotal=format_money(subtotal),
            total=format_money(subtotal),
            currency=currency,
        ),
    )
