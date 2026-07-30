import os
import json
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer, and_ 
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation, PracticeProgress

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

def get_exercise_completion_velocity(db: Session, student_id: int) -> float:
    """
    Calculates the average time delta (in seconds) between consecutive correct exercise completions.
    Secondary positive indicator: rewards steady problem-solving speed while helping identify abnormal
    patterns (e.g., suspicious instant copy-pasting).
    """
    correct_evals = db.query(ExerciseEvaluation.submitted_at)\
        .filter(ExerciseEvaluation.student_id == student_id, ExerciseEvaluation.is_correct == True)\
        .order_by(ExerciseEvaluation.submitted_at.asc())\
        .all()

    if len(correct_evals) <= 1:
        return 3600.0

    deltas = []
    for idx in range(1, len(correct_evals)):
        t1 = correct_evals[idx - 1][0]
        t2 = correct_evals[idx][0]
        if t1 and t2:
            delta = (t2 - t1).total_seconds()
            deltas.append(max(0.1, delta))

    if not deltas:
        return 3600.0
    return round(sum(deltas) / len(deltas), 1)

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
        # 1. Exercises
        exercise_stats = db.query(
            func.avg(ExerciseEvaluation.attempt_number).label("avg_attempts"),
            func.avg(ExerciseEvaluation.execution_time_ms).label("avg_exec_time"),
            func.avg(cast(ExerciseEvaluation.is_correct, Integer)).label("correct_ratio")
        ).filter(ExerciseEvaluation.student_id == student.id).first()

        # 2. Quizzes
        quiz_stats = db.query(
            func.avg(QuizEvaluation.score).label("avg_score")
        ).filter(QuizEvaluation.student_id == student.id).first()

        # 3. Practice Hub
        practice_stats = db.query(
            func.count(PracticeProgress.id).label("problems_solved")
        ).filter(PracticeProgress.student_id == student.id).first()

        avg_attempts = float(exercise_stats.avg_attempts or 1.0) if exercise_stats else 1.0
        avg_exec_time = int(exercise_stats.avg_exec_time or 0) if exercise_stats else 0
        correct_ratio = float(exercise_stats.correct_ratio or 0.0) if exercise_stats else 0.0
        
        quiz_score = float(quiz_stats.avg_score or 0.0) if quiz_stats else 0.0
        practice_problems_solved = int(practice_stats.problems_solved or 0) if practice_stats else 0
        velocity = get_exercise_completion_velocity(db, student.id)

        # Derive empirical ground-truth label based on student achievement metrics
        if velocity < 10.0 or correct_ratio < 0.40:
            risk = "HIGH"
        elif correct_ratio >= 0.70 and velocity <= 600.0 and practice_problems_solved >= 10:
            risk = "LOW"
        elif quiz_score < 50.0 and correct_ratio < 0.60:
            risk = "HIGH"
        else:
            risk = "MEDIUM"

        records.append({
            "exercise_is_correct_ratio": correct_ratio,
            "exercise_completion_velocity": velocity,
            "practice_problems_solved": practice_problems_solved,
            "quiz_score": quiz_score,
            "avg_exercise_attempts": avg_attempts,
            "avg_exercise_execution_time_ms": avg_exec_time,
            "risk_level": risk
        })

    return pd.DataFrame(records)
