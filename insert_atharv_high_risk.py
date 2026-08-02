import os
import json
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.learning import (
    StudentProgress,
    ExerciseEvaluation,
    QuizEvaluation,
    PracticeProgress,
)
from app.services.ml_service import MLService

def insert_atharv_high_risk():
    db = SessionLocal()
    try:
        email = "atharv.navlakhe@jsmentor.com"
        name = "Atharv Navlakhe"

        # 1. Clean up existing Atharv Navlakhe if present
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            existing_student = db.query(Student).filter(Student.user_id == existing_user.id).first()
            if existing_student:
                db.query(StudentProgress).filter(StudentProgress.student_id == existing_student.id).delete()
                db.query(ExerciseEvaluation).filter(ExerciseEvaluation.student_id == existing_student.id).delete()
                db.query(QuizEvaluation).filter(QuizEvaluation.student_id == existing_student.id).delete()
                db.query(PracticeProgress).filter(PracticeProgress.student_id == existing_student.id).delete()
                db.delete(existing_student)
            db.delete(existing_user)
            db.commit()

        # 2. Create User and Student profile
        new_user = User(
            email=email,
            username="atharv.navlakhe",
            role=UserRole.STUDENT,
            hashed_password="hashed_password_demo"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        atharv = Student(
            user_id=new_user.id,
            name=name,
            phone_no="9876543210"
        )
        db.add(atharv)
        db.commit()
        db.refresh(atharv)

        print(f"[SUCCESS] Created Student: {atharv.name} (ID: {atharv.id})")

        # 3. Qualify Atharv by completing all topics in cards 0 and 1
        data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        qualified_topics = []
        cards = data.get("cards", [])
        for card_idx in [0, 1]:
            if card_idx < len(cards):
                for link in cards[card_idx].get("links", []):
                    if link.get("url"):
                        qualified_topics.append(link.get("url"))

        for topic_url in qualified_topics:
            prog = StudentProgress(
                student_id=atharv.id,
                topic_id=topic_url,
                status="COMPLETED",
                time_spent_seconds=120
            )
            db.add(prog)
        db.commit()
        print(f"[SUCCESS] Marked {len(qualified_topics)} topics as COMPLETED (Qualified for ML pipeline)")

        # 4. Insert HIGH RISK metrics (low accuracy, copy-paste velocity, low practice, low quiz)
        base_time = datetime.utcnow() - timedelta(minutes=10)

        # A) Two correct exercises submitted 4 seconds apart => velocity = 4.0s (copy-paste cheater penalty)
        eval1 = ExerciseEvaluation(
            student_id=atharv.id,
            exercise_id="ex_1",
            is_correct=True,
            execution_time_ms=8000,
            attempt_number=4,
            submitted_at=base_time
        )
        eval2 = ExerciseEvaluation(
            student_id=atharv.id,
            exercise_id="ex_2",
            is_correct=True,
            execution_time_ms=8500,
            attempt_number=5,
            submitted_at=base_time + timedelta(seconds=4)
        )
        db.add_all([eval1, eval2])

        # B) Six failed exercises => correct_ratio = 2 / 8 = 25% (0.25), avg_attempts = 4.5
        for i in range(3, 9):
            fail_eval = ExerciseEvaluation(
                student_id=atharv.id,
                exercise_id=f"ex_{i}",
                is_correct=False,
                execution_time_ms=9000,
                attempt_number=5,
                submitted_at=base_time + timedelta(minutes=i)
            )
            db.add(fail_eval)

        # C) Quiz Score = 35%
        quiz = QuizEvaluation(
            student_id=atharv.id,
            quiz_id="quiz_0",
            score=35.0,
            total_questions=10,
            passed=False,
            attempt_number=2
        )
        db.add(quiz)

        # D) Practice Hub = Only 2 problems solved
        for p in range(1, 3):
            practice = PracticeProgress(
                student_id=atharv.id,
                question_id=f"prob_{p}"
            )
            db.add(practice)

        db.commit()
        print("[SUCCESS] Inserted High-Risk evaluations and progress records.")

        # 5. Test MLService.get_high_risk_students
        print("\n--- Verifying Risk Assessment via MLService ---")
        high_risk_list = MLService.get_high_risk_students(db)
        found = False
        for student_data in high_risk_list:
            if student_data["name"] == "Atharv Navlakhe":
                found = True
                print("\n[SUCCESS] Atharv Navlakhe detected in HIGH RISK list:")
                print(json.dumps(student_data, indent=2))
                break

        if not found:
            print("[WARNING] Atharv Navlakhe not found in high risk list. Let's check features...")
            
    finally:
        db.close()

if __name__ == "__main__":
    insert_atharv_high_risk()
