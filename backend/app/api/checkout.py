from fastapi import APIRouter, HTTPException

from app.domain.checkout import (
    CheckoutErrorResponse,
    CheckoutRequest,
    CheckoutResult,
    CheckoutValidationError,
)
from app.services.catalog import CatalogUnavailableError
from app.services.checkout import calculate_demo_checkout


router = APIRouter(prefix="/api/demo", tags=["demo checkout"])


@router.post("/checkout", response_model=CheckoutResult)
def demo_checkout(request: CheckoutRequest) -> CheckoutResult:
    try:
        return calculate_demo_checkout(request)
    except CheckoutValidationError as error:
        error_response = CheckoutErrorResponse(
            error="checkout_validation_error",
            message="Review the highlighted checkout fields and try again.",
            issues=error.issues,
        )
        raise HTTPException(status_code=422, detail=error_response.model_dump()) from error
    except CatalogUnavailableError as error:
        raise HTTPException(
            status_code=503,
            detail="The product catalog is temporarily unavailable.",
        ) from error
