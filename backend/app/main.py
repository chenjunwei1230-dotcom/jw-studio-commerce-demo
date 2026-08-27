import os

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.ai import router as ai_router
from app.api.checkout import router as checkout_router
from app.api.products import router as products_router


app = FastAPI(
    title="JW Studio 2.0 API",
    version="0.1.0",
    description="Backend foundation for the fictional JW Studio 2.0 learning project.",
)


def configured_cors_origins() -> list[str]:
    """Return explicit browser origins configured for a deployed frontend."""

    configured = os.getenv("CORS_ALLOWED_ORIGINS", "")
    origins: list[str] = []
    for origin in configured.split(","):
        normalized = origin.strip().rstrip("/")
        if normalized and normalized != "*" and normalized not in origins:
            origins.append(normalized)
    return origins


cors_origins = configured_cors_origins()
if cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Accept", "Content-Type"],
    )


def _validation_field(location: tuple[object, ...]) -> str:
    parts: list[str] = []
    for part in location:
        if part == "body":
            continue
        if isinstance(part, int) and parts:
            parts[-1] = f"{parts[-1]}[{part}]"
        else:
            parts.append(str(part))
    return ".".join(parts) or "request"


@app.exception_handler(RequestValidationError)
async def request_validation_error_handler(
    _request: Request, error: RequestValidationError
) -> JSONResponse:
    issues = []
    for validation_error in error.errors():
        error_type = str(validation_error.get("type", "invalid_request"))
        if error_type == "extra_forbidden":
            message = "This field is not accepted."
        elif error_type == "missing":
            message = "This field is required."
        elif error_type == "literal_error":
            message = "Choose an approved demo value."
        else:
            message = "Enter a valid value."
        issues.append(
            {
                "field": _validation_field(tuple(validation_error.get("loc", ()))),
                "code": error_type,
                "message": message,
            }
        )

    return JSONResponse(
        status_code=422,
        content={
            "error": "invalid_request",
            "message": "Review the request fields and try again.",
            "issues": issues,
        },
    )


@app.get("/api/health")
def health_check() -> dict[str, str]:
    """Confirm that the backend process is available."""

    return {"status": "ok", "service": "jw-studio-api"}


app.include_router(products_router)
app.include_router(checkout_router)
app.include_router(ai_router)
