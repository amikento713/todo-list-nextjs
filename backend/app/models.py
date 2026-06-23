from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    completed = Column(Boolean, default=False)
    deadline = Column(String, nullable=False)
    book_name = Column(String, nullable=True)
    book_url = Column(String, nullable=True)
