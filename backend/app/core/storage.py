import boto3
from botocore.config import Config
from app.core.config import settings
import uuid
import mimetypes


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )


def upload_file(file_bytes: bytes, user_id: str, original_filename: str, content_type: str) -> str:
    """Upload file to R2 and return the storage key/URL."""
    ext = original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
    key = f"{user_id}/{uuid.uuid4()}.{ext}"

    client = get_s3_client()
    client.put_object(
        Bucket=settings.R2_BUCKET_NAME,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key


def download_file(storage_key: str) -> bytes:
    """Download file bytes from R2."""
    client = get_s3_client()
    response = client.get_object(Bucket=settings.R2_BUCKET_NAME, Key=storage_key)
    return response["Body"].read()


def delete_file(storage_key: str):
    """Delete file from R2."""
    client = get_s3_client()
    client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=storage_key)


def get_presigned_url(storage_key: str, expires_in: int = 3600) -> str:
    """Generate a presigned URL for temporary access."""
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.R2_BUCKET_NAME, "Key": storage_key},
        ExpiresIn=expires_in,
    )
