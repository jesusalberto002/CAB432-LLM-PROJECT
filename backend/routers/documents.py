# backend/routers/documents.py
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..auth import get_current_user
from ..services import documents_service

router = APIRouter()

@router.post("/documents/generate-upload-url")
def generate_upload_url(
    filename: str = Body(..., embed=True),
    current_user: models.User = Depends(get_current_user)
):
    """
    Generates a pre-signed URL that the client can use to upload a file to S3.
    """
    return documents_service.create_presigned_post_url(filename=filename, user_id=current_user.id)

@router.post("/documents/confirm-upload")
def confirm_upload(
    filename: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Client calls this endpoint after a successful S3 upload to save metadata to the DB.
    """
    documents_service.save_document_metadata(db=db, filename=filename, user_id=current_user.id)
    return {"message": "Upload confirmed and metadata saved."}