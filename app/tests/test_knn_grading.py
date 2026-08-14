import pytest
import os
import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import patch, MagicMock

# Force Qdrant to run in-memory for testing
import shutil

TEST_QDRANT_PATH = "./test_qdrant_data"
os.environ["QDRANT_PATH"] = TEST_QDRANT_PATH

from app.database import Base
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.learning import ExerciseEvaluation
from app.schemas.analytics import ExerciseSubmission
from app.schemas.grading import GradeSubmissionRequest
from app.services.student_service import log_exercise
from app.services.trainer_service import grade_submission
from app.services.vector_service import VectorService

from sqlalchemy.pool import StaticPool

DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create trainer
    t_user = User(username="test_trainer", email="trainer@test.com", hashed_password="fake", role="TRAINER")
    db.add(t_user)
    db.commit()
    
    from app.models.trainer import Trainer
    trainer_profile = Trainer(user_id=t_user.id, name="Test Trainer", is_available=True)
    db.add(trainer_profile)
    db.commit()
    
    # Create student 1
    u1 = User(username="student1", email="student1@test.com", hashed_password="fake", role="STUDENT")
    db.add(u1)
    db.commit()
    s1 = Student(user_id=u1.id, name="Student One", phone_no="12345")
    db.add(s1)
    db.commit()

    # Create student 2
    u2 = User(username="student2", email="student2@test.com", hashed_password="fake", role="STUDENT")
    db.add(u2)
    db.commit()
    s2 = Student(user_id=u2.id, name="Student Two", phone_no="67890")
    db.add(s2)
    db.commit()
    
    yield db, t_user, s1, s2
    
    db.close()
    Base.metadata.drop_all(bind=engine)
    if os.path.exists(TEST_QDRANT_PATH):
        try:
            shutil.rmtree(TEST_QDRANT_PATH)
        except Exception:
            pass

def test_knn_automated_grading_flow(db_session):
    db, trainer_user, student1, student2 = db_session
    exercise_id = "ex_sum_1"

    # Define mock embeddings:
    # Vector A: base solution
    vector_a = [1.0] * 383 + [0.0]
    # Vector B: similar solution (cosine similarity close to 1.0)
    vector_b = [1.0] * 383 + [0.01]
    # Vector C: completely different solution
    vector_c = [0.0] * 383 + [1.0]

    # --- STEP 1: Student 1 submits code. Should be PENDING_REVIEW ---
    sub1_payload = ExerciseSubmission(
        exercise_id=exercise_id,
        code_submitted="function sum(a, b) { return a + b; }",
        is_correct=True,
        execution_time_ms=10,
        total_tests=5,
        tests_passed=5
    )

    with patch('app.services.ml_service.MLService.generate_code_embedding', return_value=vector_a):
        resp1 = log_exercise(sub1_payload, student1, db)
        assert resp1["message"] == "Exercise submission logged successfully"

    # Fetch and check submission 1 from MySQL
    eval1 = db.query(ExerciseEvaluation).filter_by(student_id=student1.id, exercise_id=exercise_id).first()
    assert eval1 is not None
    assert eval1.status == "PENDING_REVIEW"
    assert eval1.feedback is None
    assert eval1.grade == 5  # Initial auto-calculated grade (5/5)

    # --- STEP 2: Trainer grades Submission 1 ---
    grade_req = GradeSubmissionRequest(score=5, feedback="Perfect sum implementation!")
    
    grade_submission(
        submission_id=eval1.id,
        request=grade_req,
        trainer=trainer_user,
        db=db
    )

    # Check MySQL status
    db.refresh(eval1)
    assert eval1.status == "GRADED"
    assert eval1.feedback == "Perfect sum implementation!"

    # Verify that it was successfully saved to Qdrant collection
    # We query Qdrant directly via VectorService to check if it's there
    match_exact = VectorService.search_similar_submission(
        db=db,
        exercise_id=exercise_id,
        embedding=vector_a,
        threshold=0.99
    )
    assert match_exact is not None
    assert match_exact["feedback"] == "Perfect sum implementation!"
    assert match_exact["grade"] == 5

    # --- STEP 3: Student 2 submits a highly similar solution. Should trigger AUTO_REVIEWED ---
    sub2_payload = ExerciseSubmission(
        exercise_id=exercise_id,
        code_submitted="function sum(x, y) { return x + y; }",  # similar code
        is_correct=True,
        execution_time_ms=12,
        total_tests=5,
        tests_passed=5
    )

    with patch('app.services.ml_service.MLService.generate_code_embedding', return_value=vector_b):
        resp2 = log_exercise(sub2_payload, student2, db)
        assert resp2["message"] == "Exercise submission logged successfully"

    # Fetch and check submission 2 from MySQL
    eval2 = db.query(ExerciseEvaluation).filter_by(student_id=student2.id, exercise_id=exercise_id).first()
    assert eval2 is not None
    assert eval2.status == "AUTO_REVIEWED"
    assert eval2.feedback == "Perfect sum implementation!"  # Recycled feedback
    assert eval2.grade == 5

    # --- STEP 4: Student 2 submits a completely different solution. Should remain PENDING_REVIEW ---
    sub3_payload = ExerciseSubmission(
        exercise_id=exercise_id,
        code_submitted="function multiply(a, b) { return a * b; }",  # different logic
        is_correct=True,
        execution_time_ms=15,
        total_tests=5,
        tests_passed=5
    )

    with patch('app.services.ml_service.MLService.generate_code_embedding', return_value=vector_c):
        # We need to make sure we don't match the existing sum evaluation
        resp3 = log_exercise(sub3_payload, student2, db)
        assert resp3["message"] == "Exercise submission logged successfully"

    # Fetch and check submission 3
    eval3 = db.query(ExerciseEvaluation).filter_by(student_id=student2.id, exercise_id=exercise_id).all()
    # Find the attempt with the different code
    eval3_diff = next(ev for ev in eval3 if "multiply" in ev.code_submitted)
    assert eval3_diff.status == "PENDING_REVIEW"
    assert eval3_diff.feedback is None
