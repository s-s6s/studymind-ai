from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class SubjectCreate(BaseModel):
    name: str
    color: Optional[str] = "#6C63FF"
    icon: Optional[str] = None
    exam_date: Optional[datetime] = None
    reminder_enabled: bool = True


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    exam_date: Optional[datetime] = None
    reminder_enabled: Optional[bool] = None


class SetExamDateRequest(BaseModel):
    exam_date: datetime
    reminder_enabled: bool = True


class SubjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    color: str
    icon: Optional[str] = None
    exam_date: Optional[datetime] = None
    reminder_enabled: bool
    created_at: datetime
    updated_at: datetime
    chapter_count: int = 0
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True
