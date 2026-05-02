"""
Scheduling Router
=================
Endpoints:
  Student:
    POST /api/v1/schedule/doubts/register      – Student registers a doubt
    GET  /api/v1/schedule/doubts/mine          – Student views their own doubts

  Trainer / Admin:
    POST /api/v1/schedule/run                  – Trigger the scheduling engine
    GET  /api/v1/schedule/queue                – View unscheduled OPEN doubts
    GET  /api/v1/schedule/trainer/my-sessions  – Trainer views their session calendar
"""

from datetime import date, datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_clerk_student, get_current_user
from app.models.interaction import Doubt, MentorshipSession
from app.models.user import User, UserRole
from app.models.student import Student
from app.services.scheduler import run_scheduling_engine, get_session_duration
from app.schemas.scheduling import (
    RegisterDoubtRequest,
    RegisterDoubtResponse,
    MyDoubtDetail,
    RunSchedulerRequest,
    RunSchedulerResponse,
    TrainerSessionSlot,
)
from app.routers.trainer import require_trainer

router = APIRouter(prefix="/schedule", tags=["Scheduling Engine"])


# ── Student: Register a Doubt ─────────────────────────────────────────────────

@router.post(
    "/doubts/register",
    response_model=RegisterDoubtResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Student registers a new doubt for session scheduling",
)
async def register_doubt(
    payload: RegisterDoubtRequest,
    student: Student = Depends(get_current_clerk_student),
    db: Session = Depends(get_db),
):
    """
    A student submits a doubt. The engine will assign it to a trainer
    in the next scheduling run. The duration is auto-calculated:
      - Learning Paths 1 & 2 → 30 minutes
      - Learning Paths 3 – 6 → 60 minutes
    """
    duration = get_session_duration(payload.learning_path_index)

    doubt = Doubt(
        student_id=student.id,
        topic=payload.topic,
        description=payload.description,
        learning_path_index=payload.learning_path_index,
        status="OPEN",
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    return RegisterDoubtResponse(
        doubt_id=doubt.id,
        topic=doubt.topic,
        duration_minutes=duration,
        status=doubt.status,
        message=(
            f"Your doubt has been registered! A {duration}-minute session will be "
            "scheduled for you. Check 'My Sessions' for updates."
        ),
    )


# ── Student: View Their Own Doubts ────────────────────────────────────────────

@router.get(
    "/doubts/mine",
    response_model=List[MyDoubtDetail],
    summary="Student views all their doubt requests and session status",
)
async def get_my_doubts(
    student: Student = Depends(get_current_clerk_student),
    db: Session = Depends(get_db),
):
    doubts = db.query(Doubt).filter(
        Doubt.student_id == student.id
    ).order_by(Doubt.created_at.desc()).all()

    result = []
    for d in doubts:
        session = d.session  # Linked MentorshipSession (None if not yet scheduled)
        result.append(MyDoubtDetail(
            doubt_id=d.id,
            topic=d.topic,
            description=d.description,
            learning_path_index=d.learning_path_index,
            status=d.status,
            created_at=d.created_at,
            scheduled_for=session.scheduled_for if session else None,
            trainer_name=session.trainer.name if session and session.trainer else None,
            duration_minutes=session.duration_minutes if session else None,
        ))
    return result


# ── Trainer: Trigger the Scheduling Engine ────────────────────────────────────

@router.post(
    "/run",
    response_model=RunSchedulerResponse,
    summary="Trainer triggers the scheduling engine for a specific date",
)
async def trigger_scheduler(
    payload: RunSchedulerRequest,
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db),
):
    """
    Runs the FIFO greedy scheduling algorithm for the given target_date.
    - Rejected for Sundays.
    - Assigns all OPEN doubts to trainers based on available capacity.
    - Creates MentorshipSession records and links them back to Doubts.
    """
    result = run_scheduling_engine(db, payload.target_date)

    return RunSchedulerResponse(
        target_date=str(payload.target_date),
        total_pending=len(result.scheduled) + len(result.skipped),
        scheduled_count=len(result.scheduled),
        skipped_count=len(result.skipped),
        scheduled=result.scheduled,
        skipped=result.skipped,
        errors=result.errors,
    )


# ── Trainer: View Unscheduled Doubt Queue ─────────────────────────────────────

@router.get(
    "/queue",
    summary="Trainer views all unscheduled (OPEN) doubts in the queue",
)
async def get_pending_queue(
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db),
):
    """Returns all OPEN doubts in FIFO order, with their expected session duration."""
    pending = db.query(Doubt).filter(
        Doubt.status == 'OPEN'
    ).order_by(Doubt.created_at.asc()).all()

    return [
        {
            "doubt_id": d.id,
            "student_name": d.student.name if d.student else "Unknown",
            "topic": d.topic,
            "description": d.description,
            "learning_path_index": d.learning_path_index,
            "expected_duration_minutes": get_session_duration(d.learning_path_index),
            "submitted_at": d.created_at.isoformat(),
        }
        for d in pending
    ]


# ── Trainer: View Their Own Session Calendar ──────────────────────────────────

@router.get(
    "/trainer/my-sessions",
    response_model=List[TrainerSessionSlot],
    summary="Trainer views their scheduled doubt sessions",
)
async def get_trainer_sessions(
    target_date: date = None,
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db),
):
    """
    Returns the logged-in trainer's scheduled sessions.
    Optionally filter by a specific date (YYYY-MM-DD).
    """
    trainer_profile = trainer.trainer_profile
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Trainer profile not found.")

    query = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        MentorshipSession.status.in_(["SCHEDULED", "ACTIVE"]),
    )

    if target_date:
        start_dt = datetime.combine(target_date, __import__('datetime').time(0, 0))
        end_dt = datetime.combine(target_date, __import__('datetime').time(23, 59, 59))
        query = query.filter(
            MentorshipSession.scheduled_for >= start_dt,
            MentorshipSession.scheduled_for <= end_dt,
        )

    sessions = query.order_by(MentorshipSession.scheduled_for.asc()).all()

    return [
        TrainerSessionSlot(
            session_id=s.id,
            student_name=s.student.name if s.student else "Unknown",
            topic=s.topic,
            scheduled_for=s.scheduled_for,
            duration_minutes=s.duration_minutes,
            status=s.status,
        )
        for s in sessions
    ]
