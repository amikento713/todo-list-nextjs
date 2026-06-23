import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.db import Base, engine, migrate_db
from app.routes.auth import router as auth_router
from app.routes.tasks import router as tasks_router
from app.routes.uploads import router as uploads_router

app = FastAPI(title="Todo API")

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks_router)
app.include_router(uploads_router)
app.include_router(auth_router)

uploads_path = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "uploads")
)
os.makedirs(uploads_path, exist_ok=True)
app.mount("/books", StaticFiles(directory=uploads_path), name="books")

migrate_db()
Base.metadata.create_all(bind=engine)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger = logging.getLogger("uvicorn.error")
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})
