from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
import uuid


class ExamResultCreate(BaseModel):
    chapter_id: Optional[uuid.UUID] = None
    subject_id: Optional[uuid.UUID] = None
    exam_type: str
    score: float
    total_questions: int
    correct_answers: int
    time_taken_seconds: Optional[int] = None
    questions_data: Optional[Dict[str, Any]] = None


class ExamResultResponse(BaseModel):
    id: uuid.UUID
    exam_type: str
    score: float
    total_questions: int
    correct_answers: int
    time_taken_seconds: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FlashcardProgressUpdate(BaseModel):
    flashcard_id: str
    chapter_id: uuid.UUID
    status: str  # known, review
