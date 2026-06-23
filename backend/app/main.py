from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.tasks import router as tasks_router
from app.routes.uploads import router as uploads_router
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Todo API")

# Allow Next.js frontend (typically running on localhost:3000)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)
app.include_router(uploads_router)

# Serve uploaded books at /books
import os
uploads_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(uploads_path, exist_ok=True)
app.mount("/books", StaticFiles(directory=uploads_path), name="books")

# Create database tables on startup (simple for dev)
from app.db import Base, engine

Base.metadata.create_all(bind=engine)
