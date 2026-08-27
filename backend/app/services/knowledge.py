from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from app.domain.knowledge import KnowledgeDocument, KnowledgeTopic
from app.domain.product import Product


class KnowledgeBaseValidationError(ValueError):
    """Raised when approved knowledge source documents are not safe to use."""


@dataclass(frozen=True)
class RetrievedKnowledge:
    """A small, deterministic retrieval result for an approved source document."""

    document: KnowledgeDocument
    score: int
    matched_terms: tuple[str, ...]


_TOKEN_PATTERN = re.compile(r"[a-z0-9]+")
_STOP_WORDS = frozenset(
    {
        "a",
        "about",
        "and",
        "are",
        "can",
        "does",
        "for",
        "how",
        "i",
        "in",
        "is",
        "it",
        "me",
        "of",
        "on",
        "or",
        "the",
        "this",
        "to",
        "what",
        "which",
        "with",
        "you",
    }
)
_BOUNDARY_QUERY_TERMS = frozenset(
    {
        "amount",
        "availability",
        "inventory",
        "order",
        "payment",
        "price",
        "prices",
        "refund",
        "shipping",
        "stock",
        "total",
        "totals",
    }
)


def default_knowledge_path() -> Path:
    return Path(__file__).resolve().parents[2] / "data" / "knowledge"


def _records_from_payload(payload: Any, source_path: Path) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        records = payload
    elif isinstance(payload, dict) and isinstance(payload.get("documents"), list):
        records = payload["documents"]
    elif isinstance(payload, dict):
        records = [payload]
    else:
        raise KnowledgeBaseValidationError(
            f"knowledge source {source_path.name} must contain an object or list"
        )

    if any(not isinstance(record, dict) for record in records):
        raise KnowledgeBaseValidationError(
            f"knowledge source {source_path.name} contains a non-object document"
        )
    return records


def load_knowledge_documents(
    knowledge_path: Path | None = None,
) -> list[KnowledgeDocument]:
    source_root = knowledge_path or default_knowledge_path()
    if not source_root.exists():
        raise KnowledgeBaseValidationError("the knowledge source directory does not exist")

    documents: list[KnowledgeDocument] = []
    source_files = sorted(source_root.glob("*.json"))
    if not source_files:
        raise KnowledgeBaseValidationError("the knowledge source directory is empty")

    for source_path in source_files:
        payload = json.loads(source_path.read_text(encoding="utf-8"))
        documents.extend(
            KnowledgeDocument.model_validate(record)
            for record in _records_from_payload(payload, source_path)
        )
    return documents


def _search_terms(value: str) -> set[str]:
    return {
        term
        for term in _TOKEN_PATTERN.findall(value.lower())
        if term not in _STOP_WORDS
    }


def retrieve_knowledge(
    query: str,
    documents: list[KnowledgeDocument] | None = None,
    limit: int = 3,
) -> list[RetrievedKnowledge]:
    """Retrieve only approved synthetic documents using deterministic lexical search.

    This intentionally stays small and inspectable for the learning version. A future
    task may replace the scoring implementation with a vector store without changing
    the provider or API boundary.
    """

    if limit <= 0:
        return []

    query_terms = _search_terms(query.strip())
    if not query_terms:
        return []

    source_documents = documents if documents is not None else load_knowledge_documents()
    boundary_query = bool(query_terms & _BOUNDARY_QUERY_TERMS) or bool(
        re.search(r"\b(?:are you|who are you)\b", query.lower())
    )
    results: list[RetrievedKnowledge] = []

    for document in source_documents:
        if document.synthetic is not True or document.approved_for_rag is not True:
            continue

        title_terms = _search_terms(document.title)
        content_terms = _search_terms(document.content)
        matched_terms = query_terms & (title_terms | content_terms)
        is_boundary_document = document.topic == KnowledgeTopic.BOUNDARIES
        if not matched_terms and not (boundary_query and is_boundary_document):
            continue

        score = sum(3 if term in title_terms else 1 for term in matched_terms)
        if boundary_query and is_boundary_document:
            # Keep the explicit refusal/uncertainty source in context for commerce
            # and identity questions even when a product name matches more strongly.
            score += 12
        results.append(
            RetrievedKnowledge(
                document=document,
                score=score,
                matched_terms=tuple(sorted(matched_terms)),
            )
        )

    results.sort(key=lambda result: (-result.score, result.document.source_id))
    return results[:limit]


def validate_knowledge_base(
    documents: list[KnowledgeDocument],
    products: list[Product],
) -> None:
    if not documents:
        raise KnowledgeBaseValidationError("the knowledge base must contain documents")

    source_ids = [document.source_id for document in documents]
    if len(source_ids) != len(set(source_ids)):
        raise KnowledgeBaseValidationError("knowledge source IDs must be unique")

    if any(not document.synthetic or not document.approved_for_rag for document in documents):
        raise KnowledgeBaseValidationError(
            "every knowledge document must be approved synthetic learning content"
        )

    if any(re.search(r"[\u3400-\u9fff]", f"{document.title} {document.content}") for document in documents):
        raise KnowledgeBaseValidationError("knowledge user-facing content must be English-only")

    product_by_id = {product.id: product for product in products}
    product_documents = [
        document for document in documents if document.topic == KnowledgeTopic.PRODUCT
    ]
    product_ids = [document.product_id for document in product_documents]

    if len(product_documents) != len(products) or set(product_ids) != set(product_by_id):
        raise KnowledgeBaseValidationError(
            "product knowledge documents must cover the authoritative product catalog exactly"
        )

    for document in product_documents:
        product = product_by_id.get(document.product_id or "")
        if product is None or document.facts is None:
            raise KnowledgeBaseValidationError("product knowledge contains an unknown product")

        if (
            document.facts.name != product.name
            or document.facts.category != product.category
            or document.facts.description != product.description
            or document.facts.materials != product.materials
            or document.facts.care_instructions != product.care_instructions
            or document.facts.options != product.options
            or document.facts.design_meaning != product.design_meaning
            or document.facts.creator_recommendation != product.creator_recommendation
        ):
            raise KnowledgeBaseValidationError(
                f"product knowledge facts do not match catalog for {product.id}"
            )

    boundary_documents = [
        document for document in documents if document.topic == KnowledgeTopic.BOUNDARIES
    ]
    boundary_text = " ".join(document.content.lower() for document in boundary_documents)
    if "not enough information" not in boundary_text:
        raise KnowledgeBaseValidationError("the knowledge base needs an uncertainty boundary")
    for boundary in ("real-time stock", "order status", "shipping status", "payment status"):
        if boundary not in boundary_text:
            raise KnowledgeBaseValidationError(f"the uncertainty boundary must mention {boundary}")
