import pytest
import json
import os
import uuid
import tempfile
from fastapi.testclient import TestClient

from app.main import app
from app.services import curriculum_service
from app.dependencies import require_trainer

# --- DUMMY DATA ---
INITIAL_DUMMY_DATA = {
    "cards": [
        {
            "heading": "Dummy Path",
            "content": "A path for testing",
            "links": [
                {
                    "text": "Dummy Page",
                    "pageContent": {
                        "title1": "Welcome",
                        "exercises": [
                            {
                                "id": "ex_123",
                                "title": "Existing Exercise",
                                "description": "Existing desc",
                                "difficulty": "Beginner",
                                "status": "NEW"
                            }
                        ],
                        "quizzes": [
                            {
                                "id": "quiz_123",
                                "title": "Existing Quiz",
                                "questions": [
                                    {
                                        "id": "q_123",
                                        "text": "What is 1+1?",
                                        "options": ["1", "2", "3", "4"],
                                        "correct_answer": "2"
                                    }
                                ]
                            }
                        ]
                    }
                }
            ]
        }
    ]
}

@pytest.fixture(autouse=True)
def mock_data_file(monkeypatch):
    """
    Creates a temporary JSON file and patches DATA_FILE in curriculum_service
    so that tests never modify the real data.json.
    """
    fd, path = tempfile.mkstemp(suffix=".json")
    with os.fdopen(fd, 'w') as f:
        json.dump(INITIAL_DUMMY_DATA, f)
    
    # Patch the constant
    monkeypatch.setattr(curriculum_service, "DATA_FILE", path)
    
    yield path
    
    # Cleanup after test
    if os.path.exists(path):
        os.remove(path)

# --- AUTH MOCK ---
class DummyUser:
    id = "trainer123"
    email = "trainer@test.com"
    role = "trainer"

def override_require_trainer():
    return DummyUser()

@pytest.fixture
def override_auth():
    app.dependency_overrides[require_trainer] = override_require_trainer
    yield
    app.dependency_overrides.clear()

@pytest.fixture
def client(override_auth):
    return TestClient(app)

# --- TESTS ---

def test_add_learning_path(client):
    payload = {
        "heading": "New Test Path",
        "content": "Testing path creation",
        "links": [
            {"text": "Intro Page", "url": "/intro", "pageContent": {}}
        ]
    }
    response = client.post("/api/v1/curriculum/learning-paths", json=payload)
    assert response.status_code == 201
    assert response.json()["message"] == "Successfully created learning path 'New Test Path'"
    
    # Verify via get
    res2 = client.get("/api/v1/curriculum/visualize")
    headings = [h["heading"] for h in res2.json()]
    assert "New Test Path" in headings

def test_update_learning_path(client):
    payload = {
        "heading": "Updated Dummy Path",
        "content": "Updated content"
    }
    response = client.put("/api/v1/curriculum/learning-paths/Dummy Path", json=payload)
    assert response.status_code == 200
    assert response.json()["message"] == "Successfully updated learning path 'Dummy Path'"
    assert response.json()["path"]["heading"] == "Updated Dummy Path"

def test_get_visualize(client):
    response = client.get("/api/v1/curriculum/visualize")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["heading"] == "Dummy Path"

def test_get_exercises(client):
    response = client.get("/api/v1/curriculum/exercises")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "ex_123"
    assert data[0]["title"] == "Existing Exercise"

def test_add_exercise(client):
    payload = {
        "id": "new_ex_999",
        "title": "New Exercise",
        "description": "New Desc",
        "difficulty": "Advanced",
        "tags": ["test"]
    }
    response = client.post("/api/v1/curriculum/add-exercise?path_heading=Dummy Path&page_text=Dummy Page", json=payload)
    assert response.status_code == 201
    
    # Verify
    res2 = client.get("/api/v1/curriculum/exercises")
    titles = [ex["title"] for ex in res2.json()]
    assert "New Exercise" in titles

def test_add_exercises_batch(client):
    payload = [
        {"id": "batch_ex_1", "title": "B1", "description": "D1", "difficulty": "Beginner", "tags": []},
        {"id": "batch_ex_2", "title": "B2", "description": "D2", "difficulty": "Advanced", "tags": []}
    ]
    response = client.post("/api/v1/curriculum/learning-paths/add-exercises-batch?path_heading=Dummy Path&page_text=Dummy Page", json=payload)
    assert response.status_code == 201
    assert response.json()["added_count"] == 2

def test_update_exercise(client):
    payload = {"title": "Updated Ex Title", "difficulty": "Intermediate"}
    response = client.put("/api/v1/curriculum/exercises/ex_123", json=payload)
    assert response.status_code == 200
    
    res2 = client.get("/api/v1/curriculum/exercises")
    ex = next(x for x in res2.json() if x["id"] == "ex_123")
    assert ex["title"] == "Updated Ex Title"
    assert ex["difficulty"] == "Intermediate"

def test_delete_exercise(client):
    response = client.delete("/api/v1/curriculum/learning-paths/delete-exercises/ex_123")
    assert response.status_code == 200
    
    res2 = client.get("/api/v1/curriculum/exercises")
    assert len(res2.json()) == 0

def test_get_quizzes(client):
    response = client.get("/api/v1/curriculum/quizzes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == "quiz_123"

def test_add_quiz(client):
    payload = {
        "title": "New Quiz",
        "questions": [
            {"id": "q_new_999", "text": "Is testing fun?", "options": ["Yes", "No", "Maybe", "What"], "correct_answer": "Yes"}
        ]
    }
    response = client.post("/api/v1/curriculum/add-quiz?path_heading=Dummy Path&page_text=Dummy Page", json=payload)
    assert response.status_code == 201
    
    res2 = client.get("/api/v1/curriculum/quizzes")
    titles = [q["title"] for q in res2.json()]
    assert "New Quiz" in titles

def test_add_quiz_csv(client):
    csv_content = b"Question,Option 1,Option 2,Option 3,Option 4,Correct Answer\nWhat is 2+2?,1,2,3,4,4\n"
    files = {"file": ("test.csv", csv_content, "text/csv")}
    data = {"title": "CSV Quiz"}
    response = client.post("/api/v1/curriculum/add-quiz-csv?path_heading=Dummy Path&page_text=Dummy Page", files=files, data=data)
    assert response.status_code == 201
    
    res2 = client.get("/api/v1/curriculum/quizzes")
    titles = [q["title"] for q in res2.json()]
    assert "CSV Quiz" in titles

def test_update_quiz(client):
    payload = {"title": "Updated Quiz Title"}
    response = client.put("/api/v1/curriculum/quizzes/quiz_123", json=payload)
    assert response.status_code == 200
    
    res2 = client.get("/api/v1/curriculum/quizzes")
    quiz = next(q for q in res2.json() if q["id"] == "quiz_123")
    assert quiz["title"] == "Updated Quiz Title"

def test_delete_quiz(client):
    response = client.delete("/api/v1/curriculum/quizzes/quiz_123")
    assert response.status_code == 200
    
    res2 = client.get("/api/v1/curriculum/quizzes")
    assert len(res2.json()) == 0
