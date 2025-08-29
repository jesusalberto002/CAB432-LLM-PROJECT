# backend/routers/llm.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models
from ..services import llm_service
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