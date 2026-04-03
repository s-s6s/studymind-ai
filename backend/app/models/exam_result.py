import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ExamResult(Base):
    __tablename__ = "exam_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("chapters.id", ondelete="SET NULL"), nullable=True)
    subject_id = Column(UUID(as_uuid=True), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    exam_type = Column(String(20), nullable=False)  # mcq, partial, midterm, final, quick
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    time_taken_seconds = Column(Integer, nullable=True)
    questions_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="exam_results")
    chapter = relationship("Chapter", back_populates="exam_results")
    subject = relationship("Subject", back_populates="exam_results")
