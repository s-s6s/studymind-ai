import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    color = Column(String(7), default="#6C63FF")
    icon = Column(String(50), nullable=True)
    exam_date = Column(DateTime(timezone=True), nullable=True)
    reminder_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="subjects")
    chapters = relationship("Chapter", back_populates="subject", cascade="all, delete-orphan")
    files = relationship("File", back_populates="subject", cascade="all, delete-orphan")
    exam_results = relationship("ExamResult", back_populates="subject")
    notifications = relationship("Notification", back_populates="subject")
    chat_messages = relationship("ChatMessage", back_populates="subject", cascade="all, delete-orphan")
