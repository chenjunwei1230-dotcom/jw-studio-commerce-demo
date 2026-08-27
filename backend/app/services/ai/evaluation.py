from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.domain.ai_evaluation import AIEvaluationSet


class EvaluationSetValidationError(ValueError):
    """Raised when the deterministic AI evaluation set is malformed."""


def default_evaluation_path() -> Path:
    return Path(__file__).resolve().parents[3] / "data" / "ai" / "evaluation_set.json"


def load_evaluation_set(evaluation_path: Path | None = None) -> AIEvaluationSet:
    source_path = evaluation_path or default_evaluation_path()
    if not source_path.exists():
        raise EvaluationSetValidationError("the AI evaluation set does not exist")

    try:
        payload: Any = json.loads(source_path.read_text(encoding="utf-8"))
        return AIEvaluationSet.model_validate(payload)
    except (OSError, json.JSONDecodeError, ValueError) as error:
        raise EvaluationSetValidationError("the AI evaluation set is invalid") from error
