import re
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas
from app.services import security_service
from app.database import SessionLocal
from sqlalchemy.exc import IntegrityError
from app.models.user import User, UserRole
from app.models.student import Student

TRAINER_CODE_PATTERN = re.compile(r'^(2025|2026)JSMC\d+CT$')

def register_new_trainer(db: Session, trainer_in: schemas.TrainerCreate):
    # 0. Validate Registration Code format: (2025|2026)JSMC<employee_number>CT
    # No pre-seeding required — any code matching the pattern is accepted.
    if not TRAINER_CODE_PATTERN.match(trainer_in.registration_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your profile is not registered with us. Please contact admin at our branch."
        )

    # 1. Identity Logic: Parse Gmail username
    username = trainer_in.email.split("@")[0]
    hashed_pass = security_service.hash_password(trainer_in.password)
    
    # 2. Database Transaction
    new_user = models.User(
        username=username,
        email=trainer_in.email,
        hashed_password=hashed_pass,
        role=models.UserRole.TRAINER
    )
    db.add(new_user)
    db.flush() # Flush to get the new_user.id
    
    new_trainer = models.Trainer(
        user_id=new_user.id,
        name=trainer_in.name,
        specialization=trainer_in.specialization
    )
    db.add(new_trainer)
    db.flush() # Flush to get new_trainer.id
    
    db.commit()
    
    return {"message": "Trainer registration successful."}

def authenticate_user(db: Session, login_data: schemas.UserLogin):
    # 1. Attempt to find the user in the 'users' table by username
    print("Attempting login for user/email:", login_data.username)
    user = db.query(models.User).filter(
        (models.User.username == login_data.username) | 
        (models.User.email == login_data.username)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Enforce Trainer-only login
    if user.role != models.UserRole.TRAINER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Login is restricted to trainers only. Students must use Google Sign-In."
        )

    # 3. Security Check
    print(f"User found: {user.username} with role {user.role} ")
    is_valid = security_service.verify_password(
        login_data.password, user.hashed_password
    )
    print("Password match result:", is_valid)

    if not is_valid:
        print("Stored Hash in DB: ", user.hashed_password)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
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

def sync_clerk_user_to_db(data: dict):
    db = SessionLocal()
    try:
        clerk_id = data.get("id")

        # Extract primary email
        email = None
        for e in data.get("email_addresses", []):
            if e.get("id") == data.get("primary_email_address_id"):
                email = e.get("email_address")
                break
        
        if not email and data.get("email_addresses"):
            email = data["email_addresses"][0].get("email_address")

        username = data.get("username") or email.split("@")[0] if email else f"user_{clerk_id}"

        # Upsert user into DB
        user = db.query(User).filter(User.clerk_user_id == clerk_id).one_or_none()
        if not user:
            user = User(
                clerk_user_id=clerk_id,
                username=username,
                email=email,
                role=UserRole.STUDENT 
            )
            db.add(user)
            try: 
                db.commit()
                db.refresh(user)
            except IntegrityError:
                print("IntegrityError while inserting user with clerk_user_id starting rollback...")
                db.rollback()
                user = db.query(User).filter_by(email=email).one_or_none()

        # Upsert Student profile if role is student
        if user and user.role == UserRole.STUDENT and not user.student_profile:
            student = Student(
                user_id=user.id, 
                name=f"{data.get('first_name','') or ''} {data.get('last_name','') or ''}".strip(), 
                phone_no=""
            )
            db.add(student)
            try:
                db.commit()
            except IntegrityError:
                print("IntegrityError while inserting student profile starting rollback...")
                db.rollback()
    finally:
        db.close()