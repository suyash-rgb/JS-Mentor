import json
import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview, PageOverview
from app.dependencies import get_current_user
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
from app.services.curriculum_service import load_data, save_data
from app.services.trainer_service import require_trainer

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
        return curriculum_service.get_full_curriculum()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Curriculum Error: {str(e)}")

@router.get("/grading/submissions", response_model=List[SubmissionDetail])
async def get_grading_submissions(
    trainer= Depends(require_trainer),
    db: Session = Depends(get_db)
):
    try:
        return trainer_service.get_grading_submissions_logic(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching submissions.")



@router.put("/grading/submissions/{submission_id}/grade")
async def grade_submission(
    submission_id: int,
    request: GradeSubmissionRequest,
    trainer= Depends(require_trainer),
    db: Session = Depends(get_db)
):
    return grade_submission(submission_id, request, trainer, db)

@router.get("/cohort-stats")
async def get_cohort_stats(trainer= Depends(require_trainer), db: Session = Depends(get_db)):
    try:
        return trainer_service.get_cohort_stats_logic(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error calculating cohort analytics.")