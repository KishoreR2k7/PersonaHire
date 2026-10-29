import time
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, HTTPException, status
import httpx

from app.services.ai_service import AIService
from app.core.config import settings
from app.schemas.diagnostics import GroqConfigUpdate, GroqTestRequest, GroqTestResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/diagnostics", tags=["System Diagnostics"])


def _sync_env_files(updates: Dict[str, str]):
    """Safely updates key=value entries in both backend/.env and root .env."""
    current_file = Path(__file__).resolve()
    env_paths = [
        current_file.parent.parent.parent / ".env",          # backend/.env
        current_file.parent.parent.parent.parent / ".env"   # root .env
    ]
    for p in env_paths:
        try:
            if not p.exists():
                lines = []
            else:
                lines = p.read_text(encoding="utf-8").splitlines()

            updated_keys = set()
            new_lines = []
            for line in lines:
                matched = False
                for k, v in updates.items():
                    if line.strip().startswith(f"{k}=") or line.strip() == k:
                        new_lines.append(f"{k}={v}")
                        updated_keys.add(k)
                        matched = True
                        break
                if not matched:
                    new_lines.append(line)

            # Append any keys that weren't present
            for k, v in updates.items():
                if k not in updated_keys:
                    new_lines.append(f"{k}={v}")

            p.write_text("\n".join(new_lines) + "\n", encoding="utf-8")
            logger.info(f"Synchronized configuration to {p}")
        except Exception as e:
            logger.warning(f"Could not update {p}: {e}")


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


@router.post("/test-groq", response_model=GroqTestResponse)
async def test_groq_connection(payload: GroqTestRequest):
    """
    Validates a Groq API key by querying the Groq models endpoint
    and performing a live test completion. Returns available models and latency.
    """
    key = (payload.groq_api_key or settings.GROQ_API_KEY or "").strip()
    if not key:
        return GroqTestResponse(
            success=False,
            error="No Groq API key provided or currently configured."
        )

    start_time = time.time()
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }

    # Step 1: Query models list to verify authentication
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            models_resp = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers=headers
            )
    except Exception as e:
        return GroqTestResponse(
            success=False,
            error=f"Could not reach Groq API: {str(e)}"
        )

    if models_resp.status_code == 401:
        return GroqTestResponse(
            success=False,
            error="Invalid Groq API key. Authentication failed (401 Unauthorized). Please check your key at https://console.groq.com/keys"
        )
    elif models_resp.status_code != 200:
        return GroqTestResponse(
            success=False,
            error=f"Groq API error ({models_resp.status_code}): {models_resp.text[:200]}"
        )

    try:
        raw_models = models_resp.json().get("data", [])
        available_models = [m.get("id", "") for m in raw_models if isinstance(m, dict) and m.get("id")]
    except Exception:
        available_models = []

    # Filter/prioritize models for chat completions
    chat_models = [
        m for m in available_models
        if not any(skip in m.lower() for skip in ["whisper", "guard", "audio", "orpheus"])
    ]

    # Pick model to test
    target_model = payload.groq_model
    if not target_model:
        if settings.GROQ_MODEL in available_models:
            target_model = settings.GROQ_MODEL
        elif chat_models:
            target_model = chat_models[0]
        elif available_models:
            target_model = available_models[0]
        else:
            target_model = "llama-3.3-70b-versatile"

    # Step 2: Perform live test completion
    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            chat_resp = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json={
                    "model": target_model,
                    "messages": [{"role": "user", "content": "Respond with 'active'."}],
                    "max_tokens": 10
                }
            )
            latency_ms = int((time.time() - start_time) * 1000)

            if chat_resp.status_code == 200:
                return GroqTestResponse(
                    success=True,
                    message=f"Groq API verified successfully! Connected to '{target_model}' in {latency_ms}ms.",
                    latency_ms=latency_ms,
                    model=target_model,
                    available_models=available_models
                )
            else:
                err_data = {}
                try:
                    err_data = chat_resp.json().get("error", {})
                except Exception:
                    pass
                err_msg = err_data.get("message") or chat_resp.text[:200]
                return GroqTestResponse(
                    success=False,
                    error=f"Groq test with model '{target_model}' failed ({chat_resp.status_code}): {err_msg}",
                    latency_ms=latency_ms,
                    model=target_model,
                    available_models=available_models
                )
    except Exception as e:
        latency_ms = int((time.time() - start_time) * 1000)
        return GroqTestResponse(
            success=False,
            error=f"Groq completion request failed: {str(e)}",
            latency_ms=latency_ms,
            model=target_model,
            available_models=available_models
        )


@router.post("/groq-config")
def update_groq_config(payload: GroqConfigUpdate):
    """
    Saves a new Groq API key and model selection into memory settings
    and persists them into the .env files.
    """
    key = payload.groq_api_key.strip()
    if not key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Groq API key cannot be empty."
        )

    model = (payload.groq_model or "llama-3.3-70b-versatile").strip()
    stt_model = (payload.groq_stt_model or "whisper-large-v3-turbo").strip()

    # Update in-memory settings
    settings.GROQ_API_KEY = key
    settings.GROQ_MODEL = model
    settings.GROQ_STT_MODEL = stt_model
    settings.AI_PRIMARY_PROVIDER = "groq"

    # Persist to .env files
    _sync_env_files({
        "GROQ_API_KEY": key,
        "GROQ_MODEL": model,
        "GROQ_STT_MODEL": stt_model,
        "AI_PRIMARY_PROVIDER": "groq"
    })

    current_status = AIService.get_provider_status()
    current_status["message"] = f"Groq API key and model '{model}' saved and activated successfully."
    return current_status


@router.post("/groq-config/clear")
def clear_groq_config():
    """
    Clears the configured Groq API key, falling back to OpenRouter or the Heuristic Engine.
    """
    settings.GROQ_API_KEY = None

    _sync_env_files({
        "GROQ_API_KEY": ""
    })

    current_status = AIService.get_provider_status()
    current_status["message"] = "Groq API key removed. Using fallback engine."
    return current_status
