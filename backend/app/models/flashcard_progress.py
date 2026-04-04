import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class FlashcardProgress(Base):
    __tablename__ = "flashcard_progress"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    flashcard_id = Column(String(100), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(10), default="review")  # known, review
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint("user_id", "flashcard_id", "chapter_id", name="uq_user_flashcard_chapter"),
    )

    # Relationships
    user = relationship("User", back_populates="flashcard_progress")
    chapter = relationship("Chapter", back_populates="flashcard_progress")
