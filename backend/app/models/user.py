import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=True)
    avatar_url = Column(Text, nullable=True)
    language = Column(String(2), default="ar")
    google_id = Column(String(255), nullable=True, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    subjects = relationship("Subject", back_populates="user", cascade="all, delete-orphan")
    ai_settings = relationship("UserAISetting", back_populates="user", cascade="all, delete-orphan")
    exam_results = relationship("ExamResult", back_populates="user", cascade="all, delete-orphan")
    flashcard_progress = relationship("FlashcardProgress", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
