"""
Doubt Session Scheduling Engine
================================
Business Rules:
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
    Returns the earliest available datetime slot for the given trainer on target_date,
    or None if no slot fits within the 10 AM–4 PM window.
    """
    start_dt = datetime.combine(target_date, SESSION_START)
    end_dt   = datetime.combine(target_date, SESSION_END)

    # Fetch all booked slots for this trainer on this date, ordered by start time
    booked = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_id,
        MentorshipSession.scheduled_for >= start_dt,
        MentorshipSession.scheduled_for < end_dt,
        MentorshipSession.status.in_(["SCHEDULED", "ACTIVE"])
    ).order_by(MentorshipSession.scheduled_for.asc()).all()

    # Walk through slots starting from 10 AM to find a gap
    cursor = start_dt
    for session in booked:
        session_end = session.scheduled_for + timedelta(minutes=session.duration_minutes)
        if cursor + timedelta(minutes=duration_minutes) <= session.scheduled_for:
            # There's a gap before this existing session
            return cursor
        # Move cursor to end of this booked session
        cursor = max(cursor, session_end)

    # Check if there's room after the last booked session
    if cursor + timedelta(minutes=duration_minutes) <= end_dt:
        return cursor

    return None  # No available slot for this trainer today


# ── Main Engine ───────────────────────────────────────────────────────────────

class SchedulingResult:
    def __init__(self):
        self.scheduled: List[dict] = []
        self.skipped: List[dict]   = []
        self.errors: List[str]     = []


def run_scheduling_engine(db: Session, target_date: date) -> SchedulingResult:
    """
    Main entry point. Processes all OPEN doubts FIFO and assigns them
    to the trainer with the most remaining capacity on target_date.

    Returns a SchedulingResult summary.
    """
    result = SchedulingResult()

    # ── Guard: No sessions on Sunday ─────────────────────────────────────────
    if target_date.weekday() == 6:  # 6 = Sunday in Python
        result.errors.append(
            f"Scheduling rejected: {target_date.strftime('%A %d %b %Y')} is a Sunday. "
            "No doubt sessions are scheduled on Sundays."
        )
        return result

    # ── Step 1: Fetch pending doubts FIFO ────────────────────────────────────
    pending_doubts: List[Doubt] = db.query(Doubt).filter(
        Doubt.status == 'OPEN'
    ).order_by(Doubt.created_at.asc()).all()

    if not pending_doubts:
        result.errors.append("No OPEN doubts found in the queue.")
        return result

    # ── Step 2: Fetch all trainers ────────────────────────────────────────────
    trainers: List[Trainer] = db.query(Trainer).all()

    if not trainers:
        result.errors.append("No trainers found in the database.")
        return result

    # ── Step 3: Process each doubt ────────────────────────────────────────────
    for doubt in pending_doubts:
        duration = get_session_duration(doubt.learning_path_index)

        # Sort trainers by remaining free time DESC (most free time first)
        trainers_sorted = sorted(
            trainers,
            key=lambda t: DAILY_MINUTES - _booked_minutes_for_trainer(db, t.id, target_date),
            reverse=True
        )

        assigned = False
        for trainer in trainers_sorted:
            remaining = DAILY_MINUTES - _booked_minutes_for_trainer(db, trainer.id, target_date)

            # Skip trainer if they don't have enough remaining time
            if remaining < duration:
                continue

            # Find the actual available slot
            slot_start = _next_free_slot(db, trainer.id, target_date, duration)
            if slot_start is None:
                continue

            # ── Create the MentorshipSession ──────────────────────────────────
            session = MentorshipSession(
                trainer_id=trainer.id,
                student_id=doubt.student_id,
                topic=doubt.topic,
                status="SCHEDULED",
                scheduled_for=slot_start,
                duration_minutes=duration,
            )
            db.add(session)
            db.flush()  # Get the session.id without a full commit

            # ── Update the Doubt record ───────────────────────────────────────
            doubt.status = "SCHEDULED"
            doubt.session_id = session.id

            result.scheduled.append({
                "doubt_id": doubt.id,
                "student_id": doubt.student_id,
                "topic": doubt.topic,
                "trainer_id": trainer.id,
                "trainer_name": trainer.name,
                "scheduled_for": slot_start.isoformat(),
                "duration_minutes": duration,
                "session_id": session.id,
            })
            assigned = True
            break  # Move to next doubt

        if not assigned:
            result.skipped.append({
                "doubt_id": doubt.id,
                "topic": doubt.topic,
                "reason": "No trainer had sufficient capacity on this date.",
            })

    # ── Commit all changes atomically ─────────────────────────────────────────
    db.commit()
    return result
