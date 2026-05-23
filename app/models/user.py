from sqlalchemy import Column, Integer, String, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum): 
    STUDENT = "STUDENT"
    TRAINER = "TRAINER"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String(64), unique=True, index=True, nullable=True)
    username = Column(String(50), unique=True, index=True, nullable=False) # Derived from email
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255))
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to specific profile tables
    student_profile = relationship("Student", back_populates="user", uselist=False)
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False)