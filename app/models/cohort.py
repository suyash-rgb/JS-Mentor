from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class GroupClassStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Cohort(Base):
    __tablename__ = "cohorts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)

    trainer = relationship("Trainer", backref="cohorts")
    students = relationship("Student", back_populates="cohort")

class GroupClass(Base):
    __tablename__ = "group_classes"

    id = Column(Integer, primary_key=True, index=True)
    cohort_id = Column(Integer, ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), nullable=False)
    status = Column(Enum(GroupClassStatus, name="group_class_status"), default=GroupClassStatus.SCHEDULED)
    scheduled_for = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer, default=60)
    created_at = Column(DateTime, server_default=func.now())

    cohort = relationship("Cohort", backref="group_classes")
    trainer = relationship("Trainer", backref="trainer_group_classes")
