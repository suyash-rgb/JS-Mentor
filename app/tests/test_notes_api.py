import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_any_user
from app.models.user import User, UserRole
from app.models.student import Student
from app.models.learning import StudentNote, CurriculumNote, ClassSummary
from app.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

# Create an in-memory SQLite database for testing APIs
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_notes_api.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

# Mock User and Student records
class MockUser:
    id = 1
    username = "test_student"
    role = UserRole.STUDENT
    
    @property
    def student_profile(self):
        class Profile:
            id = 1
        return Profile()

def mock_get_any_user():
    return MockUser()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
            
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_any_user] = mock_get_any_user
    
    # Seed a master note in the database
    master_note = CurriculumNote(path_id="Fundamentals", content="Trainer course notes")
    db_session.add(master_note)
    db_session.commit()
    
    yield TestClient(app)
    app.dependency_overrides.clear()

def test_get_notes_fallback_to_curriculum(client):
    response = client.get("/api/v1/curriculum/notes/Fundamentals")
    assert response.status_code == 200
    assert response.json()["content"] == "Trainer course notes"

def test_save_and_get_student_note(client):
    # Save a student-specific personal note
    payload = {"content": "Student custom notes"}
    response = client.put("/api/v1/curriculum/student/notes/Fundamentals", json=payload)
    assert response.status_code == 200
    assert response.json()["content"] == "Student custom notes"
    
    # Get the note again; should return student note instead of master note
    res2 = client.get("/api/v1/curriculum/notes/Fundamentals")
    assert res2.status_code == 200
    assert res2.json()["content"] == "Student custom notes"

def test_import_class_summary_to_notes(client, db_session):
    # Create a temporary class summary
    summary = ClassSummary(
        group_class_id=1,
        content="## AI Lecture Notes",
        expires_at=datetime.utcnow() + timedelta(days=2)
    )
    db_session.add(summary)
    db_session.commit()
    
    # Import this summary
    response = client.post(f"/api/v1/curriculum/notes/Fundamentals/import-summary/{summary.id}")
    assert response.status_code == 200
    
    # Verify that the personal note contains the summary content appended
    assert "Trainer course notes" in response.json()["content"]
    assert "## AI Lecture Notes" in response.json()["content"]
