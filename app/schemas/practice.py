from pydantic import BaseModel
from typing import Optional

class PracticeSubmission(BaseModel):
    question_id: str
    is_correct: bool

class ChallengeSubmission(BaseModel):
    challenge_id: str
    execution_time_ms: int
    time_to_solve_ms: int
    is_correct: bool
