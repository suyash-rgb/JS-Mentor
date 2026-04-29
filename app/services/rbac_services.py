from fastapi import HTTPException, Depends
from app.dependencies import get_current_user
from .security_service import decode_token # hypothetical function
from app.models import user as user_models

def trainer_only(current_user: user_models.User = Depends(get_current_user)):
    if current_user.role != user_models.UserRole.TRAINER:
        raise HTTPException(status_code=403, detail="Trainers only!")
    return current_user