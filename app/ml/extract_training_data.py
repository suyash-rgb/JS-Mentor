import os
import json
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer, and_
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def get_qualified_student_ids(db: Session):
    """Finds student IDs who have completed all topics in Learning Paths 1 and 2."""
    data_path = os.path.join(BASE_DIR, "data.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        return []

    qualified_topics = []
    cards = data.get("cards", [])
    for card_idx in [0, 1]:
        if card_idx < len(cards):
            for link in cards[card_idx].get("links", []):
                if link.get("url"):
                    qualified_topics.append(link.get("url"))

    if not qualified_topics:
        return []

    qualified_student_ids = db.query(StudentProgress.student_id)\
        .filter(
            and_(
                StudentProgress.topic_id.in_(qualified_topics),
                StudentProgress.status == 'COMPLETED'
            )
        )\
        .group_by(StudentProgress.student_id)\
        .having(func.count(StudentProgress.topic_id.distinct()) == len(qualified_topics))\
        .all()

    return [s[0] for s in qualified_student_ids]

def extract_real_training_data(db: Session) -> pd.DataFrame:
    """
    Extracts real student interaction metrics from the database and maps them
    to feature vectors compatible with the ML pipeline.
    """
    qualified_ids = get_qualified_student_ids(db)
    if not qualified_ids:
        # Fallback: Query all students who have logged at least one exercise or progress
        qualified_ids = [s[0] for s in db.query(Student.id).all()]

    if not qualified_ids:
        return pd.DataFrame()

    records = []
    students = db.query(Student).filter(Student.id.in_(qualified_ids)).all()

    for student in students:
        # 1. Time & Status
        progress = db.query(
            func.sum(StudentProgress.time_spent_seconds).label("total_time"),
            func.max(StudentProgress.status).label("latest_status")
        ).filter(StudentProgress.student_id == student.id).first()

        # 2. Exercises
        exercise_stats = db.query(
            func.avg(ExerciseEvaluation.attempt_number).label("avg_attempts"),
            func.avg(ExerciseEvaluation.execution_time_ms).label("avg_exec_time"),
            func.avg(cast(ExerciseEvaluation.is_correct, Integer)).label("correct_ratio")
        ).filter(ExerciseEvaluation.student_id == student.id).first()

        # 3. Quizzes
        quiz_stats = db.query(
            func.avg(QuizEvaluation.score).label("avg_score"),
            func.avg(QuizEvaluation.attempt_number).label("avg_quiz_attempts")
        ).filter(QuizEvaluation.student_id == student.id).first()

        time_spent = int(progress.total_time or 0) if progress else 0
        status_val = progress.latest_status if (progress and progress.latest_status) else "IN_PROGRESS"
        
        avg_attempts = float(exercise_stats.avg_attempts or 1.0) if exercise_stats else 1.0
        avg_exec_time = int(exercise_stats.avg_exec_time or 0) if exercise_stats else 0
        correct_ratio = float(exercise_stats.correct_ratio or 0.0) if exercise_stats else 0.0
        
        quiz_score = float(quiz_stats.avg_score or 0.0) if quiz_stats else 0.0
        quiz_attempts = int(quiz_stats.avg_quiz_attempts or 1) if quiz_stats else 1

        # Derive empirical ground-truth label based on student achievement metrics
        if quiz_score < 50.0 or correct_ratio < 0.40:
            risk = "HIGH"
        elif quiz_score >= 75.0 and correct_ratio >= 0.70:
            risk = "LOW"
        else:
            risk = "MEDIUM"

        records.append({
            "progress_status": status_val,
            "time_spent_seconds": time_spent,
            "avg_exercise_attempts": avg_attempts,
            "avg_exercise_execution_time_ms": avg_exec_time,
            "exercise_is_correct_ratio": correct_ratio,
            "quiz_score": quiz_score,
            "quiz_attempt_number": quiz_attempts,
            "risk_level": risk
        })

    return pd.DataFrame(records)
