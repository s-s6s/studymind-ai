from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class ChapterCreate(BaseModel):
    title: str
    order_index: int = 0


class ChapterUpdate(BaseModel):
    title: Optional[str] = None
    order_index: Optional[int] = None


class ChapterReorderItem(BaseModel):
    id: uuid.UUID
    order_index: int


class ChapterReorderRequest(BaseModel):
    chapters: List[ChapterReorderItem]


class ChapterResponse(BaseModel):
    id: uuid.UUID
    subject_id: uuid.UUID
    title: str
    order_index: int
    is_auto_detected: bool
    progress_percentage: float
    created_at: datetime

    class Config:
        from_attributes = True
