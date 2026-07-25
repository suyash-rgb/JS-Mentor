import pytest
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import MagicMock

from app.database import Base, get_db
import app.models
from app.models.user import User, UserRole
from app.models.student import Student
from app.dependencies import get_current_clerk_student
from app.main import app
from app.routers import payment

# Setup in-memory SQLite database with StaticPool
DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(name="db_session")
def fixture_db_session():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    yield db
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(name="test_student")
def fixture_test_student(db_session):
    student_user = User(
        clerk_user_id="user_test_clerk",
        username="teststudent",
        email="student@test.com",
        role=UserRole.STUDENT
    )
    db_session.add(student_user)
    db_session.commit()
    db_session.refresh(student_user)
    
    student_profile = Student(
        user_id=student_user.id,
        name="Test Student",
        phone_no="9999999999"
    )
    db_session.add(student_profile)
    db_session.commit()
    
    return student_user


@pytest.fixture(name="client")
def fixture_client(db_session, test_student):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    def override_current_user():
        return test_student
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_clerk_student] = override_current_user
    
    with TestClient(app) as c:
        yield c
        
    app.dependency_overrides.clear()


def test_get_subscription_status_inactive(client):
    response = client.get("/api/v1/payment/subscription-status")
    assert response.status_code == 200
    data = response.json()
    assert data["subscription_status"] == "inactive"
    assert data["is_premium"] is False


def test_get_subscription_status_active(client, db_session, test_student):
    test_student.subscription_status = "active"
    test_student.subscription_ends_at = datetime.now(timezone.utc) + timedelta(days=10)
    db_session.commit()
    
    response = client.get("/api/v1/payment/subscription-status")
    assert response.status_code == 200
    data = response.json()
    assert data["subscription_status"] == "active"
    assert data["is_premium"] is True


def test_create_order(client, monkeypatch):
    mock_rzp = MagicMock()
    mock_rzp.customer.create.return_value = {"id": "cust_123"}
    mock_rzp.order.create.return_value = {"id": "order_123"}
    
    monkeypatch.setattr(payment, "client", mock_rzp)
    
    response = client.post("/api/v1/payment/create-order")
    assert response.status_code == 200
    data = response.json()
    assert data["order_id"] == "order_123"
    assert data["amount"] == 99900
    assert data["currency"] == "INR"


def test_verify_signature_success(client, db_session, test_student, monkeypatch):
    test_student.razorpay_order_id = "order_123"
    db_session.commit()
    
    mock_rzp = MagicMock()
    mock_rzp.utility.verify_payment_signature.return_value = True
    
    monkeypatch.setattr(payment, "client", mock_rzp)
    
    payload = {
        "razorpay_payment_id": "pay_123",
        "razorpay_order_id": "order_123",
        "razorpay_signature": "sig_123"
    }
    
    response = client.post("/api/v1/payment/verify-signature", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["subscription_status"] == "active"
    
    # Reload from DB and verify
    assert test_student.subscription_status == "active"
    assert test_student.subscription_ends_at is not None


def test_verify_signature_failure(client, monkeypatch):
    mock_rzp = MagicMock()
    mock_rzp.utility.verify_payment_signature.side_effect = Exception("Invalid signature")
    
    monkeypatch.setattr(payment, "client", mock_rzp)
    
    payload = {
        "razorpay_payment_id": "pay_123",
        "razorpay_order_id": "order_123",
        "razorpay_signature": "sig_123"
    }
    
    response = client.post("/api/v1/payment/verify-signature", json=payload)
    assert response.status_code == 400
    assert "Signature verification failed" in response.json()["detail"]


def test_webhook_payment_captured(client, db_session, test_student, monkeypatch):
    test_student.razorpay_order_id = "order_123"
    db_session.commit()
    
    mock_rzp = MagicMock()
    monkeypatch.setattr(payment, "client", mock_rzp)
    monkeypatch.setenv("RAZORPAY_WEBHOOK_SECRET", "") # bypass signature verification
    
    webhook_data = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "order_id": "order_123"
                }
            }
        }
    }
    
    response = client.post("/api/v1/payment/webhook", json=webhook_data)
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    
    db_session.refresh(test_student)
    assert test_student.subscription_status == "active"
