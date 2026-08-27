import os

base_dir = r"D:\Apoliums 3\JS-Mentor-Backend\JS-Mentor"

# 1. Update user.py
user_py_path = os.path.join(base_dir, "app", "models", "user.py")
with open(user_py_path, "r") as f:
    content = f.read()

if 'ADMIN = "ADMIN"' not in content:
    content = content.replace('TRAINER = "TRAINER"', 'TRAINER = "TRAINER"\n    ADMIN = "ADMIN"')
    with open(user_py_path, "w") as f:
        f.write(content)
    print("Updated user.py")

# 2. Create admin.py (Models)
admin_models_py_path = os.path.join(base_dir, "app", "models", "admin.py")
admin_models_content = """from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Float, DateTime, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    target_entity = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    admin = relationship("User")

class PlatformSettings(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    knn_auto_review_enabled = Column(Boolean, default=True)
    difflib_similarity_cutoff = Column(Float, default=0.70)
    global_rate_limit_per_min = Column(Integer, default=60)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class IssueStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    RESOLVED = "RESOLVED"

class PlatformIssue(Base):
    __tablename__ = "platform_issues"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(Enum(IssueStatus, name="issue_status"), default=IssueStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolved_by_admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    student = relationship("User", foreign_keys=[student_id])
    resolved_by = relationship("User", foreign_keys=[resolved_by_admin_id])
"""
with open(admin_models_py_path, "w") as f:
    f.write(admin_models_content)
print("Created app/models/admin.py")
