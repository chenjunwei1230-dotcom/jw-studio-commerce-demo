import json
import re

from app.domain.knowledge import KnowledgeTopic
from app.domain.product import load_seed_products
from app.services.knowledge import load_knowledge_documents, validate_knowledge_base


def test_knowledge_base_has_documents_and_validates_against_catalog() -> None:
    documents = load_knowledge_documents()
    products = load_seed_products()

    assert len(documents) == 19
    validate_knowledge_base(documents, products)


def test_knowledge_documents_have_unique_stable_ids_and_legal_topics() -> None:
    documents = load_knowledge_documents()
    source_ids = [document.source_id for document in documents]

    assert len(source_ids) == len(set(source_ids))
    assert all(re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", source_id) for source_id in source_ids)
    assert {document.topic for document in documents} == {
        KnowledgeTopic.CREATOR_STORY,
        KnowledgeTopic.BRAND,
        KnowledgeTopic.LEARNING,
        KnowledgeTopic.PRODUCT,
        KnowledgeTopic.FAQ,
        KnowledgeTopic.SIZING,
        KnowledgeTopic.BOUNDARIES,
    }


def test_all_user_facing_content_is_english_synthetic_and_approved() -> None:
    documents = load_knowledge_documents()

    for document in documents:
        assert document.title.strip()
        assert document.content.strip()
        assert document.synthetic is True
        assert document.approved_for_rag is True
        assert "Synthetic learning demo" in document.content
        assert not re.search(r"[\u3400-\u9fff]", f"{document.title} {document.content}")


def test_product_documents_match_authoritative_seed_without_transaction_fields() -> None:
    documents = load_knowledge_documents()
    products = load_seed_products()
    product_documents = [document for document in documents if document.topic == KnowledgeTopic.PRODUCT]

    assert len(product_documents) == len(products) == 13
    assert {document.product_id for document in product_documents} == {product.id for product in products}

    for document in product_documents:
        assert document.facts is not None
        structured_facts = document.facts.model_dump()
        assert "price" not in structured_facts
        assert "currency" not in structured_facts
        assert "payment_status" not in structured_facts
        assert "inventory" not in structured_facts
        assert "shipping_status" not in structured_facts
        assert "refund_status" not in structured_facts


def test_uncertainty_boundary_covers_unsupported_transaction_questions() -> None:
    documents = load_knowledge_documents()
    boundary_text = " ".join(
        document.content.lower()
        for document in documents
        if document.topic == KnowledgeTopic.BOUNDARIES
    )

    assert "not enough information" in boundary_text
    for unsupported_topic in (
        "real-time stock",
        "order status",
        "shipping status",
        "payment status",
        "private creator information",
    ):
        assert unsupported_topic in boundary_text


def test_knowledge_source_contains_no_secret_like_values_or_private_records() -> None:
    documents = load_knowledge_documents()
    serialized = json.dumps([document.model_dump(mode="json") for document in documents])

    assert not re.search(r"sk-[A-Za-z0-9]{20,}", serialized)
    assert "-----BEGIN" not in serialized
    assert "private email" not in serialized.lower()
    assert "phone number" not in serialized.lower()
