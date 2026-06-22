from pydantic import BaseModel
from typing import Optional


class Book(BaseModel):
    name: str
    url: str


class TaskBase(BaseModel):
    text: str
    completed: bool = False
    deadline: str
    book: Optional[Book] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    text: Optional[str] = None
    completed: Optional[bool] = None
    deadline: Optional[str] = None
    book: Optional[Book] = None


class TaskResponse(TaskBase):
    id: int

    class Config:
        orm_mode = True
