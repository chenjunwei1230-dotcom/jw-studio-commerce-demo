from app.services.catalog import DEFAULT_DATABASE_PATH, seed_catalog


if __name__ == "__main__":
    count = seed_catalog()
    print(f"Seeded {count} products into {DEFAULT_DATABASE_PATH}")
