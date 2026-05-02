from sqlalchemy import Column, Integer, String, Text, Enum, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Doubt(Base):
    __tablename__ = "doubts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    # 1-indexed position of the learning path card in data.json.
    # Paths 1 & 2 get 30-min sessions; paths 3-6 get 60-min sessions.
    learning_path_index = Column(Integer, nullable=False, default=1)
    status = Column(Enum('OPEN', 'SCHEDULED', 'RESOLVED'), default='OPEN')
    created_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    # FK to the mentorship_session record created by the scheduling engine
    session_id = Column(Integer, ForeignKey("mentorship_sessions.id", ondelete="SET NULL"), nullable=True)

    student = relationship("Student", backref="doubts")
    trainer = relationship("Trainer", backref="resolved_doubts")
    session = relationship("MentorshipSession", backref="linked_doubt", foreign_keys=[session_id])

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

    # Prevent double-booking: a trainer cannot have two sessions at the same start time
    __table_args__ = (
        UniqueConstraint('trainer_id', 'scheduled_for', name='uq_trainer_slot'),
    )
