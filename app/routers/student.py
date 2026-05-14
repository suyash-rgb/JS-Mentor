from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User
from app.models.student import Student
from app.schemas.analytics import ProgressUpdate, ExerciseSubmission, QuizSubmission
from app.schemas.scheduling import MyDoubtDetail
from app.services import student_service

router = APIRouter(prefix="/student", tags=["Student Features"])

@router.post("/progress", summary="Log student learning progress")
async def log_progress(
    progress_in: ProgressUpdate, 
    user: User = Depends(get_current_clerk_student), 
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_progress(progress_in, student, db)

@router.post("/exercise", summary="Log exercise submission")
async def log_exercise(
    exercise_in: ExerciseSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_exercise(exercise_in, student, db)

@router.post("/quiz", summary="Log quiz performance")
async def log_quiz(
    quiz_in: QuizSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_quiz(quiz_in, student, db)

@router.get("/doubts/mine", response_model=List[MyDoubtDetail], summary="Student views all their doubt requests and session status")
async def get_my_doubts(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db),
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.get_my_doubts(student, db)
