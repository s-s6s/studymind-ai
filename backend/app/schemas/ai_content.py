from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime
import uuid


class GenerateRequest(BaseModel):
    chapter_id: uuid.UUID
    detail_level: str = "medium"  # concise, medium, detailed
    language: str = "ar"


class GenerateAllRequest(BaseModel):
    chapter_id: uuid.UUID
    detail_level: str = "medium"
    language: str = "ar"


class ChatRequest(BaseModel):
    subject_id: uuid.UUID
    chapter_id: Optional[uuid.UUID] = None
    message: str
    language: str = "ar"


class ChatMessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class GeneratedContentResponse(BaseModel):
    id: uuid.UUID
    chapter_id: uuid.UUID
    content_type: str
    content_data: Dict[str, Any]
    ai_provider: Optional[str] = None
    ai_model: Optional[str] = None
    detail_level: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PartialExamRequest(BaseModel):
    chapter_ids: List[uuid.UUID]
    exam_type: str  # midterm, final, quick
    language: str = "ar"
