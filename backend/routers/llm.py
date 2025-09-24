# backend/routers/llm.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models
from ..services import llm_service, history_service
from ..auth import get_current_user
from ..database import get_db

router = APIRouter()

# Note: We will add a dependency here later to protect this route
@router.post("/chat", response_model=schemas.ChatResponse)
def get_chat_response(
    request: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
    ):
    """Receives a prompt from the user and returns the LLM's response."""
    response_data = llm_service.generate_llm_response(
        prompt=request.prompt, 
        db=db, 
        current_user=current_user
    )
    return response_data

@router.get("/chat/history", response_model=schemas.ChatHistoryResponse)
def get_user_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetches the entire chat history for the authenticated user."""
    history = history_service.get_chat_history(db=db, user_id=current_user.id)
    return {"history": history}
