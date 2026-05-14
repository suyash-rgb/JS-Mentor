from fastapi import APIRouter, Depends, status, Request, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas
from app.services import auth_service
from svix.webhooks import Webhook, WebhookVerificationError
import os

secret = os.getenv("CLERK_SIGNING_SECRET")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/trainer", status_code=status.HTTP_201_CREATED)
async def register_trainer(trainer_in: schemas.TrainerCreate, db: Session = Depends(get_db)):
    return auth_service.register_new_trainer(db, trainer_in)

@router.post("/login", response_model=schemas.Token)
async def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # Simply return the result of the service
    return auth_service.authenticate_user(db, login_data)


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



        