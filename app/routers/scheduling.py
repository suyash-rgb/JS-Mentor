from datetime import date, datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.student import Student
from app.models.user import User
from app.schemas.scheduling import (
    RegisterDoubtRequest,
    RegisterDoubtResponse,
    MyDoubtDetail,
    TrainerSessionSlot,
)
from app.routers.trainer import require_trainer
from app.routers.payment import is_subscription_active
from app.services import scheduling_service

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
    student: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db),
):
    # Verify premium subscription status
    if not is_subscription_active(student):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Live scheduled sessions require an active premium subscription. Please upgrade to access this feature."
        )
        
    return await scheduling_service.register_doubt(payload, student, db)


# ── Trainer: View Unscheduled Doubt Queue ─────────────────────────────────────

@router.get(
    "/queue",
    summary="Trainer views all unscheduled (OPEN) doubts in the queue",
)
async def get_pending_queue(
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db),
):
    return scheduling_service.get_pending_queue(db)


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
    return scheduling_service.get_trainer_sessions(target_date, trainer, db)
