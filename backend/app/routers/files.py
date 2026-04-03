from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import asyncio

from app.core.database import get_db
from app.core.storage import upload_file, delete_file, download_file
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.file import File
from app.schemas.file import FileResponse, SplitChaptersRequest
from app.routers.auth import get_current_user
from app.services.file_processor import FileProcessor
from app.services.chapter_detector import ChapterDetector
from app.core.config import settings

router = APIRouter(prefix="/api/files", tags=["files"])
file_processor = FileProcessor()
chapter_detector = ChapterDetector()

ALLOWED_TYPES = {
    "application/pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/msword": "docx",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
    "application/vnd.ms-powerpoint": "pptx",
    "image/png": "image",
    "image/jpeg": "image",
    "image/jpg": "image",
    "text/plain": "txt",
}


@router.post("/upload", response_model=FileResponse)
async def upload(
    file: UploadFile = FastAPIFile(...),
    subject_id: str = None,
    chapter_id: str = None,
    background_tasks: BackgroundTasks = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file
    if not subject_id:
        raise HTTPException(status_code=400, detail="subject_id is required")

    subject = db.query(Subject).filter(Subject.id == subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    content_type = file.content_type or ""
    file_type = ALLOWED_TYPES.get(content_type)
    if not file_type:
        ext = (file.filename or "").rsplit(".", 1)[-1].lower()
        ext_map = {"pdf": "pdf", "docx": "docx", "doc": "docx", "pptx": "pptx", "ppt": "pptx",
                   "png": "image", "jpg": "image", "jpeg": "image", "txt": "txt"}
        file_type = ext_map.get(ext)
    if not file_type:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    file_bytes = await file.read()
    if len(file_bytes) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Max 50MB.")

    # Upload to R2
    storage_key = upload_file(file_bytes, str(current_user.id), file.filename or "file", content_type)

    # Save to DB
    db_file = File(
        subject_id=subject_id,
        chapter_id=chapter_id,
        original_name=file.filename or "file",
        file_type=file_type,
        storage_url=storage_key,
        file_size_bytes=len(file_bytes),
        processing_status="pending",
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Start text extraction in background
    if background_tasks:
        background_tasks.add_task(_extract_text_background, str(db_file.id), file_bytes, file_type, db)

    return db_file


async def _extract_text_background(file_id: str, file_bytes: bytes, file_type: str, db: Session):
    """Background task to extract text from uploaded file."""
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        return
    try:
        db_file.processing_status = "processing"
        db.commit()
        text = await file_processor.extract_text(file_bytes, file_type)
        db_file.extracted_text = text
        db_file.processing_status = "done"
    except Exception as e:
        db_file.processing_status = "failed"
    db.commit()


@router.get("/{file_id}", response_model=FileResponse)
def get_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    subject = db.query(Subject).filter(Subject.id == db_file.subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=403, detail="Access denied")
    return db_file


@router.delete("/{file_id}")
def delete(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    subject = db.query(Subject).filter(Subject.id == db_file.subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=403, detail="Access denied")
    try:
        delete_file(db_file.storage_url)
    except Exception:
        pass
    db.delete(db_file)
    db.commit()
    return {"message": "File deleted"}


@router.get("/{file_id}/status")
def get_status(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    return {"status": db_file.processing_status}


@router.post("/{file_id}/process")
async def process_file(
    file_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if db_file.extracted_text:
        return {"message": "Already processed", "status": db_file.processing_status}

    file_bytes = download_file(db_file.storage_url)
    background_tasks.add_task(_extract_text_background, file_id, file_bytes, db_file.file_type, db)
    return {"message": "Processing started"}


@router.post("/{file_id}/detect-chapters")
async def detect_chapters(
    file_id: str,
    split_data: SplitChaptersRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_file = db.query(File).filter(File.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    if not db_file.extracted_text:
        raise HTTPException(status_code=400, detail="File not processed yet")

    subject = db.query(Subject).filter(Subject.id == db_file.subject_id, Subject.user_id == current_user.id).first()
    if not subject:
        raise HTTPException(status_code=403, detail="Access denied")

    if not split_data.split:
        # Keep as single chapter
        chapter = Chapter(
            subject_id=str(db_file.subject_id),
            title=db_file.original_name.rsplit(".", 1)[0],
            order_index=0,
        )
        db.add(chapter)
        db.commit()
        db.refresh(chapter)
        db_file.chapter_id = chapter.id
        db.commit()
        return {"chapters": [{"id": str(chapter.id), "title": chapter.title}]}

    # Auto-detect chapters using AI
    user_ai = db.query(
        __import__('app.models.user_ai_setting', fromlist=['UserAISetting']).UserAISetting
    ).filter_by(user_id=current_user.id, is_active=True).first()

    if user_ai:
        detected = await chapter_detector.detect(db_file.extracted_text, user_ai)
    else:
        detected = []

    created_chapters = []
    if detected:
        for i, ch in enumerate(detected):
            chapter = Chapter(
                subject_id=str(db_file.subject_id),
                title=ch.get("title", f"Chapter {i+1}"),
                order_index=i,
                is_auto_detected=True,
            )
            db.add(chapter)
            db.commit()
            db.refresh(chapter)
            created_chapters.append({"id": str(chapter.id), "title": chapter.title})
    else:
        # Fallback: create one chapter
        chapter = Chapter(
            subject_id=str(db_file.subject_id),
            title=db_file.original_name.rsplit(".", 1)[0],
            order_index=0,
        )
        db.add(chapter)
        db.commit()
        db.refresh(chapter)
        created_chapters.append({"id": str(chapter.id), "title": chapter.title})

    db_file.chapter_id = created_chapters[0]["id"] if created_chapters else None
    db.commit()
    return {"chapters": created_chapters}
