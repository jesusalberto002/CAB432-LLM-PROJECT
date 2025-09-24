# backend/schemas.py
from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str

class QuoteResponse(BaseModel):
    content: str
    author: str

class HistoryMessage(BaseModel):
    id: int
    prompt: str
    response: str
    timestamp: datetime

    class Config:
        from_attributes = True # Updated from orm_mode for Pydantic v2

class ChatHistoryResponse(BaseModel):
    history: list[HistoryMessage]
