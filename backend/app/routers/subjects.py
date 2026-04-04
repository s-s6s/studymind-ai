from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse, SetExamDateRequest
from app.routers.auth import get_current_user
from app.services.notification_service import schedule_exam_reminders

router = APIRouter(prefix="/api/subjects", tags=["subjects"])


@router.get("", response_model=List[SubjectResponse])
def get_subjects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    subjects = db.query(Subject).filter(Subject.user_id == current_user.id).order_by(Subject.created_at.desc()).all()
    result = []
    for s in subjects:
        chapters = db.query(Chapter).filter(Chapter.subject_id == s.id).all()
        avg_progress = sum(c.progress_percentage for c in chapters) / len(chapters) if chapters else 0.0
        resp = SubjectResponse(
            id=s.id, name=s.name, color=s.color, icon=s.icon,
            exam_date=s.exam_date, reminder_enabled=s.reminder_enabled,
            created_at=s.created_at, updated_at=s.updated_at,
            chapter_count=len(chapters), progress_percentage=avg_progress
        )
        result.append(resp)
    return result


@router.post("", response_model=SubjectResponse)
def create_subject(
    data: SubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = Subject(
        user_id=current_user.id,
        name=data.name,
        color=data.color or "#6C63FF",
        icon=data.icon,
        exam_date=data.exam_date,
        reminder_enabled=data.reminder_enabled,
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)

    if data.exam_date and data.reminder_enabled:
        schedule_exam_reminders(db, subject, current_user)

    return SubjectResponse(
        id=subject.id, name=subject.name, color=subject.color, icon=subject.icon,
        exam_date=subject.exam_date, reminder_enabled=subject.reminder_enabled,
        created_at=subject.created_at, updated_at=subject.updated_at,
        chapter_count=0, progress_percentage=0.0
    )


@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    chapters = db.query(Chapter).filter(Chapter.subject_id == subject.id).all()
    avg_progress = sum(c.progress_percentage for c in chapters) / len(chapters) if chapters else 0.0
    return SubjectResponse(
        id=subject.id, name=subject.name, color=subject.color, icon=subject.icon,
        exam_date=subject.exam_date, reminder_enabled=subject.reminder_enabled,
        created_at=subject.created_at, updated_at=subject.updated_at,
        chapter_count=len(chapters), progress_percentage=avg_progress
    )


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: str,
    data: SubjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    for field, value in data.dict(exclude_unset=True).items():
        setattr(subject, field, value)
    db.commit()
    db.refresh(subject)
    chapters = db.query(Chapter).filter(Chapter.subject_id == subject.id).all()
    avg_progress = sum(c.progress_percentage for c in chapters) / len(chapters) if chapters else 0.0
    return SubjectResponse(
        id=subject.id, name=subject.name, color=subject.color, icon=subject.icon,
        exam_date=subject.exam_date, reminder_enabled=subject.reminder_enabled,
        created_at=subject.created_at, updated_at=subject.updated_at,
        chapter_count=len(chapters), progress_percentage=avg_progress
    )


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": "Subject deleted"}


@router.put("/{subject_id}/exam-date")
def set_exam_date(
    subject_id: str,
    data: SetExamDateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    subject.exam_date = data.exam_date
    subject.reminder_enabled = data.reminder_enabled
    db.commit()
    if data.reminder_enabled:
        schedule_exam_reminders(db, subject, current_user)
    return {"message": "Exam date updated"}
