from datetime import date, datetime
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.interaction import Doubt, MentorshipSession
from app.models.student import Student
from app.models.user import User
from app.services.scheduler import run_scheduling_engine, get_session_duration
from app.schemas.scheduling import (
    RegisterDoubtRequest,
    RegisterDoubtResponse,
    MyDoubtDetail,
    TrainerSessionSlot,
)

def register_doubt(
    payload: RegisterDoubtRequest,
    student: Student,
    db: Session,
):
    duration = get_session_duration(payload.learning_path_index)

    student_profile = student.student_profile
    if not student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found. Please complete your registration.")

    doubt = Doubt(
        student_id=student_profile.id,
        topic=payload.topic,
        description=payload.description,
        learning_path_index=payload.learning_path_index,
        cloudinary_folder=payload.cloudinary_folder,
        status="OPEN",
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    # Reactive Trigger: Try to schedule immediately
    try:
        run_scheduling_engine(db, date.today())
    except Exception as e:
        print(f"Error during reactive scheduling on doubt registration: {e}")

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

def get_my_doubts(
    student: Student,
    db: Session,
):
    student_profile = student.student_profile
    if not student_profile:
        return []

    doubts = db.query(Doubt).filter(
        Doubt.student_id == student_profile.id
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
            session_id=session.id if session else None,
        ))
    return result

def get_pending_queue(
    db: Session,
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

def get_trainer_sessions(
    target_date: date,
    trainer: User,
    db: Session,
):
    trainer_profile = trainer.trainer_profile
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Trainer profile not found.")

    query = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        MentorshipSession.status.in_(["SCHEDULED", "ACTIVE"]),
    )

    if target_date:
        start_dt = datetime.combine(target_date, datetime.min.time())
        end_dt = datetime.combine(target_date, datetime.max.time())
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
