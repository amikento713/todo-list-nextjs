import re
from datetime import date
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

MAX_TASK_TITLE_LENGTH = 500
DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


class Book(BaseModel):
    name: str
    url: str


class TaskBase(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    completed: bool = False
    deadline: str
    book: Optional[Book] = None

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: str) -> str:
        if not DATE_PATTERN.match(value):
            raise ValueError("Deadline must use YYYY-MM-DD format")
        try:
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Deadline is not a valid date") from exc
        return value

    @model_validator(mode="after")
    def validate_title(self):
        title = (self.title or self.text or "").strip()
        if not title:
            raise ValueError("Title is required")
        if len(title) > MAX_TASK_TITLE_LENGTH:
            raise ValueError(
                f"Title must be at most {MAX_TASK_TITLE_LENGTH} characters"
            )
        self.title = title
        self.text = title
        return self


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    completed: Optional[bool] = None
    deadline: Optional[str] = None
    book: Optional[Book] = None

    @field_validator("deadline")
    @classmethod
    def validate_deadline(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        if not DATE_PATTERN.match(value):
            raise ValueError("Deadline must use YYYY-MM-DD format")
        try:
            date.fromisoformat(value)
        except ValueError as exc:
            raise ValueError("Deadline is not a valid date") from exc
        return value

    @model_validator(mode="after")
    def validate_title(self):
        raw = self.title if self.title is not None else self.text
        if raw is None:
            return self
        title = raw.strip()
        if not title:
            raise ValueError("Title cannot be empty")
        if len(title) > MAX_TASK_TITLE_LENGTH:
            raise ValueError(
                f"Title must be at most {MAX_TASK_TITLE_LENGTH} characters"
            )
        self.title = title
        self.text = title
        return self


class TaskResponse(BaseModel):
    id: int
    title: str
    text: str
    completed: bool
    deadline: str
    book: Optional[Book] = None

    model_config = {"from_attributes": True}


class UserCreate(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=72)


class Token(BaseModel):
    access_token: str
    token_type: str
