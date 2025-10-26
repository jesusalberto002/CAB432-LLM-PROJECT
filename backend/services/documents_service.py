# backend/services/documents_service.py
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from .. import models

# Read bucket name directly from environment variable
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
s3_client = None

if S3_BUCKET_NAME:
    try:
        # Initialize client only if bucket name is present
        s3_client = boto3.client('s3', region_name=REGION_NAME)
        print(f"S3 Service configured for bucket: {S3_BUCKET_NAME}")
    except Exception as e: # Catch potential boto3 client errors more broadly
         print(f"Warning: Failed to initialize S3 client: {e}")
         S3_BUCKET_NAME = None # Ensure bucket name is None if client fails
         s3_client = None
else:
    print("Warning: S3_BUCKET_NAME environment variable not set. Document features disabled.")

def create_presigned_post_url(filename: str, user_id: int):
    """
    Generates a pre-signed URL for uploading a file directly to S3 from the client.
    """
    if not S3_BUCKET_NAME or not s3_client:
        raise HTTPException(status_code=503, detail="S3 service is not available or configured.")

    object_key = f"documents/{user_id}/{filename}"

    try:
        response = s3_client.generate_presigned_post(
            Bucket=S3_BUCKET_NAME,
            Key=object_key,
            ExpiresIn=3600  # URL expires in 1 hour
        )
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        raise HTTPException(status_code=500, detail="Could not generate file upload URL.")

    return response

def save_document_metadata(db: Session, filename: str, user_id: int):
    """
    Saves the document metadata to the database after the client confirms the upload.
    """
    if not S3_BUCKET_NAME:
        raise HTTPException(status_code=503, detail="S3 service is not configured.")

    filepath = f"s3://{S3_BUCKET_NAME}/documents/{user_id}/{filename}"
    
    db_document = db.query(models.Document).filter(models.Document.filepath == filepath).first()

    if db_document:
        return db_document

    new_document = models.Document(
        filename=filename,
        filepath=filepath,
        owner_id=user_id
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    return new_document