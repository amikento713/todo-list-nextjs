from pydantic import BaseModel
from typing import Optional


class Book(BaseModel):
    name: str
    url: str


class TaskBase(BaseModel):
    # Accept either `title` (preferred) or `text` (legacy frontend key).
    title: Optional[str] = None
    text: Optional[str] = None
    completed: bool = False
    deadline: str
    book: Optional[Book] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    completed: Optional[bool] = None
    deadline: Optional[str] = None
    book: Optional[Book] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    completed: bool
    deadline: str
    book: Optional[Book] = None

    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
