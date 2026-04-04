from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime
import uuid


class ProgressResponse(BaseModel):
    total_subjects: int
    total_chapters: int
    total_flashcards_known: int
    total_flashcards: int
    avg_quiz_score: float
    subjects_progress: List[Dict[str, Any]]


class SubjectProgressResponse(BaseModel):
    subject_id: uuid.UUID
    subject_name: str
    progress_percentage: float
    chapters_count: int
    flashcards_known: int
    avg_score: float
    last_activity: Any = None
