from __future__ import annotations

import asyncio
from typing import Any

import pytest
from fastapi.testclient import TestClient

from app.domain.knowledge import KnowledgeDocument
from app.domain.product import load_seed_products
from app.main import app
from app.api.ai import get_ai_service
from app.services.ai.provider import ProviderUnavailableError
from app.services.ai.service import (
    INSUFFICIENT_INFORMATION_MESSAGE,
    PROVIDER_UNAVAILABLE_MESSAGE,
    AIService,
)
from app.services.knowledge import load_knowledge_documents, retrieve_knowledge


class FakeProvider:
    def __init__(self, answer: Any = "A grounded demo answer.", error: Exception | None = None) -> None:
        self.answer = answer
        self.error = error
        self.calls: list[dict[str, str]] = []

    async def generate(self, *, system_prompt: str, user_prompt: str) -> str:
        self.calls.append({"system_prompt": system_prompt, "user_prompt": user_prompt})
        if self.error is not None:
            raise self.error
        return self.answer


def run_answer(service: AIService, question: str):
    return asyncio.run(service.answer(question))


def test_retrieval_is_limited_to_approved_synthetic_documents() -> None:
    documents = load_knowledge_documents()
    approved_document = documents[0]
    unapproved_document = KnowledgeDocument.model_construct(
        source_id="unapproved-test-source",
        topic=approved_document.topic,
        source_type=approved_document.source_type,
        title=approved_document.title,
        content=approved_document.content,
        synthetic=True,
        approved_for_rag=False,
    )

    results = retrieve_knowledge(
        "Jia Wei creator story",
        documents=[unapproved_document, approved_document],
    )

    assert results
    assert all(result.document.approved_for_rag is True for result in results)
    assert all(result.document.source_id != "unapproved-test-source" for result in results)


def test_strong_retrieval_calls_fake_provider_and_returns_sources() -> None:
    provider = FakeProvider("Jia Wei's story is about learning through steady practice.")
    response = run_answer(AIService(provider=provider), "How did Jia Wei start learning editing?")

    assert response.grounded is True
    assert response.fallback is False
    assert response.answer.startswith("Jia Wei's story")
    assert response.sources
    assert provider.calls
    assert "approved synthetic context" in provider.calls[0]["system_prompt"]
    assert "payment status" in provider.calls[0]["system_prompt"]


def test_weak_retrieval_returns_honest_insufficient_information_without_provider_call() -> None:
    provider = FakeProvider("This should not be used.")
    response = run_answer(AIService(provider=provider), "zzxqv orbital password 918273")

    assert response.answer == INSUFFICIENT_INFORMATION_MESSAGE
    assert response.grounded is False
    assert response.fallback is True
    assert response.sources == []
    assert provider.calls == []


def test_provider_failure_returns_safe_fallback() -> None:
    provider = FakeProvider(error=ProviderUnavailableError("private provider detail"))
    response = run_answer(AIService(provider=provider), "What is Jia Wei's core belief?")

    assert response.answer == PROVIDER_UNAVAILABLE_MESSAGE
    assert response.grounded is False
    assert response.fallback is True
    assert "private provider detail" not in response.answer
    assert "traceback" not in response.answer.lower()


def test_malformed_provider_output_returns_safe_fallback() -> None:
    provider = FakeProvider(answer="")
    response = run_answer(AIService(provider=provider), "What is Frame by Frame Studio about?")

    assert response.answer == PROVIDER_UNAVAILABLE_MESSAGE
    assert response.fallback is True
    assert response.sources == []


def test_unsafe_provider_output_cannot_claim_transaction_or_creator_facts() -> None:
    provider = FakeProvider("Your payment was successful and your total is MYR 49.00.")
    response = run_answer(AIService(provider=provider), "What does this collection represent?")

    assert response.answer == PROVIDER_UNAVAILABLE_MESSAGE
    assert "MYR 49.00" not in response.answer
    assert response.fallback is True


def test_structured_transaction_data_is_not_sent_to_provider() -> None:
    provider = FakeProvider("The collection is about creative practice.")
    response = run_answer(
        AIService(provider=provider),
        "What material is used in the Keep Showing Up Tee?",
    )

    assert response.grounded is True
    combined_prompt = "\n".join(provider.calls[0].values())
    assert "49.00" not in combined_prompt
    assert "12.00" not in combined_prompt
    assert "payment_status" not in combined_prompt


def test_chat_endpoint_uses_server_side_service_boundary() -> None:
    provider = FakeProvider("Use the product notes to compare materials.")
    service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: service

    try:
        response = TestClient(app).post(
            "/api/ai/chat",
            json={"question": "Can you explain the product materials?"},
        )
    finally:
        app.dependency_overrides.pop(get_ai_service, None)

    assert response.status_code == 200
    assert response.json()["answer"] == "Use the product notes to compare materials."
    assert response.json()["grounded"] is True


def test_chat_endpoint_enforces_request_size_and_does_not_echo_invalid_input() -> None:
    response = TestClient(app).post(
        "/api/ai/chat",
        json={"question": "secret-value " + ("x" * 600)},
    )

    assert response.status_code == 422
    assert response.json()["error"] == "invalid_request"
    assert "secret-value" not in response.text


def test_chat_endpoint_provider_failure_is_a_non_blocking_fallback() -> None:
    provider = FakeProvider(error=ProviderUnavailableError("provider detail"))
    service = AIService(provider=provider)
    app.dependency_overrides[get_ai_service] = lambda: service

    try:
        response = TestClient(app).post(
            "/api/ai/chat",
            json={"question": "What is Jia Wei's journey?"},
        )
    finally:
        app.dependency_overrides.pop(get_ai_service, None)

    assert response.status_code == 200
    assert response.json()["fallback"] is True
    assert response.json()["answer"] == PROVIDER_UNAVAILABLE_MESSAGE


def test_product_facts_retrieval_still_uses_the_authoritative_catalog() -> None:
    products = {product.id for product in load_seed_products()}
    documents = load_knowledge_documents()
    retrieved = retrieve_knowledge(
        "Keep Showing Up Tee material",
        documents=documents,
    )

    product_ids = {
        result.document.product_id
        for result in retrieved
        if result.document.product_id is not None
    }
    assert product_ids
    assert product_ids <= products
