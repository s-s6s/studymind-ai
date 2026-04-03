import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class GeneratedContent(Base):
    __tablename__ = "generated_contents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False, index=True)
    content_type = Column(String(20), nullable=False)  # summary, flashcards, mcq, cheatsheet, mindmap, glossary
    content_data = Column(JSONB, nullable=False)
    ai_provider = Column(String(50), nullable=True)
    ai_model = Column(String(100), nullable=True)
    detail_level = Column(String(20), default="medium")  # concise, medium, detailed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    chapter = relationship("Chapter", back_populates="generated_contents")
