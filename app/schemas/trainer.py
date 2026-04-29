from pydantic import BaseModel, EmailStr
from typing import Optional

class TrainerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialization: Optional[str] = None
