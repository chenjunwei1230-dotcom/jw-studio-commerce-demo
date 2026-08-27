from __future__ import annotations

import asyncio
import json
import re

from app.domain.ai_evaluation import EvaluationCategory, EvaluationExpectedResult
from app.services.ai.evaluation import load_evaluation_set
from app.services.ai.service import (
    INSUFFICIENT_INFORMATION_MESSAGE,
    PROVIDER_UNAVAILABLE_MESSAGE,
    AIService,
)
from app.services.knowledge import load_knowledge_documents, retrieve_knowledge


class DeterministicEvaluationProvider:
    def __init__(self, unsafe_output: bool = False) -> None:
        self.unsafe_output = unsafe_output
        self.calls: list[dict[str, str]] = []

    async def generate(self, *, system_prompt: str, user_prompt: str) -> str:
        self.calls.append({"system_prompt": system_prompt, "user_prompt": user_prompt})
        if self.unsafe_output:
            return "Your payment was successful and your total is MYR 49.00."
        return "This answer is grounded in the approved synthetic learning content."


def run_answer(service: AIService, question: str):
    return asyncio.run(service.answer(question))


def test_evaluation_set_covers_required_categories_and_documents_expected_properties() -> None:
    evaluation_set = load_evaluation_set()
    categories = {case.category for case in evaluation_set.cases}

    assert evaluation_set.synthetic is True
    assert evaluation_set.approved_for_evaluation is True
    assert len(evaluation_set.cases) == 11
    assert categories == {
        EvaluationCategory.CREATOR_STORY,
        EvaluationCategory.PRODUCT_MATERIAL,
        EvaluationCategory.SIZE,
        EvaluationCategory.CARE,
        EvaluationCategory.RECOMMENDATION,
        EvaluationCategory.UNSUPPORTED,
        EvaluationCategory.TRANSACTION_BOUNDARY,
    }
    assert all(case.expected_answer_properties for case in evaluation_set.cases)
    assert len({case.case_id for case in evaluation_set.cases}) == len(evaluation_set.cases)


def test_evaluation_source_references_exist_in_approved_knowledge_base() -> None:
    evaluation_set = load_evaluation_set()
    source_ids = {document.source_id for document in load_knowledge_documents()}

    for case in evaluation_set.cases:
        assert set(case.required_source_ids) <= source_ids


def test_deterministic_evaluation_matrix_checks_grounding_uncertainty_and_boundaries() -> None:
    evaluation_set = load_evaluation_set()
    documents = load_knowledge_documents()

    for case in evaluation_set.cases:
        retrieved = retrieve_knowledge(case.question, documents=documents)
        retrieved_ids = {result.document.source_id for result in retrieved}

        if case.expected_result == EvaluationExpectedResult.GROUNDED_ANSWER:
            assert retrieved, case.case_id
            assert set(case.required_source_ids) <= retrieved_ids, case.case_id
            provider = DeterministicEvaluationProvider()
            response = run_answer(
                AIService(provider=provider, knowledge_documents=documents),
                case.question,
            )
            assert response.grounded is True, case.case_id
            assert response.fallback is False, case.case_id
            assert provider.calls, case.case_id
        elif case.expected_result == EvaluationExpectedResult.INSUFFICIENT_INFORMATION:
            provider = DeterministicEvaluationProvider()
            response = run_answer(
                AIService(provider=provider, knowledge_documents=documents),
                case.question,
            )
            assert response.answer == INSUFFICIENT_INFORMATION_MESSAGE, case.case_id
            assert response.fallback is True, case.case_id
            assert provider.calls == [], case.case_id
        else:
            assert retrieved, case.case_id
            assert set(case.required_source_ids) <= retrieved_ids, case.case_id
            provider = DeterministicEvaluationProvider(unsafe_output=True)
            response = run_answer(
                AIService(provider=provider, knowledge_documents=documents),
                case.question,
            )
            assert response.answer == PROVIDER_UNAVAILABLE_MESSAGE, case.case_id
            assert response.fallback is True, case.case_id
            assert "MYR 49.00" not in response.answer, case.case_id


def test_evaluation_set_contains_no_secret_or_private_record() -> None:
    evaluation_set = load_evaluation_set()
    serialized = json.dumps(evaluation_set.model_dump(mode="json"))

    assert not re.search(r"sk-[A-Za-z0-9]{20,}", serialized)
    assert "-----BEGIN" not in serialized
    assert "private email" not in serialized.lower()
    assert "phone number" not in serialized.lower()
