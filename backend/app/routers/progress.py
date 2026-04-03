from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.exam_result import ExamResult
from app.models.flashcard_progress import FlashcardProgress
from app.schemas.exam import ExamResultCreate, ExamResultResponse, FlashcardProgressUpdate
from app.schemas.progress import ProgressResponse, SubjectProgressResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["progress"])


@router.get("", response_model=ProgressResponse)
def get_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).all()
    total_flashcards_known = db.query(FlashcardProgress).filter(
        FlashcardProgress.user_id == current_user.id,
        FlashcardProgress.status == "known"
    ).count()
    total_flashcards = db.query(FlashcardProgress).filter(
        FlashcardProgress.user_id == current_user.id
    ).count()

    exam_results = db.query(ExamResult).filter(ExamResult.user_id == current_user.id).all()
    avg_score = sum(r.score for r in exam_results) / len(exam_results) if exam_results else 0.0

    subjects_progress = []
    total_chapters = 0
    for s in subjects:
        chapters = db.query(Chapter).filter(Chapter.subject_id == s.id).all()
        total_chapters += len(chapters)
        avg_prog = sum(c.progress_percentage for c in chapters) / len(chapters) if chapters else 0.0
        subjects_progress.append({
            "subject_id": str(s.id),
            "subject_name": s.name,
            "progress": avg_prog,
            "chapters_count": len(chapters),
        })

    return ProgressResponse(
        total_subjects=len(subjects),
        total_chapters=total_chapters,
        total_flashcards_known=total_flashcards_known,
        total_flashcards=total_flashcards,
        avg_quiz_score=avg_score,
        subjects_progress=subjects_progress,
    )


@router.get("/subject/{subject_id}", response_model=SubjectProgressResponse)
def get_subject_progress(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    chapters = db.query(Chapter).filter(Chapter.subject_id == subject_id).all()
    chapter_ids = [c.id for c in chapters]

    flashcards_known = db.query(FlashcardProgress).filter(
        FlashcardProgress.user_id == current_user.id,
        FlashcardProgress.chapter_id.in_(chapter_ids),
        FlashcardProgress.status == "known"
    ).count()

    exam_results = db.query(ExamResult).filter(
        ExamResult.user_id == current_user.id,
        ExamResult.subject_id == subject_id
    ).all()
    avg_score = sum(r.score for r in exam_results) / len(exam_results) if exam_results else 0.0
    avg_progress = sum(c.progress_percentage for c in chapters) / len(chapters) if chapters else 0.0

    return SubjectProgressResponse(
        subject_id=subject.id,
        subject_name=subject.name,
        progress_percentage=avg_progress,
        chapters_count=len(chapters),
        flashcards_known=flashcards_known,
        avg_score=avg_score,
    )


@router.put("/flashcard")
def update_flashcard_progress(
    data: FlashcardProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(FlashcardProgress).filter(
        FlashcardProgress.user_id == current_user.id,
        FlashcardProgress.flashcard_id == data.flashcard_id,
        FlashcardProgress.chapter_id == data.chapter_id
    ).first()

    if existing:
        existing.status = data.status
    else:
        progress = FlashcardProgress(
            user_id=current_user.id,
            flashcard_id=data.flashcard_id,
            chapter_id=data.chapter_id,
            status=data.status,
        )
        db.add(progress)

    # Update chapter progress
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    if chapter:
        total = db.query(FlashcardProgress).filter(
            FlashcardProgress.user_id == current_user.id,
            FlashcardProgress.chapter_id == data.chapter_id
        ).count()
        known = db.query(FlashcardProgress).filter(
            FlashcardProgress.user_id == current_user.id,
            FlashcardProgress.chapter_id == data.chapter_id,
            FlashcardProgress.status == "known"
        ).count()
        if total > 0:
            chapter.progress_percentage = (known / total) * 100

    db.commit()
    return {"message": "Progress updated"}


@router.post("/exam-result", response_model=ExamResultResponse)
def save_exam_result(
    data: ExamResultCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = ExamResult(
        user_id=current_user.id,
        chapter_id=data.chapter_id,
        subject_id=data.subject_id,
        exam_type=data.exam_type,
        score=data.score,
        total_questions=data.total_questions,
        correct_answers=data.correct_answers,
        time_taken_seconds=data.time_taken_seconds,
        questions_data=data.questions_data,
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result


@router.get("/history", response_model=List[ExamResultResponse])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = db.query(ExamResult).filter(
        ExamResult.user_id == current_user.id
    ).order_by(ExamResult.created_at.desc()).limit(50).all()
    return results
