from pydantic import BaseModel, EmailStr

class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_no: str
    scholar_no: str