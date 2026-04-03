from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class FileResponse(BaseModel):
    id: uuid.UUID
    chapter_id: Optional[uuid.UUID] = None
    subject_id: uuid.UUID
    original_name: str
    file_type: str
    storage_url: str
    processing_status: str
    file_size_bytes: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FileProcessRequest(BaseModel):
    chapter_id: Optional[uuid.UUID] = None


class ChapterDetectRequest(BaseModel):
    pass


class SplitChaptersRequest(BaseModel):
    split: bool = True  # True = split into chapters, False = keep as one
