from fastapi import APIRouter, HTTPException
from typing import List, Optional
import time

from app.models import Task
from app.schemas import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])

# In-memory storage
_in_memory_tasks: List[Task] = []


def _find_index(task_id: int) -> Optional[int]:
    for i, t in enumerate(_in_memory_tasks):
        if t.id == task_id:
            return i
    return None


@router.get("/", response_model=List[TaskResponse])
def get_tasks():
    return _in_memory_tasks


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate):
    new_id = int(time.time() * 1000)
    t = Task(id=new_id, **task.dict())
    _in_memory_tasks.append(t)
    return t


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    idx = _find_index(task_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Task not found")

    existing = _in_memory_tasks[idx]
    update_data = task.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(existing, key, value)

    _in_memory_tasks[idx] = existing
    return existing


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int):
    idx = _find_index(task_id)
    if idx is None:
        raise HTTPException(status_code=404, detail="Task not found")

    _in_memory_tasks.pop(idx)
    return
