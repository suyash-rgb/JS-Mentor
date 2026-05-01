from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum('OPEN', 'RESOLVED'), default='OPEN')
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)

    student = relationship("Student", backref="doubts")
    trainer = relationship("Trainer", backref="resolved_doubts")

class MentorshipSession(Base):
    __tablename__ = "mentorship_sessions"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    status = Column(Enum('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED'), default='SCHEDULED')
    scheduled_for = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=30)
    created_at = Column(DateTime, server_default=func.now())

    student = relationship("Student", backref="mentorship_sessions")
    trainer = relationship("Trainer", backref="trainer_mentorship_sessions")
