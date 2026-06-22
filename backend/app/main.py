from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.tasks import router as tasks_router

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
