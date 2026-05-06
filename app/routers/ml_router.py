from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.ml_service import MLService
from pydantic import BaseModel

router = APIRouter(
    prefix="/ml",
    tags=["Machine Learning"]
)

class StudentData(BaseModel):
    progress_status: str
    time_spent_seconds: int
    avg_exercise_attempts: float
    avg_exercise_execution_time_ms: int
    exercise_is_correct_ratio: float
    quiz_score: float
    quiz_attempt_number: int

@router.post("/predict_risk")
def predict_risk(student: StudentData):
    """Predicts risk for raw data provided in the request body."""
    return MLService.predict_single(student.model_dump())

@router.get("/high_risk_students")
def get_all_high_risk(db: Session = Depends(get_db)):
    """
    Fetches all students, calculates their real-time metrics 
    from the DB, and returns only those flagged as HIGH risk.
    """
    return MLService.get_high_risk_students(db)