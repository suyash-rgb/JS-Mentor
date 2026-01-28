from pydantic import BaseModel
from typing import List, Optional

class ExerciseBase(BaseModel):
    id: int
    title: str
    description: str #actual question text
    difficulty: str  # e.g., "Beginner", "Intermediate"
    tags: List[str]

class ExerciseCreate(ExerciseBase):
    pass # Used for adding new exercises

class ExerciseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    tags: Optional[List[str]] = None