from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "StudyMind AI"
    DEBUG: bool = False
    SECRET_KEY: str = "changeme-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    ENCRYPTION_KEY: str = "changeme-32-byte-hex-key"

    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/studymind"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # Cloudflare R2
    R2_ACCESS_KEY_ID: str = ""
    R2_SECRET_ACCESS_KEY: str = ""
    R2_BUCKET_NAME: str = "studymind-files"
    R2_ENDPOINT_URL: str = ""

    # File upload
    MAX_FILE_SIZE_BYTES: int = 50 * 1024 * 1024  # 50MB

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
