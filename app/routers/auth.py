from fastapi import APIRouter, Depends, status, Request, Response, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import auth_service
from svix.webhooks import Webhook, WebhookVerificationError
import os
from app.models.user import User

secret = os.getenv("CLERK_SIGNING_SECRET")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/trainer", status_code=status.HTTP_201_CREATED)
async def register_trainer(trainer_in: schemas.TrainerCreate, db: Session = Depends(get_db)):
    return auth_service.register_new_trainer(db, trainer_in)

@router.post("/login", response_model=schemas.Token)
async def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Simply return the result of the service
    return auth_service.authenticate_user(db, login_data)


@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    # Try to get token from Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    
    # 1. Try validating as Trainer/Admin JWT first
    try:
        from app.services import security_service
        from jose import jwt
        payload = jwt.decode(token, security_service.SECRET_KEY, algorithms=[security_service.ALGORITHM])
        username = payload.get("sub")
        if username:
            user = db.query(User).filter(User.username == username).first()
            if user:
                return {
                    "id": user.id,
                    "clerk_user_id": user.clerk_user_id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role.value if hasattr(user.role, "value") else user.role,
                    "student_profile": {
                        "id": user.student_profile.id if user.student_profile else None
                    } if user.student_profile else None
                }
    except Exception:
        pass
        
    # 2. Try validating as Clerk Student token
    try:
        from app.dependencies import jwks_client
        import jwt as pyjwt
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = pyjwt.decode(token, signing_key.key, algorithms=["RS256"], options={"verify_aud": False}, leeway=60)
        clerk_id = payload.get("sub")
        if clerk_id:
            user = db.query(User).filter(User.clerk_user_id == clerk_id).first()
            if user:
                return {
                    "id": user.id,
                    "clerk_user_id": user.clerk_user_id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role.value if hasattr(user.role, "value") else user.role,
                    "student_profile": {
                        "id": user.student_profile.id if user.student_profile else None
                    } if user.student_profile else None
                }
    except Exception:
        pass
        
    raise HTTPException(status_code=401, detail="Could not validate credentials")


@router.post("/webhook/", status_code=status.HTTP_204_NO_CONTENT)
async def webhook_handler(request: Request, response: Response):
    headers = request.headers
    payload = await request.body()

    try:
        wh = Webhook(secret)
        event = wh.verify(payload, headers)
    except WebhookVerificationError:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return

    # Handle the user.created event
    if event.get("type") == "user.created":
        data = event["data"]
        auth_service.sync_clerk_user_to_db(data)

    return



        