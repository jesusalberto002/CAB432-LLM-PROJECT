# backend/routers/quote.py
from fastapi import APIRouter, Depends
from .. import schemas
from ..services import quote_service

router = APIRouter()

@router.get("/quote", response_model=schemas.QuoteResponse)
def get_quote_of_the_day():
    """Endpoint to get a random quote."""
    return quote_service.get_daily_quote()
