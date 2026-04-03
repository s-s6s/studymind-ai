import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Chapter(Base):
    __tablename__ = "chapters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    order_index = Column(Integer, default=0)
    is_auto_detected = Column(Boolean, default=False)
    progress_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    subject = relationship("Subject", back_populates="chapters")
    files = relationship("File", back_populates="chapter", cascade="all, delete-orphan")
    generated_contents = relationship("GeneratedContent", back_populates="chapter", cascade="all, delete-orphan")
    exam_results = relationship("ExamResult", back_populates="chapter")
    flashcard_progress = relationship("FlashcardProgress", back_populates="chapter", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="chapter")
