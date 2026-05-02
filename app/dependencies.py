from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
from app.services import security_service
import jwt as pyjwt
from jwt import PyJWKClient
import os

CLERK_JWKS_URL = "https://on-bird-73.clerk.accounts.dev/.well-known/jwks.json"
jwks_client = PyJWKClient(CLERK_JWKS_URL)

# This tells FastAPI where to look for the token (the /auth/login URL)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # 1. Decode JWT
        payload = jwt.decode(
            token, 
            security_service.SECRET_KEY, 
            algorithms=[security_service.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # 2. Fetch User from MySQL
    user = db.query(user_models.User).filter(user_models.User.username == username).first()
    if user is None:
        raise credentials_exception
        
    return user # This now contains the 'role' (Student or Trainer)

def get_current_clerk_student(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate Clerk credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify the Clerk token using Clerk's public keys
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        
        clerk_id = payload.get("sub")
        if not clerk_id:
            raise credentials_exception
            
        # Find the student in the database using their clerk_user_id
        user = db.query(user_models.User).filter(user_models.User.clerk_user_id == clerk_id).first()
        
        # Environment-aware Dev Workaround
        # Since Clerk webhooks cannot hit localhost to create the user during signup,
        # we automatically create a placeholder user here when they first authenticate,
        # ONLY if we are running in a local environment.
        frontend_url = os.getenv("FRONTEND_URL", "")
        if not user and frontend_url.startswith("http://localhost"):
            print(f"Auto-creating missing student from Clerk Token: {clerk_id}")
            from app.models.student import Student
            
            new_user = user_models.User(
                clerk_user_id=clerk_id,
                username=f"student_{clerk_id[:8]}",
                email=payload.get("email", f"{clerk_id}@clerk.local"),
                role=user_models.UserRole.STUDENT
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            new_student = Student(
                user_id=new_user.id,
                name="Auto Generated Student",
                phone_no="0000000000"
            )
            db.add(new_student)
            db.commit()
            
            user = new_user

        if not user or user.role != user_models.UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Access restricted to students only.")
            
        return user
        
    except Exception as e:
        print(f"Clerk Verification Error: {e}")
        raise credentials_exception