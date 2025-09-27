# backend/services/documents_service.py
import os
import boto3
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from .. import models

# --- Configuration ---
S3_BUCKET_PARAMETER_NAME = "/n11837225/s3-bucket-name"
REGION_NAME = "ap-southeast-2"

def get_s3_bucket_name():
    """Fetches the S3 bucket name from AWS Parameter Store."""
    try:
        ssm_client = boto3.client('ssm', region_name=REGION_NAME)
        response = ssm_client.get_parameter(Name=S3_BUCKET_PARAMETER_NAME)
        return response['Parameter']['Value']
    except (NoCredentialsError, PartialCredentialsError) as e:
        print("FATAL: AWS credentials not found. Ensure EC2 instance has the correct IAM role.")
        raise HTTPException(status_code=500, detail="Server not configured for AWS access.")
    except ClientError as e:
        if e.response['Error']['Code'] == 'ParameterNotFound':
            print(f"FATAL: Parameter '{S3_BUCKET_PARAMETER_NAME}' not found in Parameter Store.")
            raise HTTPException(status_code=500, detail="S3 bucket configuration is missing.")
        else:
            print(f"Error fetching from Parameter Store: {e}")
            raise HTTPException(status_code=500, detail="Could not retrieve S3 configuration.")

# --- S3 Client Initialization ---
S3_BUCKET_NAME = None
s3_client = None
try:
    S3_BUCKET_NAME = get_s3_bucket_name()
    s3_client = boto3.client('s3', region_name=REGION_NAME)
except HTTPException as e:
    print(f"Failed to initialize S3 service: {e.detail}")

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