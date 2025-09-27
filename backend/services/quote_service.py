# backend/services/quote_service.py
import os
import json
import requests
from pymemcache.client.base import Client

# --- Configuration ---
CACHE_ENDPOINT = os.getenv("CACHE_ENDPOINT")
QUOTE_API_URL = "https://zenquotes.io/api/random"

# --- Cache Client Initialization ---
cache = None
if CACHE_ENDPOINT:
    try:
        # The endpoint from docker-compose.yml is a single string "host:port"
        # We need to split it for the client library
        host, port_str = CACHE_ENDPOINT.split(':')
        port = int(port_str)
        
        # Initialize the client with timeouts to prevent long waits
        cache = Client((host, port), connect_timeout=3, timeout=3)
        
        # A quick command to test the connection. If this fails, it will raise an exception.
        cache.get('connection_test') 
        print(f"Successfully connected to ElastiCache at {CACHE_ENDPOINT}")
    except Exception as e:
        print(f"Warning: Could not connect to cache at {CACHE_ENDPOINT}. Caching will be disabled. Error: {e}")
        cache = None # Ensure cache is None if connection fails

def get_daily_quote():
    """Fetches a random quote, using a cache to limit API calls."""
    # Try fetching from the cache first
    if cache:
        try:
            cached_quote = cache.get("daily_quote")
            if cached_quote:
                print("Serving quote from cache.")
                # The value from cache is bytes, so we decode it and load the JSON
                return json.loads(cached_quote.decode('utf-8'))
        except Exception as e:
            print(f"Warning: Failed to get item from cache. Error: {e}")
            # Continue to fetch from API if cache read fails

    # If not in cache or cache failed, fetch from the API
    print("Fetching new quote from API.")
    try:
        response = requests.get(QUOTE_API_URL, timeout=5) # Add a timeout to API call
        response.raise_for_status()
        data = response.json()
        
        quote_data = data[0] if isinstance(data, list) and data else {}
        quote = {"content": quote_data.get("q", "A fallback quote."), "author": quote_data.get("a", "Unknown")}
        
        # Store the new quote in the cache for the next time, if the cache is available.
        if cache:
            try:
                # Set an expiry time (e.g., 6 hours = 21600 seconds)
                cache.set("daily_quote", json.dumps(quote), expire=21600)
            except Exception as e:
                print(f"Warning: Failed to set item in cache. Error: {e}")
            
        return quote
    except requests.exceptions.RequestException as e:
        print(f"Error calling Quote API: {e}")
        # Return a fallback quote if the API fails
        return {
            "content": "The only way to do great work is to love what you do.",
            "author": "Steve Jobs (Fallback)"
        }
