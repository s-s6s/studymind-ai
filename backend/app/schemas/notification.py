from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    body: Optional[str] = None
    is_read: bool
    subject_id: Optional[uuid.UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
