from pydantic import BaseModel
from typing import Optional

class ProgressUpdate(BaseModel):
    topic_id: str
    status: str # 'IN_PROGRESS', 'COMPLETED'
    time_spent_seconds: int

class ExerciseSubmission(BaseModel):
    exercise_id: str
    code_submitted: str
    is_correct: bool
    execution_time_ms: int

class QuizSubmission(BaseModel):
    quiz_id: str
    score: float
    total_questions: int
