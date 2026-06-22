from dataclasses import dataclass
from typing import Optional, Dict


@dataclass
class Task:
    id: int
    text: str
    completed: bool
    deadline: str
    book: Optional[Dict[str, str]] = None
