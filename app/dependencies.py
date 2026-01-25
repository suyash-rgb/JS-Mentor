from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import user as user_models
from app.services import security_service

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