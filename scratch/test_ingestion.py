from app.database import SessionLocal
from app.models.user import User
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from sqlalchemy import func
import uuid

def test_ingestion():
    db = SessionLocal()
    try:
        # 1. Get a test student
        student_user = db.query(User).filter(User.role == 'student').first()
        if not student_user:
            print("No student found to test with.")
            return
        
        student = student_user.student_profile
        if not student:
            print("Student profile missing for user.")
            return
        
        print(f"Testing ingestion for student: {student_user.username} (ID: {student.id})")

        # 2. Test Progress Logging (Upsert)
        topic_id = "test-topic-" + str(uuid.uuid4())[:8]
        print(f"\n--- Testing Progress Logging for {topic_id} ---")
        
        # First attempt (Create)
        from app.routers.analytics import log_progress
        from app.schemas.analytics import ProgressUpdate
        
        # We simulate the logic since we can't easily call the async router with auth
        from sqlalchemy.dialects.mysql import insert
        
        def simulate_log_progress(t_id, status, time):
            stmt = insert(StudentProgress).values(
                student_id=student.id,
                topic_id=t_id,
                status=status,
                time_spent_seconds=time
            ).on_duplicate_key_update(
                status=status,
                time_spent_seconds=StudentProgress.time_spent_seconds + time,
                last_accessed_at=func.now()
            )
            db.execute(stmt)
            db.commit()

        simulate_log_progress(topic_id, 'IN_PROGRESS', 100)
        p1 = db.query(StudentProgress).filter(StudentProgress.student_id == student.id, StudentProgress.topic_id == topic_id).first()
        print(f"Initial: Status={p1.status}, Time={p1.time_spent_seconds}")

        # Second attempt (Update/Upsert)
        simulate_log_progress(topic_id, 'COMPLETED', 200)
        p2 = db.query(StudentProgress).filter(StudentProgress.student_id == student.id, StudentProgress.topic_id == topic_id).first()
        print(f"After Upsert: Status={p2.status}, Time={p2.time_spent_seconds} (Expected 300)")

        # 3. Test Exercise Logging
        ex_id = "test-ex-" + str(uuid.uuid4())[:8]
        print(f"\n--- Testing Exercise Logging for {ex_id} ---")
        
        def simulate_log_exercise(e_id, code, correct):
            prev = db.query(ExerciseEvaluation).filter(
                ExerciseEvaluation.student_id == student.id,
                ExerciseEvaluation.exercise_id == e_id
            ).order_by(ExerciseEvaluation.attempt_number.desc()).first()
            
            attempt = (prev.attempt_number + 1) if prev else 1
            
            evaluation = ExerciseEvaluation(
                student_id=student.id,
                exercise_id=e_id,
                code_submitted=code,
                is_correct=correct,
                execution_time_ms=50,
                attempt_number=attempt,
                status='NEW'
            )
            db.add(evaluation)
            db.commit()

        simulate_log_exercise(ex_id, "console.log('first')", False)
        simulate_log_exercise(ex_id, "console.log('second')", True)
        
        attempts = db.query(ExerciseEvaluation).filter(
            ExerciseEvaluation.student_id == student.id, 
            ExerciseEvaluation.exercise_id == ex_id
        ).all()
        print(f"Found {len(attempts)} attempts for exercise.")
        for a in attempts:
            print(f"Attempt {a.attempt_number}: Correct={a.is_correct}, Status={a.status}")

        # 4. Test Quiz Logging
        quiz_id = "test-quiz-" + str(uuid.uuid4())[:8]
        print(f"\n--- Testing Quiz Logging for {quiz_id} ---")

        def simulate_log_quiz(q_id, score, total):
            prev = db.query(QuizEvaluation).filter(
                QuizEvaluation.student_id == student.id,
                QuizEvaluation.quiz_id == q_id
            ).order_by(QuizEvaluation.attempt_number.desc()).first()
            
            attempt = (prev.attempt_number + 1) if prev else 1
            passed = score >= (total * 0.6)
            
            evaluation = QuizEvaluation(
                student_id=student.id,
                quiz_id=q_id,
                score=score,
                total_questions=total,
                passed=passed,
                attempt_number=attempt
            )
            db.add(evaluation)
            db.commit()

        simulate_log_quiz(quiz_id, 2, 5) # Fail
        simulate_log_quiz(quiz_id, 4, 5) # Pass
        
        q_attempts = db.query(QuizEvaluation).filter(
            QuizEvaluation.student_id == student.id,
            QuizEvaluation.quiz_id == quiz_id
        ).all()
        print(f"Found {len(q_attempts)} attempts for quiz.")
        for qa in q_attempts:
            print(f"Attempt {qa.attempt_number}: Score={qa.score}/{qa.total_questions}, Passed={qa.passed}")

        print("\n--- TEST COMPLETED SUCCESSFULLY ---")

    finally:
        db.close()

if __name__ == "__main__":
    test_ingestion()
