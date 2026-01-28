from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import auth_service, security_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/student", status_code=status.HTTP_201_CREATED)
async def register_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    return auth_service.register_new_student(db, student_in)

@router.post("/login", response_model=schemas.Token)
async def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Simply return the result of the service
    return auth_service.authenticate_user(db, login_data)

# @router.get("/generate-hash/{password}")
# def generate_hash(password: str):
#     # This uses your exact backend logic to create a hash
#     return {"hash": security_service.hash_password(password)}