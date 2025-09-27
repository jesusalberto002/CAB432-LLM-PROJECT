# backend/auth.py
import os
import requests
import json
from jose import jwk, jwt
from jose.exceptions import JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, database, schemas

# --- Cognito Configuration ---
COGNITO_USER_POOL_ID = "ap-southeast-2_LB7ZrgcGZ"
COGNITO_REGION = "ap-southeast-2"
COGNITO_APP_CLIENT_ID = "5pij8s6i58k50ilq3ms8qppgp8"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Cognito JWKS (JSON Web Key Set) ---
jwks_url = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}/.well-known/jwks.json"
try:
    jwks = requests.get(jwks_url).json()["keys"]
except requests.exceptions.RequestException as e:
    print(f"FATAL: Could not fetch Cognito JWKS. Error: {e}")
    jwks = []

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not jwks:
         raise HTTPException(status_code=500, detail="Authentication service is not available.")

    try:
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {"kty": key["kty"], "kid": key["kid"], "use": key["use"], "n": key["n"], "e": key["e"]}
        
        if not rsa_key:
            raise credentials_exception

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
        )

        user_identifier: str = payload.get("email")
        if user_identifier is None:
            raise credentials_exception

    except JWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception

    # We will store the email in the 'username' column of our User table
    user = db.query(models.User).filter(models.User.username == user_identifier).first()
    
    if user is None:
        # Create a new user in our local DB using their email as the username
        new_user = models.User(username=user_identifier, hashed_password="COGNITO_USER")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user

    return user

def get_current_admin_user(current_user: models.User = Depends(get_current_user), token: str = Depends(oauth2_scheme)):
    """
    A dependency that checks if the current user is part of the 'Admins' group.
    Relies on the get_current_user dependency to first validate the token.
    """
    try:
        # We need to decode the token again just to get the groups claim.
        # This is safe because get_current_user has already fully validated the signature.
        payload = jwt.get_unverified_claims(token)
        user_groups = payload.get("cognito:groups", [])
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token.",
        )

    if "Admins" not in user_groups:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource.",
        )
    
    return current_user