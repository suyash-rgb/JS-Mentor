import logging
from sqlalchemy.orm import Session
from app.models.learning import ExerciseEvaluation

logger = logging.getLogger("VectorService")

class VectorService:
    @classmethod
    def search_similar_submission(cls, db: Session, exercise_id: str, embedding: list, threshold: float = 0.95) -> dict:
        """
        Searches historical human-graded submissions with similarity >= threshold using pgvector.
        Returns a dict with 'feedback' and 'grade' if found, else None.
        """
        distance_threshold = 1.0 - threshold
        try:
            # Query nearest neighbor using pgvector
            similar_sub = db.query(ExerciseEvaluation)\
                .filter(ExerciseEvaluation.exercise_id == exercise_id)\
                .filter(ExerciseEvaluation.status == 'GRADED')\
                .filter(ExerciseEvaluation.code_embedding.isnot(None))\
                .order_by(ExerciseEvaluation.code_embedding.cosine_distance(embedding))\
                .first()
            
            if similar_sub:
                # Let the database calculate the exact distance
                dist = db.query(similar_sub.code_embedding.cosine_distance(embedding)).scalar()
                if dist is not None and dist <= distance_threshold:
                    logger.info(f"pgvector: Match found for exercise {exercise_id} (distance: {dist:.4f})")
                    return {
                        "feedback": similar_sub.feedback,
                        "grade": float(similar_sub.grade) if similar_sub.grade is not None else None
                    }
        except Exception as e:
            logger.error(f"Error searching pgvector: {e}", exc_info=True)
        return None

    @classmethod
    def add_submission(cls, db: Session, evaluation_id: int, exercise_id: str, embedding: list, feedback: str, grade: float, status: str):
        try:
            evaluation = db.query(ExerciseEvaluation).filter(ExerciseEvaluation.id == evaluation_id).first()
            if evaluation:
                evaluation.code_embedding = embedding
                db.commit()
                logger.info(f"pgvector: Saved embedding for submission {evaluation_id}")
        except Exception as e:
            logger.error(f"Error adding vector to Postgres: {e}", exc_info=True)

    @classmethod
    def update_submission(cls, db: Session, evaluation_id: int, feedback: str, grade: float, status: str):
        # In Postgres, the DB column is already updated natively via standard SQL ORM commit
        pass
