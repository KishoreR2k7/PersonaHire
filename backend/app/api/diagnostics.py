from fastapi import APIRouter
from app.services.ai_service import AIService
from app.core.config import settings

router = APIRouter(prefix="/diagnostics", tags=["System Diagnostics"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


@router.get("/ai-status")
def ai_status():
    return AIService.get_provider_status()
