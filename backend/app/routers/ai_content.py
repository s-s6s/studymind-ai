from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.subject import Subject
from app.models.chapter import Chapter
from app.models.file import File
from app.models.generated_content import GeneratedContent
from app.models.chat_message import ChatMessage
from app.models.user_ai_setting import UserAISetting
from app.schemas.ai_content import (
    GenerateRequest, GenerateAllRequest, ChatRequest,
    ChatMessageResponse, GeneratedContentResponse, PartialExamRequest
)
from app.routers.auth import get_current_user
from app.services.ai_service import AIService
from app.services.summary_gen import SummaryGenerator
from app.services.flashcard_gen import FlashcardGenerator
from app.services.mcq_gen import MCQGenerator
from app.services.cheatsheet_gen import CheatSheetGenerator
from app.services.mindmap_gen import MindMapGenerator
from app.services.glossary_gen import GlossaryGenerator

router = APIRouter(prefix="/api/ai", tags=["ai"])
ai_service = AIService()


def _get_active_ai(user_id, db: Session) -> UserAISetting:
    setting = db.query(UserAISetting).filter(
        UserAISetting.user_id == user_id,
        UserAISetting.is_active == True
    ).first()
    if not setting:
        raise HTTPException(status_code=400, detail="No active AI provider. Go to settings and add an API key.")
    return setting


def _get_chapter_text(chapter_id: str, db: Session) -> str:
    chapter = db.query(Chapter).filter(Chapter.id == chapter_id).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="Chapter not found")
    files = db.query(File).filter(File.chapter_id == chapter_id, File.processing_status == "done").all()
    if not files:
        raise HTTPException(status_code=400, detail="No processed files found for this chapter")
    return "\n\n".join(f.extracted_text for f in files if f.extracted_text)


def _save_content(chapter_id, content_type, data, ai_setting, detail_level, db: Session):
    existing = db.query(GeneratedContent).filter(
        GeneratedContent.chapter_id == chapter_id,
        GeneratedContent.content_type == content_type
    ).first()
    if existing:
        existing.content_data = data
        existing.ai_provider = ai_setting.provider
        existing.ai_model = ai_setting.model_name
        existing.detail_level = detail_level
        db.commit()
        db.refresh(existing)
        return existing
    content = GeneratedContent(
        chapter_id=chapter_id,
        content_type=content_type,
        content_data=data,
        ai_provider=ai_setting.provider,
        ai_model=ai_setting.model_name,
        detail_level=detail_level,
    )
    db.add(content)
    db.commit()
    db.refresh(content)
    return content


@router.post("/generate/summary", response_model=GeneratedContentResponse)
async def generate_summary(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = SummaryGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.detail_level, data.language,
                                subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "summary", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/flashcards", response_model=GeneratedContentResponse)
async def generate_flashcards(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = FlashcardGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "flashcards", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/mcq", response_model=GeneratedContentResponse)
async def generate_mcq(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = MCQGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "mcq", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/cheatsheet", response_model=GeneratedContentResponse)
async def generate_cheatsheet(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = CheatSheetGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "cheatsheet", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/mindmap", response_model=GeneratedContentResponse)
async def generate_mindmap(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = MindMapGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "mindmap", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/glossary", response_model=GeneratedContentResponse)
async def generate_glossary(
    data: GenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    gen = GlossaryGenerator(ai_service)
    result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])

    return _save_content(str(data.chapter_id), "glossary", result["data"], ai_setting, data.detail_level, db)


@router.post("/generate/all")
async def generate_all(
    data: GenerateAllRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)
    text = _get_chapter_text(str(data.chapter_id), db)
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first()

    generators = [
        ("summary", SummaryGenerator(ai_service)),
        ("flashcards", FlashcardGenerator(ai_service)),
        ("mcq", MCQGenerator(ai_service)),
        ("cheatsheet", CheatSheetGenerator(ai_service)),
        ("mindmap", MindMapGenerator(ai_service)),
        ("glossary", GlossaryGenerator(ai_service)),
    ]

    results = {}
    for content_type, gen in generators:
        try:
            if content_type == "summary":
                result = await gen.generate(text, ai_setting, data.detail_level, data.language, subject.name, chapter.title)
            else:
                result = await gen.generate(text, ai_setting, data.language, subject.name, chapter.title)
            if result["success"]:
                _save_content(str(data.chapter_id), content_type, result["data"], ai_setting, data.detail_level, db)
                results[content_type] = "success"
            else:
                results[content_type] = result.get("error", "failed")
        except Exception as e:
            results[content_type] = str(e)

    return {"results": results}


@router.post("/chat")
async def chat(
    data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)

    # Get context from chapter files
    context = ""
    if data.chapter_id:
        files = db.query(File).filter(File.chapter_id == data.chapter_id, File.processing_status == "done").all()
        context = "\n\n".join(f.extracted_text for f in files if f.extracted_text)[:6000]

    subject = db.query(Subject).filter(Subject.id == data.subject_id).first()
    chapter = db.query(Chapter).filter(Chapter.id == data.chapter_id).first() if data.chapter_id else None

    # Get chat history
    history = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.subject_id == data.subject_id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    history = list(reversed(history))

    # Build messages
    system = f"""أنت مساعد أكاديمي ذكي للمادة: {subject.name if subject else 'غير محدد'}.
{"الفصل الحالي: " + chapter.title if chapter else ""}
{"السياق:\n" + context if context else ""}
أجب بلغة {data.language}. كن دقيقاً ومفيداً."""

    messages = [{"role": "system", "content": system}]
    for msg in history:
        messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": data.message})

    # Save user message
    user_msg = ChatMessage(
        user_id=current_user.id,
        subject_id=data.subject_id,
        chapter_id=data.chapter_id,
        role="user",
        content=data.message,
    )
    db.add(user_msg)
    db.commit()

    # Call AI
    import litellm
    from app.core.security import decrypt_api_key
    try:
        api_key = decrypt_api_key(ai_setting.api_key_encrypted)
        response = await litellm.acompletion(
            model=f"{ai_setting.provider}/{ai_setting.model_name}",
            api_key=api_key,
            messages=messages,
            temperature=0.5,
            max_tokens=2000,
        )
        reply = response.choices[0].message.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    # Save assistant message
    assistant_msg = ChatMessage(
        user_id=current_user.id,
        subject_id=data.subject_id,
        chapter_id=data.chapter_id,
        role="assistant",
        content=reply,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    return {"message": reply, "message_id": str(assistant_msg.id)}


@router.get("/chat/{subject_id}", response_model=List[ChatMessageResponse])
def get_chat_history(
    subject_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id,
        ChatMessage.subject_id == subject_id
    ).order_by(ChatMessage.created_at).all()
    return messages


@router.post("/exam/partial")
async def partial_exam(
    data: PartialExamRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ai_setting = _get_active_ai(current_user.id, db)

    # Collect all texts and existing content
    combined_text = ""
    all_flashcards = []
    all_mcq = []

    for chapter_id in data.chapter_ids:
        text = ""
        files = db.query(File).filter(File.chapter_id == str(chapter_id), File.processing_status == "done").all()
        text = "\n\n".join(f.extracted_text for f in files if f.extracted_text)
        combined_text += text + "\n\n"

        # Get existing content or generate
        fc_content = db.query(GeneratedContent).filter(
            GeneratedContent.chapter_id == str(chapter_id),
            GeneratedContent.content_type == "flashcards"
        ).first()
        if fc_content:
            all_flashcards.extend(fc_content.content_data.get("flashcards", []))

        mcq_content = db.query(GeneratedContent).filter(
            GeneratedContent.chapter_id == str(chapter_id),
            GeneratedContent.content_type == "mcq"
        ).first()
        if mcq_content:
            all_mcq.extend(mcq_content.content_data.get("questions", []))

    # Generate merged summary
    chapter = db.query(Chapter).filter(Chapter.id == str(data.chapter_ids[0])).first()
    subject = db.query(Subject).filter(Subject.id == chapter.subject_id).first() if chapter else None

    summary_gen = SummaryGenerator(ai_service)
    summary_result = await summary_gen.generate(
        combined_text[:8000], ai_setting, "medium", data.language,
        subject.name if subject else "", f"{data.exam_type} Exam"
    )

    return {
        "exam_type": data.exam_type,
        "summary": summary_result.get("data") if summary_result["success"] else {},
        "flashcards": all_flashcards[:30],
        "mcq": all_mcq[:20],
        "chapters_count": len(data.chapter_ids),
    }
