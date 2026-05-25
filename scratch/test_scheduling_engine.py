import sys
import os
from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date

# Add project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import SessionLocal, Base
from app.models.user import User
from app.models.student import Student
from app.models.trainer import Trainer
from app.models.interaction import Doubt, MentorshipSession
from app.services.scheduler import run_scheduling_engine, SESSION_START
from app.services.scheduling_service import register_doubt
from app.schemas.scheduling import RegisterDoubtRequest

def get_test_date():
    """Returns a valid testing date (not Sunday). Usually tomorrow."""
    target = date.today() + timedelta(days=1)
    if target.weekday() == 6: # Sunday
        target += timedelta(days=1)
    return target

def setup_test_data(db: Session):
    print("--- Setting up test data ---")
    
    # Disable all other trainers to ensure our test trainer is the only one
    db.query(Trainer).update({Trainer.is_available: False})
    db.commit()

    # 1. Create Test Student User
    student_user = db.query(User).filter(User.username == "test_student_sched").first()
    if not student_user:
        student_user = User(username="test_student_sched", email="test_student_sched@example.com", hashed_password="fake", role="student")
        db.add(student_user)
        db.flush()
        student_profile = Student(user_id=student_user.id, name="Test Student Sched", phone_no="1234567890")
        db.add(student_profile)
        db.flush()
    else:
        student_profile = student_user.student_profile

    # 2. Create Test Trainer User
    trainer_user = db.query(User).filter(User.username == "test_trainer_sched").first()
    if not trainer_user:
        trainer_user = User(username="test_trainer_sched", email="test_trainer_sched@example.com", hashed_password="fake", role="trainer")
        db.add(trainer_user)
        db.flush()
        trainer_profile = Trainer(user_id=trainer_user.id, name="Test Trainer Sched", is_available=True)
        db.add(trainer_profile)
        db.flush()
    else:
        trainer_profile = trainer_user.trainer_profile
        trainer_profile.is_available = True
        db.flush()

    # Clean up ALL sessions for this trainer and doubts for this student
    db.query(MentorshipSession).filter(MentorshipSession.trainer_id == trainer_profile.id).delete()
    db.query(Doubt).filter(Doubt.student_id == student_profile.id).delete()
    
    # Also clean up any lingering OPEN doubts to prevent interference
    db.query(Doubt).filter(Doubt.status == 'OPEN').delete()
    
    db.commit()

    return student_user, student_profile, trainer_profile

def test_saturation_and_capacity(db: Session, student_profile, trainer_profile):
    print("\n--- Test 1: Saturation & Capacity (Single Trainer) ---")
    
    # Register 15 doubts of 30 mins each
    for i in range(15):
        doubt = Doubt(
            student_id=student_profile.id,
            topic=f"Topic {i}",
            description="Test description that is at least 20 characters long.",
            learning_path_index=1,
            status="OPEN"
        )
        db.add(doubt)
    db.commit()
    
    target_date = get_test_date()
    result = run_scheduling_engine(db, target_date)
    
    print(f"Scheduled count: {len(result.scheduled)}")
    print(f"Skipped count: {len(result.skipped)}")
    
    sessions = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).all()
    total_minutes = sum(s.duration_minutes for s in sessions)
    
    print(f"Total sessions on {target_date}: {len(sessions)}")
    print(f"Total minutes booked: {total_minutes}")
    
    assert len(sessions) == 12, f"Expected 12, got {len(sessions)}"
    assert total_minutes == 360, f"Expected 360, got {total_minutes}"
    assert len(result.skipped) == 3, f"Expected 3 skipped, got {len(result.skipped)}"

def test_idempotency(db: Session, student_profile, trainer_profile):
    print("\n--- Test 2: Idempotency ---")
    target_date = get_test_date()
    
    count_before = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).count()
    
    run_scheduling_engine(db, target_date)
    
    count_after = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).count()
    
    print(f"Sessions before: {count_before}, after: {count_after}")
    assert count_before == count_after

def test_reactive_trigger(db: Session, student_user, student_profile, trainer_profile):
    print("\n--- Test 3: Reactive Trigger (Immediate Assignment) ---")
    # Note: Reactive trigger uses date.today() in scheduling_service.py
    # So we must check current time.
    
    # Clear future sessions for this trainer to ensure capacity
    db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id,
        cast(MentorshipSession.scheduled_for, Date) >= date.today()
    ).delete()
    db.commit()

    payload = RegisterDoubtRequest(
        topic="Reactive Test Topic",
        description="Testing immediate scheduling with a sufficiently long description.",
        learning_path_index=1,
        cloudinary_folder=None
    )
    
    resp = register_doubt(payload, student_user, db)
    print(f"Doubt status: {resp.status}")
    
    doubt = db.query(Doubt).filter(Doubt.id == resp.doubt_id).first()
    assert doubt.status == "SCHEDULED"
    
    now = datetime.now()
    session = db.query(MentorshipSession).filter(MentorshipSession.id == doubt.session_id).first()
    
    if now.hour >= 16:
        # If it's past 4 PM, it should be scheduled for the next available working day
        next_day = get_test_date() # Usually tomorrow, skipping Sunday
        assert session.scheduled_for.date() == next_day, f"Expected {next_day}, got {session.scheduled_for.date()}"
        print(f"Successfully scheduled for next day: {session.scheduled_for}")
    else:
        # Scheduled for today
        assert session.scheduled_for.date() == date.today()
        print(f"Successfully scheduled for today: {session.scheduled_for}")

def test_trainer_offline(db: Session, student_user, student_profile, trainer_profile):
    print("\n--- Test 4: Trainer Offline ---")
    trainer_profile.is_available = False
    db.commit()
    
    payload = RegisterDoubtRequest(
        topic="Offline Test Topic",
        description="Should stay open even if the description is long enough.",
        learning_path_index=1,
        cloudinary_folder=None
    )
    
    resp = register_doubt(payload, student_user, db)
    print(f"Doubt status: {resp.status}")
    assert resp.status == "OPEN"
    
    trainer_profile.is_available = True
    db.commit()

def test_multi_trainer_saturation(db: Session, student_profile):
    print("\n--- Test 5: Multi-Trainer Saturation Strategy ---")
    target_date = get_test_date()

    # Disable all, then enable 2 specific ones
    db.query(Trainer).update({Trainer.is_available: False})
    db.commit()

    def get_or_create_trainer(name, username):
        u = db.query(User).filter(User.username == username).first()
        if not u:
            u = User(username=username, email=f"{username}@ex.com", hashed_password="fake", role="trainer")
            db.add(u)
            db.flush()
            t = Trainer(user_id=u.id, name=name, is_available=True)
            db.add(t)
        else:
            t = u.trainer_profile
            t.is_available = True
        return t

    t1 = get_or_create_trainer("Trainer 1", "test_trainer_1")
    t2 = get_or_create_trainer("Trainer 2", "test_trainer_2")
    db.commit()

    # Clear sessions for both on target date
    db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id.in_([t1.id, t2.id]),
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).delete()
    db.query(Doubt).filter(Doubt.student_id == student_profile.id).delete()
    db.commit()

    # Register 15 doubts (12 should go to T1, 3 to T2)
    for i in range(15):
        doubt = Doubt(
            student_id=student_profile.id,
            topic=f"Multi-Topic {i}",
            description="Test description for multi-trainer saturation strategy test.",
            learning_path_index=1,
            status="OPEN"
        )
        db.add(doubt)
    db.commit()

    run_scheduling_engine(db, target_date)

    c1 = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == t1.id,
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).count()
    c2 = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == t2.id,
        cast(MentorshipSession.scheduled_for, Date) == target_date
    ).count()

    print(f"Trainer 1 sessions: {c1}")
    print(f"Trainer 2 sessions: {c2}")

    # One MUST be 12, the other 3
    assert (c1 == 12 and c2 == 3) or (c1 == 3 and c2 == 12)

def run_all_tests():
    db = SessionLocal()
    try:
        student_user, student_profile, trainer_profile = setup_test_data(db)
        
        test_saturation_and_capacity(db, student_profile, trainer_profile)
        test_idempotency(db, student_profile, trainer_profile)
        test_reactive_trigger(db, student_user, student_profile, trainer_profile)
        test_trainer_offline(db, student_user, student_profile, trainer_profile)
        test_multi_trainer_saturation(db, student_profile)
        
        print("\n--- ALL SCHEDULING TESTS PASSED ---")
    except Exception as e:
        print(f"\n!!! TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        # Cleanup availability
        db.query(Trainer).update({Trainer.is_available: True})
        db.commit()
        db.close()

if __name__ == "__main__":
    run_all_tests()
