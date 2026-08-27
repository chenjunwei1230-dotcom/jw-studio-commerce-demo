from __future__ import annotations

import json
from collections import Counter
from decimal import Decimal
from enum import StrEnum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCategory(StrEnum):
    DECORATIVE = "decorative"
    CLOTHING = "clothing"
    HEADWEAR = "headwear"


EXPECTED_CATEGORY_COUNTS: dict[ProductCategory, int] = {
    ProductCategory.DECORATIVE: 5,
    ProductCategory.CLOTHING: 5,
    ProductCategory.HEADWEAR: 3,
}


class ProductImageVariant(BaseModel):
    model_config = ConfigDict(extra="forbid")

    image_reference: str = Field(min_length=1)
    image_alt_text: str = Field(min_length=1)


class Product(BaseModel):
    """Validated product data shared by the seed and database layers."""

    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    name: str = Field(min_length=1)
    category: ProductCategory
    price: Decimal = Field(ge=Decimal("0"))
    currency: str = Field(min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    description: str = Field(min_length=1)
    materials: list[str] = Field(min_length=1)
    care_instructions: str = Field(min_length=1)
    image_reference: str = Field(min_length=1)
    image_alt_text: str = Field(min_length=1)
    image_variants: dict[str, dict[str, ProductImageVariant]] = Field(default_factory=dict)
    options: dict[str, list[str]] = Field(default_factory=dict)
    design_meaning: str = Field(min_length=1)
    creator_recommendation: str = Field(min_length=1)

    @field_validator(
        "name",
        "description",
        "care_instructions",
        "image_reference",
        "image_alt_text",
        "design_meaning",
        "creator_recommendation",
    )
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("text fields must not be blank")
        return cleaned

    @field_validator("materials")
    @classmethod
    def materials_must_be_non_blank(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if not cleaned or any(not value for value in cleaned):
            raise ValueError("materials must contain non-blank values")
        return cleaned

    @field_validator("options")
    @classmethod
    def options_must_be_non_blank(cls, values: dict[str, list[str]]) -> dict[str, list[str]]:
        for option_name, option_values in values.items():
            if not option_name.strip() or not option_values:
                raise ValueError("option names and values must not be empty")
            if any(not value.strip() for value in option_values):
                raise ValueError("option values must not be blank")
        return values


def default_seed_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "products.json"


def load_seed_products(seed_path: Path | None = None) -> list[Product]:
    source_path = seed_path or default_seed_path()
    payload: Any = json.loads(source_path.read_text(encoding="utf-8"))
    if not isinstance(payload, list):
        raise ValueError("product seed source must contain a JSON list")
    return [Product.model_validate(item) for item in payload]


def validate_catalog_shape(products: list[Product]) -> None:
    if len(products) != sum(EXPECTED_CATEGORY_COUNTS.values()):
        raise ValueError("catalog must contain exactly 13 products")

    product_ids = [product.id for product in products]
    if len(product_ids) != len(set(product_ids)):
        raise ValueError("product IDs must be unique")

    category_counts = Counter(product.category for product in products)
    if category_counts != EXPECTED_CATEGORY_COUNTS:
        raise ValueError(
            "catalog categories must contain 5 decorative, 5 clothing, and 3 headwear products"
        )
