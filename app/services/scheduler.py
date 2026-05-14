"""
Doubt Session Scheduling Engine
================================
Business Logic:
  - Trainers allocate 6 hrs/day for doubt sessions (10 AM - 4 PM).
  - No sessions on Sundays.
  - Doubts from Learning Paths 1 & 2  → 30-min sessions.
  - Doubts from Learning Paths 3 - 6  → 60-min sessions.
  - Doubts are processed FIFO (oldest created_at first).
  - Trainer with the MOST remaining free time on target_date gets priority.
  - The engine creates a MentorshipSession and links it back to the Doubt.
"""

from datetime import datetime, date, time, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

from app.models.interaction import Doubt, MentorshipSession
from app.models.trainer import Trainer


# ── Constants ────────────────────────────────────────────────────────────────

SESSION_START = time(10, 0)   # 10:00 AM
SESSION_END   = time(16, 0)   # 04:00 PM
DAILY_MINUTES = 360           # 6 hours × 60

# Duration in minutes based on learning path index (1-indexed)
def get_session_duration(learning_path_index: int) -> int:
    """Paths 1 & 2 → 30 min. Paths 3+ → 60 min."""
    return 30 if learning_path_index <= 2 else 60


# ── Helpers ───────────────────────────────────────────────────────────────────

def _booked_minutes_for_trainer(db: Session, trainer_id: int, target_date: date) -> int:
    """
    Calculates how many minutes a trainer already has booked on target_date
    by summing duration_minutes of all SCHEDULED/ACTIVE sessions.
    """
    start_dt = datetime.combine(target_date, SESSION_START)
    end_dt   = datetime.combine(target_date, SESSION_END)

    result = db.query(func.sum(MentorshipSession.duration_minutes)).filter(
        MentorshipSession.trainer_id == trainer_id,
        MentorshipSession.scheduled_for >= start_dt,
        MentorshipSession.scheduled_for < end_dt,
        MentorshipSession.status.in_(["SCHEDULED", "ACTIVE"])
    ).scalar()

    return int(result) if result else 0


def _next_free_slot(
    db: Session,
    trainer_id: int,
    target_date: date,
    duration_minutes: int
) -> Optional[datetime]:
    """
    Returns the earliest available datetime slot for the given trainer on target_date.
    If target_date is today, the search starts from the current time (Dynamic Backfilling).
    """
    start_dt = datetime.combine(target_date, SESSION_START)
    end_dt   = datetime.combine(target_date, SESSION_END)

    # Walk through slots starting from 10 AM or CURRENT TIME (if today)
    cursor = start_dt
    if target_date == date.today():
        now = datetime.now()
        # Round up to next 5-minute mark for cleaner scheduling
        now_rounded = now + timedelta(minutes=(5 - now.minute % 5) % 5)
        now_rounded = now_rounded.replace(second=0, microsecond=0)
        cursor = max(cursor, now_rounded)

    # Fetch all booked slots for this trainer on this date
    booked = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_id,
        MentorshipSession.scheduled_for >= start_dt,
        MentorshipSession.scheduled_for < end_dt,
        MentorshipSession.status.in_(["SCHEDULED", "ACTIVE"])
    ).order_by(MentorshipSession.scheduled_for.asc()).all()

    for session in booked:
        session_end = session.scheduled_for + timedelta(minutes=session.duration_minutes)
        if cursor + timedelta(minutes=duration_minutes) <= session.scheduled_for:
            return cursor
        cursor = max(cursor, session_end)

    if cursor + timedelta(minutes=duration_minutes) <= end_dt:
        return cursor

    return None


# ── Main Engine ───────────────────────────────────────────────────────────────

class SchedulingResult:
    def __init__(self):
        self.scheduled: List[dict] = []
        self.skipped: List[dict]   = []
        self.errors: List[str]     = []


def run_scheduling_engine(db: Session, target_date: date) -> SchedulingResult:
    """
    Main entry point. Processes all OPEN doubts FIFO and assigns them
    using a SATURATION strategy (fill one trainer before moving to next).
    """
    result = SchedulingResult()

    if target_date.weekday() == 6:
        result.errors.append(f"Scheduling rejected: {target_date.strftime('%A')} is Sunday.")
        return result

    pending_doubts = db.query(Doubt).filter(Doubt.status == 'OPEN').order_by(Doubt.created_at.asc()).all()
    if not pending_doubts:
        return result

    # Filter by is_available
    trainers = db.query(Trainer).filter(Trainer.is_available == True).all()
    if not trainers:
        result.errors.append("No available trainers online.")
        return result

    for doubt in pending_doubts:
        duration = get_session_duration(doubt.learning_path_index)

        # SATURATION SORT: Sort by BOOKED minutes DESC (fill the busy ones first)
        trainers_sorted = sorted(
            trainers,
            key=lambda t: _booked_minutes_for_trainer(db, t.id, target_date),
            reverse=True
        )

        assigned = False
        for trainer in trainers_sorted:
            # Check total daily capacity limit
            booked = _booked_minutes_for_trainer(db, trainer.id, target_date)
            if booked + duration > DAILY_MINUTES:
                continue

            slot_start = _next_free_slot(db, trainer.id, target_date, duration)
            if slot_start:
                session = MentorshipSession(
                    trainer_id=trainer.id,
                    student_id=doubt.student_id,
                    topic=doubt.topic,
                    status="SCHEDULED",
                    scheduled_for=slot_start,
                    duration_minutes=duration,
                )
                db.add(session)
                db.flush()
                doubt.status = "SCHEDULED"
                doubt.session_id = session.id
                
                result.scheduled.append({"doubt_id": doubt.id, "trainer": trainer.name, "at": slot_start.isoformat()})
                assigned = True
                break

        if not assigned:
            result.skipped.append({"doubt_id": doubt.id, "reason": "No capacity/slots."})

    db.commit()
    return result
