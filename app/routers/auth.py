from fastapi import APIRouter, Depends, status, Request, Response
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.database import get_db, SessionLocal
from app import schemas
from app.services import auth_service, security_service
from svix.webhooks import Webhook, WebhookVerificationError
import os
from app.models.user import User, UserRole
from app.models.student import Student

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
    print(os.getenv("CLERK_SIGNING_SECRET"))
    headers = request.headers
    payload = await request.body()

    try:
        wh = Webhook(secret)
        event = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        response.status_code = status.HTTP_400_BAD_REQUEST
        return

    # Handle the user.created event
    if event.get("type") == "user.created":
        data= event["data"]
        sync_user_to_db(data) #Sync function which will upsert into db

    return
    
def sync_user_to_db(data: dict):
        db=SessionLocal()
        try:
            clerk_id=data.get("id")

            # Extract primary email
            email=None
            for e in data.get("email_addresses", []):
                if e.get("id")== data.get("primary_email_address_id"):
                    email=e.get("email_address")
                    break
            
            if not email and data.get("email_addresses"):
                email=data["email_addresses"][0].get("email_address")

            username = data.get("username") or email.split("@")[0] if email else f"user_{clerk_id}"


            #Upsert user into DB
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


            #Upsert Student profile if role is student
            if user and user.role == UserRole.STUDENT and not user.student_profile:
                student=Student(user_id=user.id, name=f"{data.get('first_name','')} {data.get('last_name','')}".strip(), phone_no="")
                db.add(student)
                try:
                    db.commit()
                except IntegrityError:
                    print("IntegrityError while inserting user with clerk_user_id starting rollback...")
                    db.rollback()
        finally:
            db.close() #close session   



        