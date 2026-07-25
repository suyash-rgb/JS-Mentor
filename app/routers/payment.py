import os
import json
import razorpay
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User

router = APIRouter(prefix="/payment", tags=["Payment Gateway"])

# Razorpay API Client initialization
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_placeholder")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "secret_placeholder")

try:
    client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    print(f"Error initializing Razorpay Client: {e}")
    client = None


class VerifySignatureRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


def is_subscription_active(user: User) -> bool:
    if user.subscription_status != "active":
        return False
    if not user.subscription_ends_at:
        return True
    
    ends_at = user.subscription_ends_at
    if ends_at.tzinfo is not None:
        now = datetime.now(timezone.utc)
    else:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
    return ends_at > now


@router.get("/subscription-status")
async def get_subscription_status(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    is_active = is_subscription_active(user)
    if user.subscription_status == "active" and not is_active:
        user.subscription_status = "inactive"
        db.commit()
            
    return {
        "subscription_status": user.subscription_status,
        "subscription_ends_at": user.subscription_ends_at,
        "is_premium": is_active
    }


@router.post("/create-order")
async def create_order(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    if not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay client is not initialized"
        )
    
    # Check if user already has an active subscription
    if is_subscription_active(user):
        return {
            "message": "User already has an active subscription",
            "subscription_status": user.subscription_status,
            "already_active": True
        }
            
    # Premium subscription costs INR 999 (which is 99900 paise)
    amount_paise = 99900
    currency = "INR"
    
    try:
        # Create a customer in Razorpay if they don't have a customer ID yet
        customer_id = user.razorpay_customer_id
        if not customer_id:
            try:
                customer_data = {
                    "name": user.username,
                    "email": user.email,
                    "fail_existing": 0
                }
                customer = client.customer.create(data=customer_data)
                customer_id = customer["id"]
                user.razorpay_customer_id = customer_id
                db.commit()
            except Exception as cust_err:
                print(f"Error creating Razorpay customer: {cust_err}")
                # Fallback: proceed with order creation even if customer mapping fails
        
        order_data = {
            "amount": amount_paise,
            "currency": currency,
            "receipt": f"receipt_user_{user.id}",
            "notes": {
                "user_id": str(user.id),
                "email": user.email
            }
        }
        
        razorpay_order = client.order.create(data=order_data)
        
        # Save the current order ID to user
        user.razorpay_order_id = razorpay_order["id"]
        db.commit()
        
        return {
            "order_id": razorpay_order["id"],
            "amount": amount_paise,
            "currency": currency,
            "key_id": RAZORPAY_KEY_ID,
            "already_active": False
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.post("/verify-signature")
async def verify_signature(
    payload: VerifySignatureRequest,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    if not client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay client is not initialized"
        )
        
    try:
        # Verify the signature cryptographically
        params_dict = {
            'razorpay_order_id': payload.razorpay_order_id,
            'razorpay_payment_id': payload.razorpay_payment_id,
            'razorpay_signature': payload.razorpay_signature
        }
        
        client.utility.verify_payment_signature(params_dict)
        
        # Update user's subscription details in the DB
        user.subscription_status = "active"
        user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=365)
        db.commit()
        db.refresh(user)
        
        return {
            "status": "success",
            "message": "Payment verified successfully",
            "subscription_status": user.subscription_status
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Signature verification failed: {str(e)}"
        )


@router.post("/webhook")
async def webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    if webhook_secret and signature:
        try:
            client.utility.verify_webhook_signature(body.decode('utf-8'), signature, webhook_secret)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid webhook signature: {str(e)}"
            )
            
    try:
        event_data = json.loads(body)
        event_type = event_data.get("event")
        
        print(f"Received Razorpay webhook event: {event_type}")
        
        if event_type == "payment.captured":
            payload = event_data.get("payload", {})
            payment = payload.get("payment", {}).get("entity", {})
            order_id = payment.get("order_id")
            
            if order_id:
                user = db.query(User).filter(User.razorpay_order_id == order_id).first()
                if user:
                    user.subscription_status = "active"
                    user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=365)
                    db.commit()
                    print(f"Successfully activated user {user.id} via payment.captured webhook")
                    
        elif event_type == "subscription.cancelled":
            payload = event_data.get("payload", {})
            sub = payload.get("subscription", {}).get("entity", {})
            customer_id = sub.get("customer_id")
            
            if customer_id:
                user = db.query(User).filter(User.razorpay_customer_id == customer_id).first()
                if user:
                    user.subscription_status = "cancelled"
                    db.commit()
                    print(f"Successfully cancelled user {user.id} via subscription.cancelled webhook")
                    
        return {"status": "ok"}
    except Exception as e:
        print(f"Error handling webhook event: {e}")
        return {"status": "error", "detail": str(e)}
