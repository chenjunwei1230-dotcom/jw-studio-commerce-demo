from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.domain.ai import AIChatRequest, AIChatResponse
from app.services.ai.service import AIService


router = APIRouter(prefix="/api/ai", tags=["ai"])


def get_ai_service() -> AIService:
    """Build the service per request so protected environment config is not global state."""

    return AIService()


@router.post("/chat", response_model=AIChatResponse)
async def chat(
    request: AIChatRequest,
    service: Annotated[AIService, Depends(get_ai_service)],
) -> AIChatResponse:
    return await service.answer(request.question)
