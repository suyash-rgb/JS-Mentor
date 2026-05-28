from datetime import date, datetime, timedelta
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

async def register_doubt(
    payload: RegisterDoubtRequest,
    student: Student,
    db: Session,
):
    learning_path_index = payload.learning_path_index
    if not learning_path_index:
        from app.services.curriculum_service import get_slug_to_index_mapping
        from app.services.wrapper_ai_service import infer_learning_path_index
        import re
        import difflib
        
        mapping = get_slug_to_index_mapping()
        # Clean topic text to find keywords
        topic_lower = payload.topic.lower()
        topic_words = set(re.findall(r'\w+', topic_lower))
        
        # 1. Keyword Fuzzy Match
        for slug, index in mapping.items():
            slug_words = set(slug.split('-'))
            # If any significant slug word (len > 2) is fuzzy matched in the topic
            significant_words = {w for w in slug_words if len(w) > 2}
            if not significant_words:
                continue
                
            match_found = False
            for t_word in topic_words:
                if len(t_word) > 2:
                    # check for fuzzy match (e.g. 'middlewares' vs 'middleware')
                    if difflib.get_close_matches(t_word, significant_words, n=1, cutoff=0.8):
                        match_found = True
                        break
                        
            if match_found:
                learning_path_index = index
                break
        
        # 2. AI Fallback
        if not learning_path_index:
            learning_path_index = await infer_learning_path_index(payload.topic)
            
        # 3. Final Fallback to prevent DB NOT NULL constraint errors
        if not learning_path_index:
            learning_path_index = 1

    duration = get_session_duration(learning_path_index)

    student_profile = student.student_profile
    if not student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found. Please complete your registration.")

    doubt = Doubt(
        student_id=student_profile.id,
        topic=payload.topic,
        description=payload.description,
        learning_path_index=learning_path_index,
        cloudinary_folder=payload.cloudinary_folder,
        status="OPEN",
    )
    db.add(doubt)
    db.commit()
    db.refresh(doubt)

    # Reactive Trigger: Try to schedule immediately
    try:
        target_date = date.today()
        # Look ahead up to 7 days to find a slot
        for _ in range(7):
            # The scheduling engine ignores Sundays internally
            run_scheduling_engine(db, target_date)
            db.refresh(doubt)
            if doubt.status == "SCHEDULED":
                break
            target_date += timedelta(days=1)
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
