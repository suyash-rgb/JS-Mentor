from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
from app.services import security_service
import jwt as pyjwt
from jwt import PyJWKClient
import os

# Clerk Configuration from Environment
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", "https://on-bird-73.clerk.accounts.dev/.well-known/jwks.json")
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
            options={"verify_aud": False},
            leeway=60  # Allow 60 seconds of clock skew
        )
        
        clerk_id = payload.get("sub")
        if not clerk_id:
            print("Clerk Token Error: No 'sub' claim found in token.")
            raise credentials_exception
            
        # Find the student in the database using their clerk_user_id
        user = db.query(user_models.User).filter(user_models.User.clerk_user_id == clerk_id).first()
        
        # Environment-aware User Creation
        # We auto-create users if:
        # 1. They don't exist in our DB yet
        # 2. We are in development (localhost) OR explicit AUTO_CREATE_USERS is enabled
        auto_create = os.getenv("AUTO_CREATE_USERS", "false").lower() == "true"
        frontend_url = os.getenv("FRONTEND_URL", "")
        
        if not user and (frontend_url.startswith("http://localhost") or auto_create):
            print(f"Auto-creating missing student from Clerk Token: {clerk_id}")
            from app.models.student import Student
            
            new_user = user_models.User(
                clerk_user_id=clerk_id,
                username=payload.get("username", f"student_{clerk_id[:8]}"),
                email=payload.get("email", f"{clerk_id}@clerk.local"),
                role=user_models.UserRole.STUDENT
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            
            new_student = Student(
                user_id=new_user.id,
                name=payload.get("name", "New Student"),
                phone_no="0000000000"
            )
            db.add(new_student)
            db.commit()
            
            user = new_user

        if not user:
            print(f"Clerk Auth Error: User with clerk_id {clerk_id} not found in database and auto-creation is disabled.")
            raise HTTPException(status_code=403, detail="User not registered in JS-Mentor.")

        if user.role != user_models.UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Access restricted to students only.")
            
        return user
        
    except Exception as e:
        print(f"Clerk Verification Critical Error: {str(e)}")
        raise credentials_exception

# Dependency to check if the user is a trainer
def require_trainer(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.TRAINER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to trainers only."
        )
    return current_user

def get_user_from_token(token: str, db: Session):
    """
    Unified validator that checks both Clerk student tokens and local trainer tokens.
    Used primarily for WebSocket handshakes where query parameters are required.
    """
    # 1. Try Clerk Student Verification
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = pyjwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}
        )
        clerk_id = payload.get("sub")
        if clerk_id:
            user = db.query(user_models.User).filter(user_models.User.clerk_user_id == clerk_id).first()
            if user and user.role == user_models.UserRole.STUDENT:
                return user
    except Exception:
        pass

    # 2. Try Local Trainer Verification
    try:
        payload = jwt.decode(
            token, 
            security_service.SECRET_KEY, 
            algorithms=[security_service.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username:
            user = db.query(user_models.User).filter(user_models.User.username == username).first()
            if user:
                return user
    except Exception:
        pass

    return None

def get_any_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = get_user_from_token(token, db)
    if not user:
        print(f"DEBUG: get_any_user failed to authenticate token: {token[:20]}...")
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user