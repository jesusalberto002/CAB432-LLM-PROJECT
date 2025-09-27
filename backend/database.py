# backend/database.py
import os
import boto3
import json
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from botocore.exceptions import ClientError, NoCredentialsError, PartialCredentialsError

# --- Configuration ---
# CORRECT Secret Name, following the course's required format
SECRET_NAME = "n11837225-rds-credentials"
# AWS Region where the secret is stored
REGION_NAME = "ap-southeast-2"

def get_secret():
    """Fetches database credentials from AWS Secrets Manager."""
    session = boto3.session.Session()
    client = session.client(
        service_name='secretsmanager',
        region_name=REGION_NAME
    )

    try:
        get_secret_value_response = client.get_secret_value(
            SecretId=SECRET_NAME
        )
    except (NoCredentialsError, PartialCredentialsError) as e:
        print("FATAL: AWS credentials not found. Ensure your EC2 instance has an IAM role with permission to access Secrets Manager.")
        raise e
    except ClientError as e:
        print(f"FATAL: Could not retrieve secret '{SECRET_NAME}' from AWS Secrets Manager. Error: {e}")
        raise e

    # Decrypts secret using the associated KMS key and returns it as a string
    secret = get_secret_value_response['SecretString']
    return json.loads(secret)

# --- Database Setup ---
# Define these as None initially in case the secret retrieval fails
engine = None
SessionLocal = None
Base = declarative_base()

try:
    # Fetch credentials and build the database URL
    credentials = get_secret()
    DB_USERNAME = credentials['username']
    DB_PASSWORD = credentials['password']
    DB_HOST = credentials['host']
    DB_PORT = credentials.get('port', 5432)
    DB_NAME = credentials['dbname']

    # Construct the database URL with the required SSL mode
    SQLALCHEMY_DATABASE_URL = (
        f"postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        "?sslmode=require"
    )

    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

except Exception as e:
    print(f"FATAL: Could not configure the database connection due to an error: {e}")

def get_db():
    """Dependency to get a DB session for each request."""
    if SessionLocal is None:
        raise Exception("Database is not configured. Check application logs for startup errors.")
    
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()