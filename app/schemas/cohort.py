from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.models.cohort import GroupClassStatus

class CohortCreate(BaseModel):
    name: str
    student_ids: List[int]

class CohortResponse(BaseModel):
    id: int
    name: str
    trainer_id: Optional[int]
    student_count: int

    class Config:
        orm_mode = True

class GroupClassCreate(BaseModel):
    cohort_id: int
    title: str
    topic: str
    scheduled_for: datetime
    duration_minutes: Optional[int] = 60

class GroupClassResponse(BaseModel):
    id: int
    cohort_id: int
    cohort_name: str
    trainer_id: int
    trainer_name: str
    title: str
    topic: str
    status: GroupClassStatus
    scheduled_for: datetime
    duration_minutes: int
    created_at: datetime

    class Config:
        orm_mode = True
