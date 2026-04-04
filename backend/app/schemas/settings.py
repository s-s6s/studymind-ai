from pydantic import BaseModel
from typing import Optional
import uuid


class AIProviderCreate(BaseModel):
    provider: str  # openai, anthropic, google
    model_name: str
    api_key: str
    is_active: bool = False


class AIProviderUpdate(BaseModel):
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    is_active: Optional[bool] = None


class AIProviderResponse(BaseModel):
    id: uuid.UUID
    provider: str
    model_name: str
    is_active: bool

    class Config:
        from_attributes = True


class TestAPIKeyRequest(BaseModel):
    provider: str
    model_name: str
    api_key: str


class TestAPIKeyResponse(BaseModel):
    success: bool
    message: str
