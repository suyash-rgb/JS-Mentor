from pydantic import BaseModel
from typing import List
from datetime import datetime

class DashboardStats(BaseModel):
    active_students: int
    pending_reviews: int
    new_doubts: int
    average_score_percentage: float

class RecentSubmission(BaseModel):
    submission_id: str
    exercise_title: str
    student_id: str
    student_name: str
    status: str
    submitted_at: datetime

class ActiveSession(BaseModel):
    session_id: str
    topic: str
    time_remaining_minutes: int
    student_name: str
    status: str

class DashboardOverview(BaseModel):
    stats: DashboardStats
    recent_submissions: List[RecentSubmission]
    active_sessions: List[ActiveSession]
