# backend/services/history_service.py
from sqlalchemy.orm import Session
from sqlalchemy import desc
from .. import models

def get_chat_history(db: Session, user_id: int):
    """Fetches all chat messages for a specific user, sorted by timestamp."""
    return db.query(models.Message).filter(models.Message.owner_id == user_id).order_by(desc(models.Message.timestamp)).all()
