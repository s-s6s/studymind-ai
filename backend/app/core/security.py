from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os
import base64
import binascii
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def encrypt_api_key(api_key: str) -> str:
    """AES-256-GCM encryption for API keys."""
    try:
        key_bytes = binascii.unhexlify(settings.ENCRYPTION_KEY[:64].ljust(64, '0'))
    except Exception:
        key_bytes = settings.ENCRYPTION_KEY.encode()[:32].ljust(32, b'0')

    aesgcm = AESGCM(key_bytes)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, api_key.encode(), None)
    return base64.b64encode(nonce + ciphertext).decode()


def decrypt_api_key(encrypted: str) -> str:
    """Decrypt AES-256-GCM encrypted API key."""
    try:
        key_bytes = binascii.unhexlify(settings.ENCRYPTION_KEY[:64].ljust(64, '0'))
    except Exception:
        key_bytes = settings.ENCRYPTION_KEY.encode()[:32].ljust(32, b'0')

    data = base64.b64decode(encrypted.encode())
    nonce = data[:12]
    ciphertext = data[12:]
    aesgcm = AESGCM(key_bytes)
    return aesgcm.decrypt(nonce, ciphertext, None).decode()
