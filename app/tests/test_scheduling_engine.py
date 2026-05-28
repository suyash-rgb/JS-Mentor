import pytest
import os
import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine, cast, Date
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.student import Student
from app.models.trainer import Trainer
from app.models.interaction import Doubt, MentorshipSession
from app.services.scheduler import run_scheduling_engine
from app.services.scheduling_service import register_doubt
from app.schemas.scheduling import RegisterDoubtRequest

from sqlalchemy.pool import StaticPool

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def setup_data(db_session):
    db = db_session
    # 1. Create Test Student User
    student_user = User(username="test_student_sched", email="s@ex.com", hashed_password="fake", role="STUDENT")
    db.add(student_user)
    db.flush()
    student_profile = Student(user_id=student_user.id, name="Test Student Sched", phone_no="1234567890")
    db.add(student_profile)
    
    # 2. Create Test Trainer User
    trainer_user = User(username="test_trainer_sched", email="t@ex.com", hashed_password="fake", role="TRAINER")
    db.add(trainer_user)
    db.flush()
    trainer_profile = Trainer(user_id=trainer_user.id, name="Test Trainer Sched", is_available=True)
    db.add(trainer_profile)
    db.commit()
    
    return db, student_user, student_profile, trainer_profile

def get_test_date():
    target = date.today() + timedelta(days=1)
    if target.weekday() == 6: # Sunday
        target += timedelta(days=1)
    return target

def test_saturation_and_capacity(setup_data):
    db, _, student_profile, trainer_profile = setup_data
    
    # Register 30 doubts
    for i in range(30):
        doubt = Doubt(
            student_id=student_profile.id,
            topic=f"Topic {i}",
            description="Test description that is at least 20 chars long.",
            learning_path_index=1,
            status="OPEN"
        )
        db.add(doubt)
    db.commit()
    
    target_date = get_test_date()
    result = run_scheduling_engine(db, target_date)
    
    sessions = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id
    ).all()
    total_minutes = sum(s.duration_minutes for s in sessions)
    
    assert len(sessions) == 27, f"Failed! Errors: {result.errors}, Skipped: {result.skipped}"
    assert total_minutes == 810
    assert len(result.skipped) == 3

def test_idempotency(setup_data):
    db, _, student_profile, trainer_profile = setup_data
    target_date = get_test_date()
    
    count_before = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id
    ).count()
    
    run_scheduling_engine(db, target_date)
    
    count_after = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == trainer_profile.id
    ).count()
    
    assert count_before == count_after

@pytest.mark.asyncio
async def test_reactive_trigger(setup_data):
    db, student_user, student_profile, trainer_profile = setup_data
    
    payload = RegisterDoubtRequest(
        topic="Reactive Test Topic",
        description="Testing immediate scheduling with a sufficiently long description.",
        learning_path_index=1,
        cloudinary_folder=None
    )
    
    resp = await register_doubt(payload, student_user, db)
    assert resp.status == "SCHEDULED"
    
    doubt = db.query(Doubt).filter_by(id=resp.doubt_id).first()
    assert doubt.status == "SCHEDULED"
    
    session = db.query(MentorshipSession).filter_by(id=doubt.session_id).first()
    assert session.scheduled_for.date() == date.today()

@pytest.mark.asyncio
async def test_trainer_offline(setup_data):
    db, student_user, student_profile, trainer_profile = setup_data
    trainer_profile.is_available = False
    db.commit()
    
    payload = RegisterDoubtRequest(
        topic="Offline Test Topic",
        description="Should stay open even if the description is long enough.",
        learning_path_index=1,
        cloudinary_folder=None
    )
    
    resp = await register_doubt(payload, student_user, db)
    assert resp.status == "OPEN"
    
    doubt = db.query(Doubt).filter_by(id=resp.doubt_id).first()
    assert doubt.status == "OPEN"
    
    from app.services.trainer_service import toggle_availability
    trainer_user = db.query(User).filter_by(id=trainer_profile.user_id).first()
    await toggle_availability(is_available=True, trainer=trainer_user, db=db)
    
    db.refresh(doubt)
    assert doubt.status == "SCHEDULED"

def test_multi_trainer_saturation(db_session):
    db = db_session
    
    # 1. Create Test Student User
    student_user = User(username="test_student", email="s@ex.com", hashed_password="fake", role="STUDENT")
    db.add(student_user)
    db.flush()
    student_profile = Student(user_id=student_user.id, name="Test Student Sched", phone_no="1234567890")
    db.add(student_profile)
    
    def get_or_create_trainer(name, username):
        u = User(username=username, email=f"{username}@ex.com", hashed_password="fake", role="TRAINER")
        db.add(u)
        db.flush()
        t = Trainer(user_id=u.id, name=name, is_available=True)
        db.add(t)
        return t

    t1 = get_or_create_trainer("Trainer 1", "test_trainer_1")
    t2 = get_or_create_trainer("Trainer 2", "test_trainer_2")
    db.commit()

    target_date = get_test_date()

    for i in range(35):
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
        MentorshipSession.trainer_id == t1.id
    ).count()
    c2 = db.query(MentorshipSession).filter(
        MentorshipSession.trainer_id == t2.id
    ).count()

    assert (c1 == 27 and c2 == 8) or (c1 == 8 and c2 == 27)
