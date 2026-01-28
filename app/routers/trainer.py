import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/trainer", tags=["Trainer Tools"])

DATA_FILE = "data.json"

# Dependency to check if the user is a trainer
def require_trainer(current_user: User = Depends(get_current_user)):
    if current_user.role != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to trainers only."
        )
    return current_user

def load_data():
    if not os.path.exists(DATA_FILE):
        return {"exercises": []}
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

@router.get("/exercises", response_model=List[dict])
async def get_all_exercises(trainer: User = Depends(require_trainer)):
    """Allows trainer to see current curriculum content."""
    data = load_data()
    return data.get("exercises", [])

@router.post("/exercises/add", status_code=status.HTTP_201_CREATED)
async def add_exercise(exercise: ExerciseCreate, trainer: User = Depends(require_trainer)):
    """Adds a new JavaScript card to the JSON store."""
    data = load_data()
    
    # Check for duplicate ID
    if any(ex['id'] == exercise.id for ex in data['exercises']):
        raise HTTPException(status_code=400, detail="Exercise ID already exists")
    
    data['exercises'].append(exercise.dict())
    save_data(data)
    return {"message": "Exercise added successfully", "exercise": exercise}

@router.put("/exercises/{ex_id}")
async def update_exercise(ex_id: int, update_data: ExerciseUpdate, trainer: User = Depends(require_trainer)):
    """Modifies an existing exercise by ID."""
    data = load_data()
    for i, ex in enumerate(data['exercises']):
        if ex['id'] == ex_id:
            # Update only the fields provided
            stored_item = data['exercises'][i]
            update_dict = update_data.dict(exclude_unset=True)
            data['exercises'][i] = {**stored_item, **update_dict}
            save_data(data)
            return {"message": "Exercise updated", "updated": data['exercises'][i]}
    
    raise HTTPException(status_code=404, detail="Exercise not found")
