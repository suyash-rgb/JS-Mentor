import json
import os
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer, and_
from fastapi import HTTPException
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "risk_model.joblib")

class MLService:
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            if os.path.exists(MODEL_PATH):
                # Lazy import to save memory during startup
                import joblib
                try:
                    cls._model = joblib.load(MODEL_PATH)
                except Exception as e:
                    print(f"Error loading model: {e}")
                    raise HTTPException(status_code=500, detail="Failed to load ML model.")
            else:
                raise HTTPException(status_code=503, detail="ML Model not found.")
        return cls._model

    @classmethod
    def predict_single(cls, data_dict: dict):
        model = cls.get_model()
        # Lazy import pandas
        import pandas as pd
        df = pd.DataFrame([data_dict])
        
        prediction = model.predict(df)[0]
        probabilities = model.predict_proba(df)[0]
        classes = model.classes_
        prob_dict = {classes[i]: float(probabilities[i]) for i in range(len(classes))}
        
        return {
            "risk_level": prediction,
            "probabilities": prob_dict
        }

    @classmethod
    def _get_qualified_student_ids(cls, db: Session):
        """Identifies students who have completed all topics in the first 2 learning paths."""
        data_path = os.path.join(BASE_DIR, "data.json")
        try:
            with open(data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception:
            return []
        
        # Get all topic IDs (URLs) for cards 0 and 1
        qualified_topics = []
        cards = data.get("cards", [])
        for card_idx in [0, 1]:
            if card_idx < len(cards):
                for link in cards[card_idx].get("links", []):
                    if link.get("url"):
                        qualified_topics.append(link.get("url"))
        
        if not qualified_topics:
            return []

        # Find students who have COMPLETED all these topics
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

    @classmethod
    def get_high_risk_students(cls, db: Session):
        high_risk_list = []
        
        qualified_ids = cls._get_qualified_student_ids(db)
        if not qualified_ids:
            return []

        students = db.query(Student).filter(Student.id.in_(qualified_ids)).all()

        for student in students:
            # Time & Status
            progress = db.query(
                func.sum(StudentProgress.time_spent_seconds).label("total_time"),
                func.max(StudentProgress.status).label("latest_status")
            ).filter(StudentProgress.student_id == student.id).first()

            # Exercises - FIXED THE CAST HERE
            exercise_stats = db.query(
                func.avg(ExerciseEvaluation.attempt_number).label("avg_attempts"),
                func.avg(ExerciseEvaluation.execution_time_ms).label("avg_exec_time"),
                # Changed func.cast(..., func.Integer) to cast(..., Integer)
                func.avg(cast(ExerciseEvaluation.is_correct, Integer)).label("correct_ratio")
            ).filter(ExerciseEvaluation.student_id == student.id).first()

            # Quizzes
            quiz_stats = db.query(
                func.avg(QuizEvaluation.score).label("avg_score"),
                func.avg(QuizEvaluation.attempt_number).label("avg_quiz_attempts")
            ).filter(QuizEvaluation.student_id == student.id).first()

            # Build the Feature Vector
            features = {
                "progress_status": progress.latest_status or "NOT_STARTED",
                "time_spent_seconds": int(progress.total_time or 0),
                "avg_exercise_attempts": float(exercise_stats.avg_attempts or 1.0),
                "avg_exercise_execution_time_ms": int(exercise_stats.avg_exec_time or 0),
                "exercise_is_correct_ratio": float(exercise_stats.correct_ratio or 0.0),
                "quiz_score": float(quiz_stats.avg_score or 0.0),
                "quiz_attempt_number": int(quiz_stats.avg_quiz_attempts or 1)
            }

            result = cls.predict_single(features)

            if result["risk_level"] == "HIGH":
                high_risk_list.append({
                    "student_id": student.id,
                    "name": student.name,
                    "risk_details": result
                })

        return high_risk_list