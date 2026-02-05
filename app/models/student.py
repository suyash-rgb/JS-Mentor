from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    name = Column(String(100), nullable=False)
    phone_no = Column(String(20), nullable=False)
    scholar_no = Column(String(50), unique=True, index=True)

    user = relationship("User", back_populates="student_profile") 