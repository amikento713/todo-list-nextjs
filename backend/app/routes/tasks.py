from fastapi import APIRouter, HTTPException, Depends
from typing import List
from sqlalchemy.orm import Session

from app import models, schemas
from app.db import SessionLocal, engine

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    result = []
    for t in tasks:
        result.append({
            "id": t.id,
            "title": t.title,
            "text": t.title,
            "completed": t.completed,
            "deadline": t.deadline,
            "book": {"name": t.book_name, "url": t.book_url} if t.book_name or t.book_url else None,
        })
    return result


@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Accept legacy `text` field from frontend by falling back
    title = task.title or task.text
    if not title:
        raise HTTPException(status_code=400, detail="Title is required")

    db_task = models.Task(title=title, completed=task.completed, deadline=task.deadline)
    if task.book:
        db_task.book_name = task.book.name
        db_task.book_url = task.book.url
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {
        "id": db_task.id,
        "title": db_task.title,
        "text": db_task.title,
        "completed": db_task.completed,
        "deadline": db_task.deadline,
        "book": {"name": db_task.book_name, "url": db_task.book_url} if db_task.book_name or db_task.book_url else None,
    }


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: int, task: schemas.TaskUpdate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Prefer explicit `title`, fallback to legacy `text`
    if task.title is not None or task.text is not None:
        db_task.title = task.title or task.text or db_task.title

    if task.completed is not None:
        db_task.completed = task.completed

    if task.deadline is not None:
        db_task.deadline = task.deadline

    if task.book is not None:
        # set or clear book metadata
        db_task.book_name = task.book.name if task.book.name else None
        db_task.book_url = task.book.url if task.book.url else None

    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {
        "id": db_task.id,
        "title": db_task.title,
        "text": db_task.title,
        "completed": db_task.completed,
        "deadline": db_task.deadline,
        "book": {"name": db_task.book_name, "url": db_task.book_url} if db_task.book_name or db_task.book_url else None,
    }


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(db_task)
    db.commit()
    return
