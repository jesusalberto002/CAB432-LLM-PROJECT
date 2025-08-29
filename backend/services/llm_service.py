# backend/services/llm_service.py
import requests
from fastapi import HTTPException, status
from .. import schemas
from .. import models
from sqlalchemy.orm import Session

OLLAMA_API_URL = "http://ollama:11434/api/generate"

def generate_llm_response(prompt: str, db: Session, current_user: models.User):
    """Sends a prompt to the Ollama service and gets a response."""
    try:
        payload = {
            "model": "custom-gemma3:latest",
            "prompt": prompt,
            "stream": False # We want the full response at once
        }
        ollama_response = requests.post(OLLAMA_API_URL, json=payload)
        ollama_response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)

        response_text = ollama_response.json().get("response", "")

        # Save the conversation to the database
        new_message = models.Message(
            prompt=prompt,
            response=response_text,
            owner_id=current_user.id
        )
        db.add(new_message)
        db.commit()

        return {"response": response_text}

    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not connect to the LLM service."
        )