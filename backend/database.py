# backend/database.py
import os
import boto3
import json
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Database Setup ---
# Define these as None initially in case the secret retrieval fails
engine = None
SessionLocal = None
Base = declarative_base()

try:
    DB_USERNAME = os.getenv("DB_USERNAME")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT_STR = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")

    if not all([DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT_STR, DB_NAME]):
        print("FATAL: Missing database configuration in environment variables.")
        raise ValueError("Missing database configuration in environment variables.")

    try:
        DB_PORT = int(DB_PORT_STR)
    except ValueError:
        print(f"FATAL: Invalid DB_PORT value: {DB_PORT_STR}.")
        raise

    SQLALCHEMY_DATABASE_URL = (
        f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        "?sslmode=require"
    )

    print(f"Connecting to database host: {DB_HOST}") # Added log
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print("Database engine and session created successfully.") # Added log

except Exception as e:
    print(f"FATAL: Could not configure database connection: {type(e).__name__} - {e}")

# --- get_db() function remains the same ---
def get_db():
    if SessionLocal is None:
        raise Exception("Database is not configured. Check application logs for startup errors.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()