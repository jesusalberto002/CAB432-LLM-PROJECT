import requests
from fastapi import HTTPException, status

# ZenQuotes API endpoint
QUOTE_API_URL = "https://zenquotes.io/api/random"

def get_daily_quote():
    """Fetches a random quote from ZenQuotes API."""
    try:
        response = requests.get(QUOTE_API_URL)
        response.raise_for_status()
        data = response.json()
        # ZenQuotes returns a list of dictionaries
        quote = data[0] if isinstance(data, list) else data
        return {"content": quote.get("q"), "author": quote.get("a")}
    except requests.exceptions.RequestException as e:
        print(f"Error calling Quote API: {e}")
        # Fallback quote
        return {
            "content": "The only way to do great work is to love what you do.",
            "author": "Steve Jobs (Fallback)"
        }

