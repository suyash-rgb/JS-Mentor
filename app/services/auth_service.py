from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas
from app.services import security_service


def register_new_student(db: Session, student_in: schemas.StudentCreate):
    # 1. Identity Logic: Parse Gmail username
    username = student_in.email.split("@")[0]
    hashed_pass = security_service.pwd_context.hash(student_in.password)
    
    # 2. Database Transaction
    new_user = models.User(
        username=username,
        email=student_in.email,
        hashed_password=hashed_pass,
        role=models.UserRole.STUDENT
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    new_student = models.Student(
        user_id=new_user.id,
        name=student_in.name,
        phone_no=student_in.phone_no,
        scholar_no=student_in.scholar_no
    )
    db.add(new_student)
    db.commit()
    
    return {"message": "Registration successful."}

def authenticate_user(db: Session, login_data: schemas.UserLogin):
    # 1. Attempt to find the user in the 'users' table by username
    # (This covers Trainers and students who use their parsed Gmail ID)
    user = db.query(models.User).filter(models.User.username == login_data.username).first()

    # 2. If not found by username, check if it's a student logging in via Scholar Number
    if not user:
        student_profile = db.query(models.Student).filter(
            models.Student.scholar_no == login_data.username
        ).first()
        if student_profile:
            user = student_profile.user

    # 3. Security Check
    if not user or not security_service.verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Generate the JWT with RBAC Role
    access_token = security_service.create_jwt_token(
        data={"sub": user.username, "role": user.role}
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "role": user.role
    }