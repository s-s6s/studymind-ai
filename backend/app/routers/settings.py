from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.user_ai_setting import UserAISetting
from app.schemas.settings import (
    AIProviderCreate, AIProviderUpdate, AIProviderResponse,
    TestAPIKeyRequest, TestAPIKeyResponse
)
from app.schemas.user import UpdateProfileRequest, UpdateLanguageRequest, UserResponse
from app.routers.auth import get_current_user
from app.core.security import encrypt_api_key
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/settings", tags=["settings"])
ai_service = AIService()


@router.get("/ai", response_model=List[AIProviderResponse])
def get_ai_providers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(UserAISetting).filter(UserAISetting.user_id == current_user.id).all()


@router.post("/ai", response_model=AIProviderResponse)
def add_ai_provider(
    data: AIProviderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # If new one is active, deactivate others
    if data.is_active:
        db.query(UserAISetting).filter(UserAISetting.user_id == current_user.id).update({"is_active": False})

    setting = UserAISetting(
        user_id=current_user.id,
        provider=data.provider,
        model_name=data.model_name,
        api_key_encrypted=encrypt_api_key(data.api_key),
        is_active=data.is_active,
    )
    db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


@router.put("/ai/{setting_id}", response_model=AIProviderResponse)
def update_ai_provider(
    setting_id: str,
    data: AIProviderUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    setting = db.query(UserAISetting).filter(
        UserAISetting.id == setting_id,
        UserAISetting.user_id == current_user.id
    ).first()
    if not setting:
        raise HTTPException(status_code=404, detail="AI provider not found")

    if data.is_active:
        db.query(UserAISetting).filter(UserAISetting.user_id == current_user.id).update({"is_active": False})

    if data.model_name:
        setting.model_name = data.model_name
    if data.api_key:
        setting.api_key_encrypted = encrypt_api_key(data.api_key)
    if data.is_active is not None:
        setting.is_active = data.is_active

    db.commit()
    db.refresh(setting)
    return setting


@router.delete("/ai/{setting_id}")
def delete_ai_provider(
    setting_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    setting = db.query(UserAISetting).filter(
        UserAISetting.id == setting_id,
        UserAISetting.user_id == current_user.id
    ).first()
    if not setting:
        raise HTTPException(status_code=404, detail="AI provider not found")
    db.delete(setting)
    db.commit()
    return {"message": "AI provider deleted"}


@router.post("/ai/test", response_model=TestAPIKeyResponse)
async def test_api_key(data: TestAPIKeyRequest):
    success = await ai_service.test_api_key(data.provider, data.model_name, data.api_key)
    if success:
        return TestAPIKeyResponse(success=True, message="Connection successful!")
    return TestAPIKeyResponse(success=False, message="Connection failed. Check your API key.")


@router.put("/profile", response_model=UserResponse)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name:
        current_user.name = data.name
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url
    if data.language:
        current_user.language = data.language
    db.commit()
    db.refresh(current_user)
    return current_user


@router.put("/language")
def update_language(
    data: UpdateLanguageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.language = data.language
    db.commit()
    return {"message": "Language updated", "language": data.language}
