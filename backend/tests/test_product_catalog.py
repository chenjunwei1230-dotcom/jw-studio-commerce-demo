import sqlite3
from pathlib import Path
from tempfile import TemporaryDirectory

from app.domain.product import (
    EXPECTED_CATEGORY_COUNTS,
    ProductCategory,
    load_seed_products,
    validate_catalog_shape,
)
from app.services.catalog import seed_catalog


def test_seed_catalog_has_exact_count_and_categories() -> None:
    products = load_seed_products()

    validate_catalog_shape(products)

    assert len(products) == 13
    assert {category: sum(product.category == category for product in products) for category in EXPECTED_CATEGORY_COUNTS} == {
        ProductCategory.DECORATIVE: 5,
        ProductCategory.CLOTHING: 5,
        ProductCategory.HEADWEAR: 3,
    }


def test_seed_catalog_has_unique_ids_and_required_fields() -> None:
    products = load_seed_products()
    product_ids = [product.id for product in products]

    assert len(product_ids) == len(set(product_ids))
    for product in products:
        assert product.id
        assert product.name
        assert product.category in EXPECTED_CATEGORY_COUNTS
        assert product.price >= 0
        assert product.currency == "MYR"
        assert product.description
        assert product.materials
        assert product.care_instructions
        assert product.image_reference
        assert product.image_alt_text
        for option_variants in product.image_variants.values():
            for variant in option_variants.values():
                assert variant.image_reference
                assert variant.image_alt_text
        assert product.options
        assert product.design_meaning
        assert product.creator_recommendation


def test_seed_is_idempotent_and_does_not_create_duplicate_rows() -> None:
    test_root = Path(__file__).resolve().parents[1] / ".test-tmp"
    test_root.mkdir(exist_ok=True)

    with TemporaryDirectory(dir=test_root) as temporary_directory:
        database_path = Path(temporary_directory) / "catalog.sqlite3"

        assert seed_catalog(database_path) == 13
        assert seed_catalog(database_path) == 13

        connection = sqlite3.connect(database_path)
        try:
            row = connection.execute("SELECT COUNT(*) FROM products").fetchone()
        finally:
            connection.close()

        assert row == (13,)
