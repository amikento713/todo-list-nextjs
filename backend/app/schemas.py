from pydantic import BaseModel
from typing import Optional


class TaskBase(BaseModel):
    # Accept either `title` (preferred) or `text` (legacy frontend key).
    title: Optional[str] = None
    text: Optional[str] = None
    completed: bool = False
    deadline: str


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    completed: Optional[bool] = None
    deadline: Optional[str] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    deadline: str

    class Config:
        orm_mode = True
