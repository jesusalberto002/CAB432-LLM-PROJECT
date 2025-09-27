# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine
from .routers import users, llm, documents, quote, admin

# This command creates the database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- CORS Middleware ---
origins = ["http://localhost:3000", "localhost:3000", "http://54.66.15.216:8080"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Include Routers ---
app.include_router(users.router, prefix="/api/v1", tags=["users"])
app.include_router(llm.router, prefix="/api/v1", tags=["llm"])
app.include_router(documents.router, prefix="/api/v1", tags=["documents"])
app.include_router(quote.router, prefix="/api/v1", tags=["quote"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the LLM App API"}
