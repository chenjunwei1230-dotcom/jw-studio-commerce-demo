from __future__ import annotations

from decimal import Decimal
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StrictInt


class DemoPaymentMethod(StrEnum):
    DEMO_CARD = "demo_card"
    DEMO_WALLET = "demo_wallet"


class CheckoutItemRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_id: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    selected_options: dict[str, str] = Field(default_factory=dict)
    quantity: StrictInt = Field(gt=0, le=99)


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[CheckoutItemRequest] = Field(min_length=1, max_length=50)
    payment_method: DemoPaymentMethod


class CheckoutIssue(BaseModel):
    field: str
    code: str
    message: str


class CheckoutErrorResponse(BaseModel):
    error: Literal["checkout_validation_error"]
    message: str
    issues: list[CheckoutIssue]


class CheckoutSummaryItem(BaseModel):
    product_id: str
    name: str
    selected_options: dict[str, str]
    quantity: int
    unit_price: str
    line_total: str
    currency: str


class CheckoutSummary(BaseModel):
    items: list[CheckoutSummaryItem]
    subtotal: str
    total: str
    currency: str


class CheckoutResult(BaseModel):
    demo: Literal[True] = True
    payment_status: Literal["simulated_success"] = "simulated_success"
    payment_method: DemoPaymentMethod
    message: str
    synthetic_reference: str
    summary: CheckoutSummary


class CheckoutValidationError(ValueError):
    def __init__(self, issues: list[CheckoutIssue]) -> None:
        super().__init__("The checkout request is invalid.")
        self.issues = issues


def format_money(amount: Decimal) -> str:
    return f"{amount:.2f}"
