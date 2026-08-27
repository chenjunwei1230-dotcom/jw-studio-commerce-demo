from fastapi import APIRouter, HTTPException

from app.domain.product import Product
from app.services.catalog import (
    CatalogUnavailableError,
    fetch_product,
    fetch_products,
)


router = APIRouter(prefix="/api", tags=["catalog"])


def catalog_unavailable_response() -> HTTPException:
    return HTTPException(
        status_code=503,
        detail="The product catalog is temporarily unavailable.",
    )


@router.get("/products", response_model=list[Product])
def list_products() -> list[Product]:
    try:
        return fetch_products()
    except CatalogUnavailableError as error:
        raise catalog_unavailable_response() from error


@router.get("/products/{product_id}", response_model=Product)
def get_product(product_id: str) -> Product:
    try:
        product = fetch_product(product_id)
    except CatalogUnavailableError as error:
        raise catalog_unavailable_response() from error

    if product is None:
        raise HTTPException(status_code=404, detail="Product not found.")
    return product
