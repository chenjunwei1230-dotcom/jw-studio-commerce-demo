from __future__ import annotations

import json
import sqlite3
from decimal import Decimal
from pathlib import Path
from typing import Iterable

from app.domain.product import Product, default_seed_path, load_seed_products, validate_catalog_shape


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "catalog.sqlite3"


class CatalogUnavailableError(RuntimeError):
    """Raised when the authoritative catalog cannot be read safely."""


CREATE_PRODUCTS_TABLE = """
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('decorative', 'clothing', 'headwear')),
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    currency TEXT NOT NULL,
    description TEXT NOT NULL,
    materials_json TEXT NOT NULL,
    care_instructions TEXT NOT NULL,
    options_json TEXT NOT NULL,
    image_reference TEXT NOT NULL,
    image_alt_text TEXT NOT NULL,
    image_variants_json TEXT NOT NULL DEFAULT '{}',
    design_meaning TEXT NOT NULL,
    creator_recommendation TEXT NOT NULL
)
"""


UPSERT_PRODUCT = """
INSERT INTO products (
    id,
    name,
    category,
    price_cents,
    currency,
    description,
    materials_json,
    care_instructions,
    options_json,
    image_reference,
    image_alt_text,
    image_variants_json,
    design_meaning,
    creator_recommendation
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    category = excluded.category,
    price_cents = excluded.price_cents,
    currency = excluded.currency,
    description = excluded.description,
    materials_json = excluded.materials_json,
    care_instructions = excluded.care_instructions,
    options_json = excluded.options_json,
    image_reference = excluded.image_reference,
    image_alt_text = excluded.image_alt_text,
    image_variants_json = excluded.image_variants_json,
    design_meaning = excluded.design_meaning,
    creator_recommendation = excluded.creator_recommendation
"""


def price_to_cents(price: Decimal) -> int:
    return int(price * 100)


def connect_database(database_path: Path = DEFAULT_DATABASE_PATH) -> sqlite3.Connection:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database(connection: sqlite3.Connection) -> None:
    connection.execute(CREATE_PRODUCTS_TABLE)
    columns = {
        row[1] for row in connection.execute("PRAGMA table_info(products)").fetchall()
    }
    if "care_instructions" not in columns:
        connection.execute(
            "ALTER TABLE products ADD COLUMN care_instructions TEXT NOT NULL DEFAULT ''"
        )
    if "image_variants_json" not in columns:
        connection.execute(
            "ALTER TABLE products ADD COLUMN image_variants_json TEXT NOT NULL DEFAULT '{}'"
        )
    connection.commit()


def seed_products(connection: sqlite3.Connection, products: Iterable[Product]) -> int:
    product_list = list(products)
    validate_catalog_shape(product_list)
    initialize_database(connection)
    connection.executemany(
        UPSERT_PRODUCT,
        [
            (
                product.id,
                product.name,
                product.category.value,
                price_to_cents(product.price),
                product.currency,
                product.description,
                json.dumps(product.materials),
                product.care_instructions,
                json.dumps(product.options),
                product.image_reference,
                product.image_alt_text,
                json.dumps(
                    {
                        option_name: {
                            option_value: variant.model_dump()
                            for option_value, variant in option_variants.items()
                        }
                        for option_name, option_variants in product.image_variants.items()
                    }
                ),
                product.design_meaning,
                product.creator_recommendation,
            )
            for product in product_list
        ],
    )
    connection.commit()
    return len(product_list)


def seed_catalog(
    database_path: Path = DEFAULT_DATABASE_PATH,
    seed_path: Path | None = None,
) -> int:
    products = load_seed_products(seed_path or default_seed_path())
    connection = connect_database(database_path)
    try:
        return seed_products(connection, products)
    finally:
        connection.close()


def connect_existing_database(database_path: Path | None = None) -> sqlite3.Connection:
    path = database_path or DEFAULT_DATABASE_PATH
    if not path.exists():
        raise CatalogUnavailableError("The product catalog is not available.")

    try:
        connection = sqlite3.connect(path)
        connection.row_factory = sqlite3.Row
        table = connection.execute(
            "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'products'"
        ).fetchone()
        if table is None:
            connection.close()
            raise CatalogUnavailableError("The product catalog is not available.")
        return connection
    except sqlite3.Error as error:
        raise CatalogUnavailableError("The product catalog could not be opened.") from error


def _row_to_product(row: sqlite3.Row) -> Product:
    return Product(
        id=row["id"],
        name=row["name"],
        category=row["category"],
        price=Decimal(row["price_cents"]) / Decimal(100),
        currency=row["currency"],
        description=row["description"],
        materials=json.loads(row["materials_json"]),
        care_instructions=row["care_instructions"],
        options=json.loads(row["options_json"]),
        image_reference=row["image_reference"],
        image_alt_text=row["image_alt_text"],
        image_variants=json.loads(row["image_variants_json"]),
        design_meaning=row["design_meaning"],
        creator_recommendation=row["creator_recommendation"],
    )


def fetch_products(database_path: Path | None = None) -> list[Product]:
    connection = connect_existing_database(database_path)
    try:
        rows = connection.execute(
            "SELECT * FROM products ORDER BY category, id"
        ).fetchall()
        return [_row_to_product(row) for row in rows]
    except (sqlite3.Error, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        raise CatalogUnavailableError("The product catalog could not be read.") from error
    finally:
        connection.close()


def fetch_product(product_id: str, database_path: Path | None = None) -> Product | None:
    connection = connect_existing_database(database_path)
    try:
        row = connection.execute(
            "SELECT * FROM products WHERE id = ?",
            (product_id,),
        ).fetchone()
        return None if row is None else _row_to_product(row)
    except (sqlite3.Error, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
        raise CatalogUnavailableError("The product catalog could not be read.") from error
    finally:
        connection.close()
