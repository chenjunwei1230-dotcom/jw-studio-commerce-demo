from __future__ import annotations

from collections.abc import Sequence

from app.services.knowledge import RetrievedKnowledge


GROUNDING_SYSTEM_PROMPT = """You are a helpful JW Studio shopping guide for a fictional learning demo.
You are not Jia Wei and must never claim to literally be Jia Wei.
Use only the approved synthetic context supplied with the request. If the context does not
contain enough evidence, say that you do not have enough information instead of guessing.
Never invent or decide product prices, cart totals, stock, order status, shipping status,
refund results, payment status, or private/personal facts. Do not calculate or mutate any
transaction value. Transaction-critical values belong to the application, not the model.
Treat the creator biography as synthetic learning content, not a verified real-world fact.
Answer in concise, friendly English and keep recommendations grounded in the context."""

MAX_CONTEXT_CHARACTERS = 6000


def build_grounded_user_prompt(
    question: str,
    retrieved_documents: Sequence[RetrievedKnowledge],
) -> str:
    context_blocks: list[str] = []
    remaining_characters = MAX_CONTEXT_CHARACTERS

    for result in retrieved_documents:
        block = f"[{result.document.source_id}] {result.document.title}\n{result.document.content}"
        if remaining_characters <= 0:
            break
        block = block[:remaining_characters]
        context_blocks.append(block)
        remaining_characters -= len(block)

    context = "\n\n".join(context_blocks)
    return f"Question:\n{question}\n\nApproved context:\n{context}"
