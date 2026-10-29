from typing import Optional, List
from pydantic import BaseModel, Field


class GroqConfigUpdate(BaseModel):
    groq_api_key: str = Field(..., description="Groq API key starting with gsk_")
    groq_model: Optional[str] = Field("llama-3.3-70b-versatile", description="Groq model ID")
    groq_stt_model: Optional[str] = Field("whisper-large-v3-turbo", description="Groq Whisper model ID")


class GroqTestRequest(BaseModel):
    groq_api_key: Optional[str] = Field(None, description="Groq API key to test. If omitted, uses current configured key.")
    groq_model: Optional[str] = Field(None, description="Groq model ID to test")


class GroqTestResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
    latency_ms: Optional[int] = None
    model: Optional[str] = None
    available_models: List[str] = []
