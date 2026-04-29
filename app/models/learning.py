from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Enum, DateTime, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class StudentProgress(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(100), nullable=False)
    status = Column(Enum('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'), default='NOT_STARTED')
    time_spent_seconds = Column(Integer, default=0)
    last_accessed_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    student = relationship("Student", backref="progress_records")


class ExerciseEvaluation(Base):
    __tablename__ = "exercise_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    exercise_id = Column(String(100), nullable=False)
    code_submitted = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=False, default=False)
    execution_time_ms = Column(Integer, nullable=True)
    attempt_number = Column(Integer, nullable=False, default=1)
    submitted_at = Column(DateTime, server_default=func.now())

    student = relationship("Student", backref="exercise_evaluations")


class QuizEvaluation(Base):
    __tablename__ = "quiz_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    quiz_id = Column(String(100), nullable=False)
    score = Column(Numeric(5, 2), nullable=False)
    total_questions = Column(Integer, nullable=False)
    passed = Column(Boolean, nullable=False)
    attempt_number = Column(Integer, nullable=False, default=1)
    completed_at = Column(DateTime, server_default=func.now())

    student = relationship("Student", backref="quiz_evaluations")


class StudentRiskPrediction(Base):
    __tablename__ = "student_risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    predicted_pass_probability = Column(Numeric(5, 4), nullable=False)
    risk_level = Column(Enum('LOW', 'MEDIUM', 'HIGH'), nullable=False)
    key_factors = Column(Text, nullable=True)
    evaluated_at = Column(DateTime, server_default=func.now())

    student = relationship("Student", backref="risk_predictions")
