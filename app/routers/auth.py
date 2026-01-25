from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import auth_service, security_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register/student", response_model=schemas.Token)
def register_student(student_in: schemas.StudentCreate, db: Session = Depends(get_db)):
    user = auth_service.register_new_student(db, student_in)
    
    # Generate Token with RBAC role
    access_token = security_service.create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    return auth_service.authenticate_user(db, login_data)