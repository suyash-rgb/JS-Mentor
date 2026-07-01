from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CurriculumNoteBase(BaseModel):
    content: str

class CurriculumNoteUpsert(CurriculumNoteBase):
    pass

class CurriculumNoteResponse(BaseModel):
    path_id: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
