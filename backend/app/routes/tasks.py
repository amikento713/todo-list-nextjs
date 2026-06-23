import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user, get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])

logger = logging.getLogger("uvicorn.error")


def serialize_task(task: models.Task) -> dict:
    book = None
    if task.book_name or task.book_url:
        book = {"name": task.book_name or "", "url": task.book_url or ""}

    return {
        "id": task.id,
        "title": task.title,
        "text": task.title,
        "completed": bool(task.completed),
        "deadline": task.deadline or "",
        "book": book,
    }


@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(
    db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)
):
    try:
        tasks = (
            db.query(models.Task)
            .filter(models.Task.owner_id == current_user.id)
            .all()
        )
        return [serialize_task(task) for task in tasks]
    except Exception as exc:
        logger.exception("Error in get_tasks")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/", response_model=schemas.TaskResponse, status_code=201)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    title = task.title or task.text
    try:
        db_task = models.Task(
            title=title,
            completed=bool(task.completed),
            deadline=task.deadline or "",
            owner_id=current_user.id,
        )
        if task.book:
            db_task.book_name = task.book.name
            db_task.book_url = task.book.url
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return serialize_task(db_task)
    except Exception as exc:
        logger.exception("Error in create_task")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        db_task = (
            db.query(models.Task)
            .filter(
                models.Task.id == task_id, models.Task.owner_id == current_user.id
            )
            .first()
        )
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        if task.title is not None or task.text is not None:
            db_task.title = task.title or task.text or db_task.title

        if task.completed is not None:
            db_task.completed = bool(task.completed)

        if task.deadline is not None:
            db_task.deadline = task.deadline

        if "book" in task.model_fields_set:
            if task.book is None:
                db_task.book_name = None
                db_task.book_url = None
            else:
                db_task.book_name = task.book.name or None
                db_task.book_url = task.book.url or None

        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return serialize_task(db_task)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error in update_task")
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    try:
        db_task = (
            db.query(models.Task)
            .filter(
                models.Task.id == task_id, models.Task.owner_id == current_user.id
            )
            .first()
        )
        if not db_task:
            raise HTTPException(status_code=404, detail="Task not found")

        db.delete(db_task)
        db.commit()
        return
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error in delete_task")
        raise HTTPException(status_code=500, detail=str(exc)) from exc
