import json
import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview, PageOverview
from app.dependencies import get_current_user, require_trainer
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.schemas.dashboard import DashboardOverview, DashboardStats, RecentSubmission, ActiveSession
from datetime import datetime
from sqlalchemy import func
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from app.models.interaction import Doubt, MentorshipSession
from app.schemas.grading import SubmissionDetail, GradeSubmissionRequest
from app.services import curriculum_service, trainer_service
from app.services.assets import cleanup_cloudinary_folder
from fastapi import BackgroundTasks

router = APIRouter(prefix="/trainer", tags=["Trainer Tools"])

@router.get("/me/dashboard-overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    trainer= Depends(require_trainer), 
    db: Session = Depends(get_db)
):
    """
    Provides aggregated data for the Trainer Dashboard overview.
    Currently returns structured mock data until full DB tables are implemented for Doubts and Mentorships.
    """
    try:
        return trainer_service.get_dashboard_overview(trainer, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard Error: {str(e)}")

@router.get("/grading/submissions", response_model=List[SubmissionDetail])
async def get_grading_submissions(
    trainer= Depends(require_trainer),
    db: Session = Depends(get_db)
):
    try:
        return trainer_service.get_grading_submissions(trainer, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching submissions: {str(e)}")



@router.put("/grading/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    request: GradeSubmissionRequest,
    trainer= Depends(require_trainer),
    db: Session = Depends(get_db)
):
    return trainer_service.grade_submission(submission_id, request, trainer, db)

@router.get("/cohort-stats")
async def get_cohort_stats(trainer= Depends(require_trainer), db: Session = Depends(get_db)):
    try:
        return trainer_service.get_cohort_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating cohort analytics: {str(e)}")

@router.put("/sessions/{session_id}/resolve", summary="Trainer marks a session as resolved")
async def resolve_session(
    session_id: int,
    background_tasks: BackgroundTasks,
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db)
):
    return await trainer_service.resolve_session(session_id, background_tasks, trainer, db)

@router.put("/me/availability", summary="Trainer toggles their online/offline status")
async def toggle_availability(
    is_available: bool,
    background_tasks: BackgroundTasks,
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db)
):
    return await trainer_service.toggle_availability(is_available, trainer, db)