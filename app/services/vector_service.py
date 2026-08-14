import os
import logging
from sqlalchemy.orm import Session
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

logger = logging.getLogger("VectorService")

class VectorService:
    @classmethod
    def get_qdrant_client(cls) -> QdrantClient:
        qdrant_path = os.getenv("QDRANT_PATH", "./qdrant_data")
        client = QdrantClient(path=qdrant_path)
        
        # Check and create collection
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]
        if "code_submissions" not in collection_names:
            client.create_collection(
                collection_name="code_submissions",
                vectors_config=qmodels.VectorParams(
                    size=384,
                    distance=qmodels.Distance.COSINE
                )
            )
        return client

    @classmethod
    def search_similar_submission(cls, db: Session, exercise_id: str, embedding: list, threshold: float = 0.95) -> dict:
        """
        Searches historical human-graded submissions with similarity >= threshold using Qdrant.
        Returns a dict with 'feedback' and 'grade' if found, else None.
        """
        try:
            client = cls.get_qdrant_client()
            search_result = client.query_points(
                collection_name="code_submissions",
                query=embedding,
                query_filter=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="exercise_id",
                            match=qmodels.MatchValue(value=exercise_id)
                        ),
                        qmodels.FieldCondition(
                            key="status",
                            match=qmodels.MatchValue(value="GRADED")
                        )
                    ]
                ),
                limit=1,
                score_threshold=threshold
            )
            
            if search_result and search_result.points:
                match = search_result.points[0]
                logger.info(f"Qdrant: Match found for exercise {exercise_id} (similarity score: {match.score:.4f})")
                return {
                    "feedback": match.payload.get("feedback"),
                    "grade": match.payload.get("grade")
                }
        except Exception as e:
            logger.error(f"Error searching Qdrant: {e}", exc_info=True)
        return None

    @classmethod
    def add_submission(cls, db: Session, evaluation_id: int, exercise_id: str, embedding: list, feedback: str, grade: float, status: str):
        try:
            client = cls.get_qdrant_client()
            client.upsert(
                collection_name="code_submissions",
                points=[
                    qmodels.PointStruct(
                        id=evaluation_id,
                        vector=embedding,
                        payload={
                            "exercise_id": exercise_id,
                            "feedback": feedback,
                            "grade": float(grade) if grade is not None else None,
                            "status": status
                        }
                    )
                ]
            )
            logger.info(f"Qdrant: Saved embedding for submission {evaluation_id}")
        except Exception as e:
            logger.error(f"Error adding vector to Qdrant: {e}", exc_info=True)

    @classmethod
    def update_submission(cls, db: Session, evaluation_id: int, feedback: str, grade: float, status: str):
        try:
            client = cls.get_qdrant_client()
            client.set_payload(
                collection_name="code_submissions",
                payload={
                    "status": status,
                    "feedback": feedback,
                    "grade": float(grade) if grade is not None else None
                },
                points=[evaluation_id]
            )
            logger.info(f"Qdrant: Updated embedding payload for submission {evaluation_id} with status {status}")
        except Exception as e:
            logger.error(f"Error updating payload in Qdrant: {e}", exc_info=True)
