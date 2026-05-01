from pydantic import BaseModel, EmailStr, constr, field_validator
from typing import Optional
import re

class TrainerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    specialization: Optional[str] = None
    registration_code: str

    @field_validator('registration_code')
    @classmethod
    def validate_code_format(cls, v):
        # Format: <YYYY>JSMC<trainer_number>CT
        # YYYY is 2025 or 2026, trainer_number is 3 digits starting from 004
        pattern = r"^(2025|2026)JSMC(00[4-9]|0[1-9][0-9]|[1-9][0-9]{2})CT$"
        if not re.match(pattern, v):
            raise ValueError("Invalid registration code format.")
        return v
