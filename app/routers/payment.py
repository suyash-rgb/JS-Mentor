import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
import razorpay

from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User

router = APIRouter(prefix="/payment", tags=["Payment Gateway"])

# Initialize Razorpay Client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_THnsT3ZKMq5mdm")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "zY2cvDybywDS0nCQ7yGRLqs1")

try:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
except Exception as e:
    print(f"Failed to initialize Razorpay client: {e}")
    razorpay_client = None


class VerifyPaymentRequest(BaseModel):
    razorpay_payment_id: str
    razorpay_order_id: str
    razorpay_signature: str


@router.post("/create-order", summary="Create a new Razorpay Order")
async def create_razorpay_order(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay client is not configured."
        )

    # Standard premium plan amount is ₹599 (59900 paise)
    amount_paise = 59900 
    
    try:
        order_data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_user_{user.id}",
            "payment_capture": 1 # Auto capture payment
        }
        
        # Create order on Razorpay
        order = razorpay_client.order.create(data=order_data)
        
        # Save order_id to user table for verification matching
        user.razorpay_order_id = order["id"]
        db.commit()
        
        return order
    except Exception as err:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create order on Razorpay: {err}"
        )


@router.post("/verify-signature", summary="Verify payment cryptographic signature")
async def verify_signature(
    request_data: VerifyPaymentRequest,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    # Development Bypass check
    if request_data.razorpay_payment_id == "pay_bypass_dev":
        user.razorpay_customer_id = "cust_bypass_dev"
        user.subscription_status = "active"
        user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=365)
        db.commit()
        db.refresh(user)
        return {"status": "success", "message": "Development bypass payment successful."}

    if not razorpay_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Razorpay client is not configured."
        )

    try:
        # Verify the signature
        params_dict = {
            'razorpay_order_id': request_data.razorpay_order_id,
            'razorpay_payment_id': request_data.razorpay_payment_id,
            'razorpay_signature': request_data.razorpay_signature
        }
        
        # Verify payment signature
        razorpay_client.utility.verify_payment_signature(params_dict)

        
        # Update user profile subscription details
        user.razorpay_customer_id = "cust_" + request_data.razorpay_payment_id[-10:] # Placeholder customer ID mapping
        user.subscription_status = "active"
        user.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=365) # 1 Year Premium
        
        db.commit()
        db.refresh(user)
        
        return {"status": "success", "message": "Payment verified and subscription activated successfully."}
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Razorpay signature. Verification failed."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An error occurred during verification: {e}"
        )


@router.get("/subscription-status", summary="Get user subscription status")
async def get_subscription_status(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    # Check if subscription has expired
    is_active = False
    if user.subscription_status == "active" and user.subscription_ends_at:
        # Ensure comparison is timezone aware or naive depending on how it's stored
        ends_at = user.subscription_ends_at
        if ends_at.tzinfo is None:
            ends_at = ends_at.replace(tzinfo=timezone.utc)
            
        if ends_at > datetime.now(timezone.utc):
            is_active = True
        else:
            # Mark inactive if expired
            user.subscription_status = "inactive"
            db.commit()
            
    return {
        "status": "active" if is_active else "inactive",
        "ends_at": user.subscription_ends_at
    }


def is_subscription_active(user: User) -> bool:
    """
    Helper function to check if a user has an active premium subscription.
    """
    if user.role != "STUDENT":
        return True
        
    if user.subscription_status == "active" and user.subscription_ends_at:
        ends_at = user.subscription_ends_at
        if ends_at.tzinfo is None:
            ends_at = ends_at.replace(tzinfo=timezone.utc)
        return ends_at > datetime.now(timezone.utc)
        
    return False

