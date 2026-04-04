from app.routers.auth import router as auth_router
from app.routers.subjects import router as subjects_router
from app.routers.chapters import router as chapters_router
from app.routers.files import router as files_router
from app.routers.ai_content import router as ai_router
from app.routers.progress import router as progress_router
from app.routers.notifications import router as notifications_router
from app.routers.settings import router as settings_router

__all__ = [
    "auth_router", "subjects_router", "chapters_router", "files_router",
    "ai_router", "progress_router", "notifications_router", "settings_router"
]
