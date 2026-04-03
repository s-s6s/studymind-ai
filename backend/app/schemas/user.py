from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    name: str
    avatar_url: Optional[str] = None
    language: str = "ar"
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UpdateLanguageRequest(BaseModel):
    language: str  # "ar" or "en"
