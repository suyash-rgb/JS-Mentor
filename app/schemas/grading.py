from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class SubmissionDetail(BaseModel):
    id: int
    student_id: int
    student_name: str
    exercise_id: str
    exercise_title: str
    exercise_question: Optional[str] = None
    status: str
    submitted_at: datetime
    code_submitted: Optional[str] = None
    grade: Optional[float] = None
    feedback: Optional[str] = None

class GradeSubmissionRequest(BaseModel):
    score: float = Field(..., ge=0, le=100)
    feedback: str
