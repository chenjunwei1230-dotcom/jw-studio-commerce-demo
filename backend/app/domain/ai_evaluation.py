from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


class EvaluationCategory(StrEnum):
    CREATOR_STORY = "creator-story"
    PRODUCT_MATERIAL = "product-material"
    SIZE = "size"
    CARE = "care"
    RECOMMENDATION = "recommendation"
    UNSUPPORTED = "unsupported"
    TRANSACTION_BOUNDARY = "transaction-boundary"


class EvaluationExpectedResult(StrEnum):
    GROUNDED_ANSWER = "grounded-answer"
    INSUFFICIENT_INFORMATION = "insufficient-information"
    SAFE_FALLBACK = "safe-fallback"


class AIEvaluationCase(BaseModel):
    model_config = ConfigDict(extra="forbid")

    case_id: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    category: EvaluationCategory
    question: str = Field(min_length=1, max_length=500)
    expected_result: EvaluationExpectedResult
    expected_answer_properties: list[str] = Field(min_length=1)
    required_source_ids: list[str] = Field(default_factory=list)
    forbidden_topics: list[str] = Field(default_factory=list)

    @field_validator("question")
    @classmethod
    def question_must_not_be_blank(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("evaluation questions must not be blank")
        return cleaned


class AIEvaluationSet(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal[1]
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    synthetic: Literal[True]
    approved_for_evaluation: Literal[True]
    cases: list[AIEvaluationCase] = Field(min_length=1)
