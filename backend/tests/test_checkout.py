import sqlite3
import uuid
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import catalog as catalog_service
from app.services.catalog import seed_catalog


@pytest.fixture()
def catalog_database(monkeypatch: pytest.MonkeyPatch) -> Path:
    test_root = Path(__file__).resolve().parents[1] / ".test-tmp"
    test_root.mkdir(exist_ok=True)
    database_path = test_root / f"checkout-{uuid.uuid4().hex}.sqlite3"
    seed_catalog(database_path)
    monkeypatch.setattr(catalog_service, "DEFAULT_DATABASE_PATH", database_path)

    try:
        yield database_path
    finally:
        database_path.unlink(missing_ok=True)


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def checkout_payload(
    *,
    product_id: str = "keep-showing-up-keychain",
    selected_options: dict[str, str] | None = None,
    quantity: object = 1,
    payment_method: str = "demo_card",
) -> dict[str, object]:
    return {
        "items": [
            {
                "product_id": product_id,
                "selected_options": (
                    {"colour": "Orange"}
                    if selected_options is None
                    else selected_options
                ),
                "quantity": quantity,
            }
        ],
        "payment_method": payment_method,
    }


def test_valid_checkout_returns_authoritative_synthetic_result(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.post("/api/demo/checkout", json=checkout_payload(quantity=2))

    assert response.status_code == 200
    body = response.json()
    assert body["demo"] is True
    assert body["payment_status"] == "simulated_success"
    assert body["payment_method"] == "demo_card"
    assert body["message"] == "Demo payment approved. No real payment was processed."
    assert body["synthetic_reference"].startswith("demo-")
    assert body["summary"] == {
        "items": [
            {
                "product_id": "keep-showing-up-keychain",
                "name": "Keep Showing Up Keychain",
                "selected_options": {"colour": "Orange"},
                "quantity": 2,
                "unit_price": "12.00",
                "line_total": "24.00",
                "currency": "MYR",
            }
        ],
        "subtotal": "24.00",
        "total": "24.00",
        "currency": "MYR",
    }


def test_checkout_reads_name_and_price_from_sqlite(
    client: TestClient, catalog_database: Path
) -> None:
    connection = sqlite3.connect(catalog_database)
    try:
        connection.execute(
            "UPDATE products SET name = ?, price_cents = ? WHERE id = ?",
            ("Database Checkout Product", 1234, "keep-showing-up-keychain"),
        )
        connection.commit()
    finally:
        connection.close()

    response = client.post("/api/demo/checkout", json=checkout_payload(quantity=3))

    assert response.status_code == 200
    summary_item = response.json()["summary"]["items"][0]
    assert summary_item["name"] == "Database Checkout Product"
    assert summary_item["unit_price"] == "12.34"
    assert summary_item["line_total"] == "37.02"
    assert response.json()["summary"]["subtotal"] == "37.02"


@pytest.mark.parametrize(
    ("field_name", "field_value"),
    [
        ("price", "0.01"),
        ("total", "0.01"),
        ("subtotal", "0.01"),
    ],
)
def test_browser_supplied_money_fields_are_rejected(
    client: TestClient,
    catalog_database: Path,
    field_name: str,
    field_value: str,
) -> None:
    payload = checkout_payload()
    payload[field_name] = field_value

    response = client.post("/api/demo/checkout", json=payload)

    assert response.status_code == 422
    assert "checkout_validation_error" not in response.text
    assert field_value not in response.text


def test_unknown_product_returns_field_specific_safe_error(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.post(
        "/api/demo/checkout",
        json=checkout_payload(product_id="not-a-real-product"),
    )

    assert response.status_code == 422
    assert response.json()["detail"]["error"] == "checkout_validation_error"
    assert response.json()["detail"]["issues"] == [
        {
            "field": "items[0].product_id",
            "code": "unknown_product",
            "message": "Choose a product from the authoritative collection.",
        }
    ]


@pytest.mark.parametrize(
    ("selected_options", "issue_code"),
    [
        ({}, "missing_required_options"),
        ({"colour": "Not a real colour"}, "invalid_option_values"),
        ({"colour": "Orange", "finish": "Gloss"}, "unknown_options"),
    ],
)
def test_invalid_options_are_rejected(
    client: TestClient,
    catalog_database: Path,
    selected_options: dict[str, str],
    issue_code: str,
) -> None:
    response = client.post(
        "/api/demo/checkout",
        json=checkout_payload(selected_options=selected_options),
    )

    assert response.status_code == 422
    assert response.json()["detail"]["issues"][0]["code"] == issue_code


@pytest.mark.parametrize("quantity", [0, -1, 1.5, "two"])
def test_invalid_quantities_are_rejected(
    client: TestClient, catalog_database: Path, quantity: object
) -> None:
    response = client.post(
        "/api/demo/checkout",
        json=checkout_payload(quantity=quantity),
    )

    assert response.status_code == 422


def test_unsupported_payment_method_is_rejected(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.post(
        "/api/demo/checkout",
        json=checkout_payload(payment_method="stripe"),
    )

    assert response.status_code == 422
    assert "stripe" not in response.text


@pytest.mark.parametrize("forbidden_field", ["card_number", "cvv", "bank_password", "customer"])
def test_real_payment_or_customer_fields_are_not_accepted(
    client: TestClient,
    catalog_database: Path,
    forbidden_field: str,
) -> None:
    payload = checkout_payload()
    payload[forbidden_field] = "synthetic-secret-value"

    response = client.post("/api/demo/checkout", json=payload)

    assert response.status_code == 422
    assert "synthetic-secret-value" not in response.text


def test_duplicate_selection_returns_a_safe_item_error(
    client: TestClient, catalog_database: Path
) -> None:
    payload = {
        "items": [
            {
                "product_id": "keep-showing-up-keychain",
                "selected_options": {"colour": "Orange"},
                "quantity": 1,
            },
            {
                "product_id": "keep-showing-up-keychain",
                "selected_options": {"colour": "Orange"},
                "quantity": 1,
            },
        ],
        "payment_method": "demo_card",
    }

    response = client.post("/api/demo/checkout", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"]["issues"][0]["code"] == "duplicate_selection"


def test_catalog_failure_returns_safe_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    missing_database = (
        Path(__file__).resolve().parents[1]
        / ".test-tmp"
        / f"missing-checkout-{uuid.uuid4().hex}.sqlite3"
    )
    monkeypatch.setattr(catalog_service, "DEFAULT_DATABASE_PATH", missing_database)

    response = client.post(
        "/api/demo/checkout",
        json=checkout_payload(),
    )

    assert response.status_code == 503
    assert response.json() == {
        "detail": "The product catalog is temporarily unavailable."
    }
    assert "Traceback" not in response.text
    assert str(missing_database) not in response.text


def test_checkout_catalog_connection_is_closed_after_request(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.post("/api/demo/checkout", json=checkout_payload())

    assert response.status_code == 200
    catalog_database.unlink()
    assert not catalog_database.exists()
