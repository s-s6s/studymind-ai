from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import SessionLocal
from app.core.redis import get_redis, close_redis
from app.routers import (
    auth_router, subjects_router, chapters_router, files_router,
    ai_router, progress_router, notifications_router, settings_router
)
from app.websocket.manager import manager
from app.services.notification_service import get_pending_notifications, mark_notification_sent
from app.core.security import decode_token

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


async def check_and_send_notifications():
    """APScheduler job: check scheduled notifications and push via WebSocket."""
    db = SessionLocal()
    try:
        pending = get_pending_notifications(db)
        for notif in pending:
            await manager.send_to_user(str(notif.user_id), {
                "type": "notification",
                "id": str(notif.id),
                "title": notif.title,
                "body": notif.body,
                "notification_type": notif.type,
            })
            mark_notification_sent(db, str(notif.id))
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        check_and_send_notifications,
        IntervalTrigger(minutes=30),
        id="notification_checker",
        replace_existing=True,
    )
    scheduler.start()
    app.state.scheduler = scheduler

    yield

    # Shutdown
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown()
    await close_redis()


app = FastAPI(
    title="StudyMind AI API",
    description="Smart study platform API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Include routers
app.include_router(auth_router)
app.include_router(subjects_router)
app.include_router(chapters_router)
app.include_router(files_router)
app.include_router(ai_router)
app.include_router(progress_router)
app.include_router(notifications_router)
app.include_router(settings_router)


# WebSocket endpoint for real-time notifications
@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket, token: str = None):
    user_id = None
    if token:
        payload = decode_token(token)
        if payload:
            user_id = payload.get("sub")

    if not user_id:
        await websocket.close(code=4001)
        return

    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


@app.get("/health")
def health():
    return {"status": "ok", "service": "StudyMind AI API"}


@app.get("/")
def root():
    return {"message": "StudyMind AI API", "docs": "/docs"}
