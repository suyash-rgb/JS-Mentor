from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime, date, timezone


# ── Student-facing: Doubt Registration ───────────────────────────────────────

class RegisterDoubtRequest(BaseModel):
    topic: str = Field(..., min_length=5, max_length=255,
                       description="Short title of the doubt (e.g. 'Closures not working')")
    description: str = Field(..., min_length=20,
                              description="Detailed description of the problem")
    learning_path_index: Optional[int] = Field(None, ge=1, le=6,
                                      description="The 1-indexed position of the learning path (1=Fundamentals, 2=JS Core, etc.)")
    cloudinary_folder: Optional[str] = Field(None, description="The Cloudinary folder where images are uploaded") # need to create?

class RegisterDoubtResponse(BaseModel):
    doubt_id: int
    topic: str
    duration_minutes: int
    message: str
    status: str


class MyDoubtDetail(BaseModel):
    doubt_id: int
    topic: str
    description: str
    learning_path_index: int
    status: str
    created_at: datetime
    scheduled_for: Optional[datetime] = None
    trainer_name: Optional[str] = None
    duration_minutes: Optional[int] = None
    session_id: Optional[int] = None

    class Config:
        from_attributes = True

    @field_validator('scheduled_for', 'created_at', mode='after')
    @classmethod
    def ensure_utc(cls, v):
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v


# ── Trainer-facing: Their Schedule ───────────────────────────────────────────

class TrainerSessionSlot(BaseModel):
    session_id: int
    student_name: str
    topic: str
    scheduled_for: datetime
    duration_minutes: int
    status: str

    class Config:
        from_attributes = True

    @field_validator('scheduled_for', mode='after')
    @classmethod
    def ensure_utc(cls, v):
        if v and v.tzinfo is None:
            return v.replace(tzinfo=timezone.utc)
        return v
