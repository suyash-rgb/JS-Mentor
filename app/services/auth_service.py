from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app import models, schemas
from app.services import security_service




def register_new_trainer(db: Session, trainer_in: schemas.TrainerCreate):
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