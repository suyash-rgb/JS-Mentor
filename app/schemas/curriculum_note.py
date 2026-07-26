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

class StudentNoteResponse(BaseModel):
    id: int
    student_id: int
    path_id: str
    content: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StudentNoteUpsert(BaseModel):
    content: str

class ClassSummaryResponse(BaseModel):
    id: int
    group_class_id: int
    content: str
    created_at: Optional[datetime] = None
    expires_at: datetime

    class Config:
        from_attributes = True

