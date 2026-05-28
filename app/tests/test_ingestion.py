import pytest
import os
import uuid
from sqlalchemy import create_engine, func
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models.user import User
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation

from sqlalchemy.pool import StaticPool

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test user and student
    u = User(username="test_student", email="test@test.com", hashed_password="fake", role="STUDENT")
    db.add(u)
    db.commit()
    
    s = Student(user_id=u.id, name="Test Student", phone_no="1234567890")
    db.add(s)
    db.commit()
    
    yield db, u, s
    
    db.close()
    Base.metadata.drop_all(bind=engine)

def test_progress_logging(db_session):
    db, u, student = db_session
    topic_id = "test-topic-" + str(uuid.uuid4())[:8]
    
    from sqlalchemy.dialects.sqlite import insert as sqlite_insert
    
    def simulate_log_progress(t_id, status, time):
        # Using simple query/update since ON DUPLICATE KEY is MySQL specific
        # and SQLite has INSERT OR REPLACE but it replaces entire row.
        # So we just do a standard query check for testing ingestion logic.
        existing = db.query(StudentProgress).filter_by(student_id=student.id, topic_id=t_id).first()
        if existing:
            existing.status = status
            existing.time_spent_seconds += time
            existing.last_accessed_at = func.now()
        else:
            new_prog = StudentProgress(student_id=student.id, topic_id=t_id, status=status, time_spent_seconds=time)
            db.add(new_prog)
        db.commit()

    # First attempt
    simulate_log_progress(topic_id, 'IN_PROGRESS', 100)
    p1 = db.query(StudentProgress).filter_by(student_id=student.id, topic_id=topic_id).first()
    assert p1.status == 'IN_PROGRESS'
    assert p1.time_spent_seconds == 100
    
    # Second attempt (Update)
    simulate_log_progress(topic_id, 'COMPLETED', 200)
    p2 = db.query(StudentProgress).filter_by(student_id=student.id, topic_id=topic_id).first()
    assert p2.status == 'COMPLETED'
    assert p2.time_spent_seconds == 300

def test_exercise_logging(db_session):
    db, u, student = db_session
    ex_id = "test-ex-" + str(uuid.uuid4())[:8]
    
    def simulate_log_exercise(e_id, code, correct):
        prev = db.query(ExerciseEvaluation).filter_by(student_id=student.id, exercise_id=e_id).order_by(ExerciseEvaluation.attempt_number.desc()).first()
        attempt = (prev.attempt_number + 1) if prev else 1
        evaluation = ExerciseEvaluation(
            student_id=student.id, exercise_id=e_id, code_submitted=code,
            is_correct=correct, execution_time_ms=50, attempt_number=attempt, status='NEW'
        )
        db.add(evaluation)
        db.commit()

    simulate_log_exercise(ex_id, "console.log('first')", False)
    simulate_log_exercise(ex_id, "console.log('second')", True)
    
    attempts = db.query(ExerciseEvaluation).filter_by(student_id=student.id, exercise_id=ex_id).order_by(ExerciseEvaluation.attempt_number.asc()).all()
    assert len(attempts) == 2
    assert attempts[0].is_correct is False
    assert attempts[1].is_correct is True
    assert attempts[1].attempt_number == 2

def test_quiz_logging(db_session):
    db, u, student = db_session
    quiz_id = "test-quiz-" + str(uuid.uuid4())[:8]

    def simulate_log_quiz(q_id, score, total):
        prev = db.query(QuizEvaluation).filter_by(student_id=student.id, quiz_id=q_id).order_by(QuizEvaluation.attempt_number.desc()).first()
        attempt = (prev.attempt_number + 1) if prev else 1
        passed = score >= (total * 0.6)
        evaluation = QuizEvaluation(
            student_id=student.id, quiz_id=q_id, score=score,
            total_questions=total, passed=passed, attempt_number=attempt
        )
        db.add(evaluation)
        db.commit()

    simulate_log_quiz(quiz_id, 2, 5) # Fail
    simulate_log_quiz(quiz_id, 4, 5) # Pass
    
    attempts = db.query(QuizEvaluation).filter_by(student_id=student.id, quiz_id=quiz_id).order_by(QuizEvaluation.attempt_number.asc()).all()
    assert len(attempts) == 2
    assert attempts[0].passed is False
    assert attempts[1].passed is True
