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

@router.get("/practice-engagement")
async def get_practice_engagement(trainer=Depends(require_trainer), db: Session = Depends(get_db)):
    try:
        return trainer_service.get_practice_engagement(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching engagement data: {str(e)}")

from app.models.cohort import Cohort, GroupClass, GroupClassStatus
from app.schemas.cohort import CohortCreate, CohortResponse, GroupClassCreate, GroupClassResponse

@router.get("/students")
async def get_students_for_cohort(trainer=Depends(require_trainer), db: Session = Depends(get_db)):
    students = db.query(Student).all()
    return [{"id": s.id, "name": s.name, "cohort_id": s.cohort_id} for s in students]

@router.post("/cohorts", response_model=CohortResponse)
async def create_cohort(
    cohort_data: CohortCreate,
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    new_cohort = Cohort(
        name=cohort_data.name,
        trainer_id=trainer.trainer_profile.id if trainer.trainer_profile else None
    )
    db.add(new_cohort)
    db.flush()

    if cohort_data.student_ids:
        db.query(Student).filter(Student.id.in_(cohort_data.student_ids)).update(
            {"cohort_id": new_cohort.id},
            synchronize_session=False
        )
    db.commit()
    
    return CohortResponse(
        id=new_cohort.id,
        name=new_cohort.name,
        trainer_id=new_cohort.trainer_id,
        student_count=len(cohort_data.student_ids)
    )

@router.get("/cohorts", response_model=List[CohortResponse])
async def list_cohorts(
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    from app.services.cohort_service import auto_assign_students_fcfs, ensure_today_classes_scheduled
    from sqlalchemy import cast, Date
    from datetime import date
    
    # 1. Trigger automated FCFS cohort assignment
    await auto_assign_students_fcfs(db)
    
    # 2. Trigger automated class scheduling for today's classes
    trainer_id = trainer.trainer_profile.id if trainer.trainer_profile else None
    if trainer_id:
        await ensure_today_classes_scheduled(db, trainer_id)
        
    cohorts = db.query(Cohort).filter(Cohort.trainer_id == trainer_id).all()
    
    res = []
    today = date.today()
    for c in cohorts:
        student_count = db.query(Student).filter(Student.cohort_id == c.id).count()
        
        # Fetch today's scheduled class for this cohort (if any)
        today_class = db.query(GroupClass).filter(
            GroupClass.cohort_id == c.id,
            cast(GroupClass.scheduled_for, Date) == today
        ).first()
        
        today_class_resp = None
        if today_class:
            today_class_resp = GroupClassResponse(
                id=today_class.id,
                cohort_id=today_class.cohort_id,
                cohort_name=c.name,
                trainer_id=today_class.trainer_id,
                trainer_name=trainer.trainer_profile.name if trainer.trainer_profile else "Trainer",
                title=today_class.title,
                topic=today_class.topic,
                status=today_class.status,
                scheduled_for=today_class.scheduled_for,
                duration_minutes=today_class.duration_minutes,
                created_at=today_class.created_at
            )
            
        res.append(CohortResponse(
            id=c.id,
            name=c.name,
            trainer_id=c.trainer_id,
            student_count=student_count,
            students=[{"id": s.id, "name": s.name} for s in c.students],
            today_class=today_class_resp
        ))
    return res

@router.post("/schedule-class", response_model=GroupClassResponse)
async def schedule_group_class(
    class_data: GroupClassCreate,
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    cohort = db.query(Cohort).filter(Cohort.id == class_data.cohort_id).first()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")

    new_class = GroupClass(
        cohort_id=class_data.cohort_id,
        trainer_id=trainer.trainer_profile.id if trainer.trainer_profile else None,
        title=class_data.title,
        topic=class_data.topic,
        scheduled_for=class_data.scheduled_for,
        duration_minutes=class_data.duration_minutes,
        status=GroupClassStatus.SCHEDULED
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)

    try:
        from app.routers.signaling import sio
        students = db.query(Student).filter(Student.cohort_id == class_data.cohort_id).all()
        for s in students:
            await sio.emit("new-group-class-scheduled", {
                "class_id": new_class.id,
                "title": new_class.title,
                "topic": new_class.topic,
                "scheduled_for": new_class.scheduled_for.isoformat(),
                "duration_minutes": new_class.duration_minutes,
                "mentor": trainer.trainer_profile.name if trainer.trainer_profile else "Mentor"
            }, room=f"global_user_{s.user_id}")
    except Exception as n_err:
        print(f"Failed to broadcast class notification: {n_err}")

    return GroupClassResponse(
        id=new_class.id,
        cohort_id=new_class.cohort_id,
        cohort_name=cohort.name,
        trainer_id=new_class.trainer_id,
        trainer_name=trainer.trainer_profile.name if trainer.trainer_profile else "Trainer",
        title=new_class.title,
        topic=new_class.topic,
        status=new_class.status,
        scheduled_for=new_class.scheduled_for,
        duration_minutes=new_class.duration_minutes,
        created_at=new_class.created_at
    )

@router.get("/classes", response_model=List[GroupClassResponse])
async def list_trainer_classes(
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    trainer_id = trainer.trainer_profile.id if trainer.trainer_profile else None
    classes = db.query(GroupClass).filter(GroupClass.trainer_id == trainer_id).order_by(GroupClass.scheduled_for.desc()).all()
    
    res = []
    for c in classes:
        res.append(GroupClassResponse(
            id=c.id,
            cohort_id=c.cohort_id,
            cohort_name=c.cohort.name if c.cohort else "Unknown Cohort",
            trainer_id=c.trainer_id,
            trainer_name=c.trainer.name if c.trainer else "Trainer",
            title=c.title,
            topic=c.topic,
            status=c.status,
            scheduled_for=c.scheduled_for,
            duration_minutes=c.duration_minutes,
            created_at=c.created_at
        ))
    return res

@router.get("/classes/{class_id}", response_model=GroupClassResponse, summary="Trainer gets details of a single group class")
async def get_trainer_class(
    class_id: int,
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    c = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    return GroupClassResponse(
        id=c.id,
        cohort_id=c.cohort_id,
        cohort_name=c.cohort.name if c.cohort else "Cohort",
        trainer_id=c.trainer_id,
        trainer_name=c.trainer.name if c.trainer else "Trainer",
        title=c.title,
        topic=c.topic,
        status=c.status,
        scheduled_for=c.scheduled_for,
        duration_minutes=c.duration_minutes,
        created_at=c.created_at
    )