from __future__ import annotations

import logging
import re
from collections.abc import Sequence

from app.domain.ai import AIChatResponse, AIResponseSource
from app.services.ai.prompts import GROUNDING_SYSTEM_PROMPT, build_grounded_user_prompt
from app.services.ai.provider import (
    AIProvider,
    AIProviderError,
    OpenAICompatibleProvider,
    ProviderResponseError,
)
from app.services.knowledge import KnowledgeDocument, retrieve_knowledge


logger = logging.getLogger(__name__)

INSUFFICIENT_INFORMATION_MESSAGE = (
    "I do not have enough information in the approved learning content to answer that confidently."
)
PROVIDER_UNAVAILABLE_MESSAGE = (
    "The learning assistant is unavailable right now. You can still browse the collection "
    "and complete the demo checkout."
)

_UNSAFE_OUTPUT_PATTERNS = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\b(?:payment|transaction)\s+(?:was\s+)?(?:successful|succeeded|approved|failed|declined)\b",
        r"\b(?:your|the)\s+(?:price|total|order amount)\s+(?:is|equals?)\b",
        r"\b(?:in stock|out of stock)\b",
        r"\b(?:your|the)\s+order\s+(?:has\s+)?(?:shipped|is shipped|status is)\b",
        r"\brefund\s+(?:approved|processed|issued)\b",
        r"\b(?:i am|i'm)\s+jia wei\b",
    )
)


def _validate_provider_answer(value: object) -> str:
    if not isinstance(value, str):
        raise ProviderResponseError("provider answer must be text")

    answer = value.strip()
    if not answer or len(answer) > 2000:
        raise ProviderResponseError("provider answer is empty or too long")
    if "<script" in answer.lower() or re.search(r"sk-[A-Za-z0-9]{20,}", answer):
        raise ProviderResponseError("provider answer is unsafe to render")
    if any(pattern.search(answer) for pattern in _UNSAFE_OUTPUT_PATTERNS):
        raise ProviderResponseError("provider answer crosses a commerce boundary")
    return answer


class AIService:
    def __init__(
        self,
        provider: AIProvider | None = None,
        knowledge_documents: Sequence[KnowledgeDocument] | None = None,
    ) -> None:
        # Keep provider construction lazy. Invalid HTTP requests should still receive
        # normal validation responses even when the optional AI provider is not configured.
        self._provider = provider
        self._knowledge_documents = (
            list(knowledge_documents) if knowledge_documents is not None else None
        )

    async def answer(self, question: str) -> AIChatResponse:
        retrieved = retrieve_knowledge(question, documents=self._knowledge_documents)
        if not retrieved:
            return AIChatResponse(
                answer=INSUFFICIENT_INFORMATION_MESSAGE,
                sources=[],
                grounded=False,
                fallback=True,
            )

        user_prompt = build_grounded_user_prompt(question, retrieved)
        try:
            provider = self._provider or OpenAICompatibleProvider.from_environment()
            raw_answer = await provider.generate(
                system_prompt=GROUNDING_SYSTEM_PROMPT,
                user_prompt=user_prompt,
            )
            answer = _validate_provider_answer(raw_answer)
        except (AIProviderError, TypeError, ValueError):
            logger.warning("AI provider returned an unavailable, malformed, or unsafe answer")
            return AIChatResponse(
                answer=PROVIDER_UNAVAILABLE_MESSAGE,
                sources=[],
                grounded=False,
                fallback=True,
            )
        except Exception:
            logger.warning("AI provider request failed unexpectedly")
            return AIChatResponse(
                answer=PROVIDER_UNAVAILABLE_MESSAGE,
                sources=[],
                grounded=False,
                fallback=True,
            )

        return AIChatResponse(
            answer=answer,
            sources=[
                AIResponseSource(
                    source_id=result.document.source_id,
                    title=result.document.title,
                )
                for result in retrieved
            ],
            grounded=True,
            fallback=False,
        )
