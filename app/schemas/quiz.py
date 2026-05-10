from pydantic import BaseModel
from typing import List, Optional

class QuizQuestionCreate(BaseModel):
    id: str
    text: str
    options: List[str]
    correct_answer: str

class QuizCreate(BaseModel):
    title: str
    questions: List[QuizQuestionCreate] = []

class QuizUpdate(BaseModel):
    title: Optional[str] = None
    questions: Optional[List[QuizQuestionCreate]] = None
