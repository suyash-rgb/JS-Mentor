from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class TrainerRegistrationCode(Base):
    __tablename__ = "trainer_registration_codes"

    code = Column(String(20), primary_key=True, index=True)
    is_used = Column(Boolean, default=False)
    used_by_trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(100)) # For the "JS Mentor" context
    
    user = relationship("User", back_populates="trainer_profile") 