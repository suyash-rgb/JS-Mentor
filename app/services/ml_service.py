import json
import os
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Integer, and_
from fastapi import HTTPException
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation, PracticeProgress
from app.ml.extract_training_data import get_exercise_completion_velocity

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "app", "ml", "models", "risk_model.joblib")

class MLService:
    _model = None
    _model_mtime = 0
    _embedding_model = None

    @classmethod
    def get_embedding_model(cls):
        if cls._embedding_model is None:
            from fastembed import TextEmbedding
            # Lazy initialization of fastembed model
            cls._embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5")
        return cls._embedding_model

    @classmethod
    def generate_code_embedding(cls, code_string: str) -> list:
        if not code_string:
            return [0.0] * 384
        try:
            model = cls.get_embedding_model()
            embeddings = list(model.embed([code_string]))
            if len(embeddings) > 0:
                return embeddings[0].tolist()
        except Exception as e:
            print(f"Error generating embedding: {e}")
        return [0.0] * 384

    @classmethod
    def reload_model(cls):
        """Clears cached in-memory model so next call reloads updated weights from disk."""
        cls._model = None
        cls._model_mtime = 0

    @classmethod
    def get_model(cls):
        if os.path.exists(MODEL_PATH):
            current_mtime = os.path.getmtime(MODEL_PATH)
            if cls._model is None or getattr(cls, "_model_mtime", 0) != current_mtime:
                import joblib
                try:
                    cls._model = joblib.load(MODEL_PATH)
                    cls._model_mtime = current_mtime
                    # Compatibility patch for older scikit-learn versions (1.6.x and below)
                    classifier = getattr(cls._model, "named_steps", {}).get("classifier")
                    if classifier and not hasattr(classifier, "multi_class"):
                        classifier.multi_class = "auto"
                except Exception as e:
                    print(f"Error loading model: {e}")
                    raise HTTPException(status_code=500, detail="Failed to load ML model.")
        else:
            raise HTTPException(status_code=503, detail="ML Model not found.")
        return cls._model

    @classmethod
    def _get_linear_attribution(cls, data_dict: dict, prediction: str) -> list:
        """
        Automated Linear Factor Attribution layer.
        Inspects the student's metrics against our rebalanced Logistic Regression feature hierarchy
        to generate instant, interpretable bullet-point explanations with zero latency (~10 microseconds).
        """
        factors_list = []
        velocity = float(data_dict.get("exercise_completion_velocity", 1000.0))
        correct_ratio = float(data_dict.get("exercise_is_correct_ratio", 1.0))
        problems_solved = int(data_dict.get("practice_problems_solved", 10))
        quiz_score = float(data_dict.get("quiz_score", 100.0))
        avg_attempts = float(data_dict.get("avg_exercise_attempts", 1.0))

        if velocity < 10.0:
            factors_list.append("Abnormal velocity (< 10s) - copy-paste pattern")
        if correct_ratio < 0.50:
            factors_list.append(f"Low coding accuracy ({int(correct_ratio * 100)}% pass rate)")
        if problems_solved < 5:
            factors_list.append(f"Low Practice Hub usage ({problems_solved} solved)")
        if quiz_score < 60.0:
            factors_list.append(f"Low quiz score ({int(quiz_score)}% avg)")
        if avg_attempts > 3.0:
            factors_list.append(f"High retry count ({avg_attempts:.1f} avg attempts)")

        if not factors_list:
            if prediction == "HIGH":
                factors_list.append("Combined practical and quiz metrics below threshold")
            else:
                factors_list.append("All primary performance metrics within range")

        return factors_list

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
        
        factors_str = cls._get_linear_attribution(data_dict, prediction)

        return {
            "risk_level": prediction,
            "probabilities": prob_dict,
            "factors": factors_str
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
            # Exercises
            exercise_stats = db.query(
                func.avg(ExerciseEvaluation.attempt_number).label("avg_attempts"),
                func.avg(ExerciseEvaluation.execution_time_ms).label("avg_exec_time"),
                func.avg(cast(ExerciseEvaluation.is_correct, Integer)).label("correct_ratio")
            ).filter(ExerciseEvaluation.student_id == student.id).first()

            # Quizzes
            quiz_stats = db.query(
                func.avg(QuizEvaluation.score).label("avg_score")
            ).filter(QuizEvaluation.student_id == student.id).first()

            # Practice Hub
            practice_stats = db.query(
                func.count(PracticeProgress.id).label("problems_solved")
            ).filter(PracticeProgress.student_id == student.id).first()

            # Build the Feature Vector matching the 6 candidate features exactly
            features = {
                "exercise_is_correct_ratio": float(exercise_stats.correct_ratio or 0.0),
                "exercise_completion_velocity": get_exercise_completion_velocity(db, student.id),
                "practice_problems_solved": int(practice_stats.problems_solved or 0),
                "quiz_score": float(quiz_stats.avg_score or 0.0),
                "avg_exercise_attempts": float(exercise_stats.avg_attempts or 1.0),
                "avg_exercise_execution_time_ms": int(exercise_stats.avg_exec_time or 0)
            }

            result = cls.predict_single(features)

            if result["risk_level"] == "HIGH":
                high_risk_list.append({
                    "student_id": student.id,
                    "name": student.name,
                    "risk_details": result
                })

        return high_risk_list