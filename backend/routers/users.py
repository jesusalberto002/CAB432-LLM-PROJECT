# backend/routers/users.py
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from .. import schemas
from ..database import SessionLocal, get_db
from ..services import users # Import the service

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user_route(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Route to handle user registration."""
    users.create_user(user_data=user, db=db)
    return {"message": f"User {user.username} registered successfully"}

@router.post("/login", response_model=schemas.Token)
def login_for_access_token_route(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """Route to handle user login and token issuance."""
    return users.authenticate_user(form_data=form_data, db=db)