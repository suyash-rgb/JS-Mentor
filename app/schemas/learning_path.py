from pydantic import BaseModel
from typing import Optional

class LearningPathCreate(BaseModel):
    heading: str
    content: str

class LearningPathUpdate(BaseModel):
    heading: Optional[str] = None
    content: Optional[str] = None
