from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.learning import CurriculumNote
from app.schemas.curriculum_note import CurriculumNoteUpsert

client = TestClient(app)

# Override the require_trainer dependency to bypass authentication
from app.dependencies import require_trainer
app.dependency_overrides[require_trainer] = lambda: {"user_id": "test_trainer"}

def test_api():
    large_string = "![Image](data:image/jpeg;base64," + "A" * 200000 + ")"
    print("Sending PUT request with payload size:", len(large_string))
    
    response = client.put(
        "/api/v1/curriculum/notes/Technologies and Trends",
        json={"content": large_string}
    )
    
    print("Response status:", response.status_code)
    print("Response body:", response.text)

if __name__ == "__main__":
    test_api()
