# backend/routers/documents.py
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from .. import models
from ..database import get_db
from ..auth import get_current_user
from ..services import documents_service

router = APIRouter()

@router.post("/documents/upload")
def upload_document(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
    ):
    """Route to handle document uploads."""
    return documents_service.save_uploaded_file(upload_file=file, db=db, current_user=current_user)