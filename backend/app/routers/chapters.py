from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterReorderRequest, ChapterResponse
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api", tags=["chapters"])


def _verify_subject(subject_id: str, user: User, db: Session) -> Subject:
    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject


@router.get("/subjects/{subject_id}/chapters", response_model=List[ChapterResponse])
def get_chapters(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_subject(subject_id, current_user, db)
    chapters = db.query(Chapter).filter(Chapter.subject_id == subject_id).order_by(Chapter.order_index).all()
    return chapters


@router.post("/subjects/{subject_id}/chapters", response_model=ChapterResponse)
def create_chapter(
    subject_id: str,
    data: ChapterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _verify_subject(subject_id, current_user, db)
    chapter = Chapter(subject_id=subject_id, title=data.title, order_index=data.order_index)
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.put("/chapters/{chapter_id}", response_model=ChapterResponse)
def update_chapter(
    chapter_id: str,
    data: ChapterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    _verify_subject(str(chapter.subject_id), current_user, db)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(chapter, field, value)
    db.commit()
    db.refresh(chapter)
    return chapter


@router.delete("/chapters/{chapter_id}")
def delete_chapter(
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    _verify_subject(str(chapter.subject_id), current_user, db)
    db.delete(chapter)
    db.commit()
    return {"message": "Chapter deleted"}


@router.put("/chapters/reorder")
def reorder_chapters(
    data: ChapterReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for item in data.chapters:
        chapter = db.query(Chapter).filter(Chapter.id == item.id).first()
        if chapter:
            _verify_subject(str(chapter.subject_id), current_user, db)
            chapter.order_index = item.order_index
    db.commit()
    return {"message": "Chapters reordered"}
