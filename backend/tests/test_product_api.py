import sqlite3
import uuid
from collections import Counter
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services import catalog as catalog_service
from app.services.catalog import seed_catalog


@pytest.fixture()
def catalog_database(monkeypatch: pytest.MonkeyPatch) -> Path:
    test_root = Path(__file__).resolve().parents[1] / ".test-tmp"
    test_root.mkdir(exist_ok=True)
    database_path = test_root / f"api-{uuid.uuid4().hex}.sqlite3"
    seed_catalog(database_path)
    monkeypatch.setattr(catalog_service, "DEFAULT_DATABASE_PATH", database_path)

    try:
        yield database_path
    finally:
        database_path.unlink(missing_ok=True)


@pytest.fixture()
def client() -> TestClient:
    return TestClient(app)


def test_list_products_returns_the_authoritative_catalog(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.get("/api/products")

    assert response.status_code == 200
    products = response.json()
    assert len(products) == 13
    assert Counter(product["category"] for product in products) == {
        "decorative": 5,
        "clothing": 5,
        "headwear": 3,
    }
    assert all(product["currency"] == "MYR" for product in products)


def test_list_products_reads_from_sqlite_not_api_hardcoded_data(
    client: TestClient, catalog_database: Path
) -> None:
    connection = sqlite3.connect(catalog_database)
    try:
        connection.execute(
            "UPDATE products SET name = ? WHERE id = ?",
            ("Database Source Product", "keep-showing-up-keychain"),
        )
        connection.commit()
    finally:
        connection.close()

    response = client.get("/api/products")

    assert response.status_code == 200
    edited_product = next(
        product
        for product in response.json()
        if product["id"] == "keep-showing-up-keychain"
    )
    assert edited_product["name"] == "Database Source Product"


def test_get_product_returns_complete_product_data(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.get("/api/products/keep-showing-up-keychain")

    assert response.status_code == 200
    product = response.json()
    assert product["id"] == "keep-showing-up-keychain"
    assert {
        "id",
        "name",
        "category",
        "price",
        "currency",
        "description",
        "materials",
        "care_instructions",
        "image_reference",
        "image_alt_text",
        "image_variants",
        "options",
        "design_meaning",
        "creator_recommendation",
    }.issubset(product)


def test_product_image_variant_matches_the_selected_clothing_colour(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.get("/api/products/keep-showing-up-tee")

    assert response.status_code == 200
    variant = response.json()["image_variants"]["colour"]["Deep Blue"]
    assert variant == {
        "image_reference": "/assets/products/keep-showing-up-tee-deep-blue.jpg",
        "image_alt_text": "Deep blue cotton tee with a small frame mark on the front",
    }


def test_get_unknown_product_returns_not_found(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.get("/api/products/does-not-exist")

    assert response.status_code == 404
    assert response.json() == {"detail": "Product not found."}


def test_catalog_failure_returns_safe_error(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    missing_database = (
        Path(__file__).resolve().parents[1]
        / ".test-tmp"
        / f"missing-{uuid.uuid4().hex}.sqlite3"
    )
    monkeypatch.setattr(catalog_service, "DEFAULT_DATABASE_PATH", missing_database)

    response = client.get("/api/products")

    assert response.status_code == 503
    assert response.json() == {
        "detail": "The product catalog is temporarily unavailable."
    }


def test_catalog_connection_is_closed_after_request(
    client: TestClient, catalog_database: Path
) -> None:
    response = client.get("/api/products")

    assert response.status_code == 200
    catalog_database.unlink()
    assert not catalog_database.exists()
