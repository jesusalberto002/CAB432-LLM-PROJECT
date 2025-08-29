import os
import shutil
from sqlalchemy.orm import Session
from fastapi import UploadFile, HTTPException, status
from .. import models

DOCUMENTS_DIR = "./uploads"

def save_uploaded_file(upload_file: UploadFile, db: Session, current_user: models.User):
    """Saves the uploaded file to the server and records its metadata in the database."""
    if not os.path.exists(DOCUMENTS_DIR):
        os.makedirs(DOCUMENTS_DIR)
    
    file_location = os.path.join(DOCUMENTS_DIR, upload_file.filename)
    
    with open(file_location, "wb") as file_object:
        file_object.write(upload_file.file.read())
    
    new_document = models.Document(
        filename=upload_file.filename,
        filepath=file_location,
        owner_id=current_user.id
    )
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    
    return {"filename": upload_file.filename, "message": "File uploaded successfully"}