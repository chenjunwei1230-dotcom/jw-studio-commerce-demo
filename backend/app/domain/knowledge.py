from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from .product import ProductCategory


class KnowledgeTopic(StrEnum):
    CREATOR_STORY = "creator-story"
    BRAND = "brand"
    LEARNING = "learning"
    PRODUCT = "product"
    FAQ = "faq"
    SIZING = "sizing"
    BOUNDARIES = "boundaries"


class KnowledgeSourceType(StrEnum):
    CREATOR_PROFILE = "creator-profile"
    BRAND_GUIDANCE = "brand-guidance"
    LEARNING_GUIDANCE = "learning-guidance"
    PRODUCT_FACTS = "product-facts"
    FAQ = "faq"
    SIZING_GUIDANCE = "sizing-guidance"
    ASSISTANT_BOUNDARIES = "assistant-boundaries"


class ProductKnowledgeFacts(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=1)
    category: ProductCategory
    description: str = Field(min_length=1)
    materials: list[str] = Field(min_length=1)
    care_instructions: str = Field(min_length=1)
    options: dict[str, list[str]]
    design_meaning: str = Field(min_length=1)
    creator_recommendation: str = Field(min_length=1)

    @field_validator(
        "name",
        "description",
        "care_instructions",
        "design_meaning",
        "creator_recommendation",
    )
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("text fields must not be blank")
        return cleaned


class KnowledgeDocument(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source_id: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    topic: KnowledgeTopic
    source_type: KnowledgeSourceType
    product_id: str | None = Field(default=None, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1)
    content: str = Field(min_length=1)
    synthetic: Literal[True]
    approved_for_rag: Literal[True]
    facts: ProductKnowledgeFacts | None = None

    @field_validator("title", "content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("knowledge text must not be blank")
        return cleaned

    @model_validator(mode="after")
    def validate_product_document_shape(self) -> KnowledgeDocument:
        is_product_document = self.topic == KnowledgeTopic.PRODUCT
        if is_product_document and (self.product_id is None or self.facts is None):
            raise ValueError("product knowledge documents require product_id and facts")
        if not is_product_document and (self.product_id is not None or self.facts is not None):
            raise ValueError("only product knowledge documents may contain product facts")
        return self
