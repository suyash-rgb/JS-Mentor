import json
import os
import re
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview, PageOverview
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

@router.get("/curriculum")
async def get_curriculum():
    # The Backend serves the file directly to the frontend
    try:
        curriculum = load_data()
        return curriculum
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="data.json not found")

# Learning Path Discovery Endpoint - will be used to visualize the distribution of exercises accross paths/pages
@router.get("/learning-paths/visualize", response_model=List[PathOverview])
async def get_learning_path_structure(trainer: User = Depends(require_trainer)):
    try:
        curriculum = load_data()
        path_structure = []
        
        for card in curriculum.get("cards", []):
            pages = []
            for link in card.get("links", []):
                content = link.get("pageContent", {})
                
                # Match 'title1', 'title2', etc., but ignore 'title41'
                main_titles = [
                    val for key, val in content.items() 
                    if re.match(r'^title\d$', key)
                ]
                
                # Retrieve the exercises we previously injected
                exercises = content.get("exercises", [])
                
                # Clean object: text (matching your 'page_text' parameter) and data
                pages.append({
                    "text": link.get("text"),
                    "titles": main_titles,
                    "exercises": exercises
                })
            
            path_structure.append({
                "heading": card.get("heading"),
                "pages": pages
            })
            
        return path_structure
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="data.json not found")

# @router.get("/learning-path/id/{link_id}", response_model=PathOverview)
# async def get_learning_path_by_id(link_id: int, trainer: User = Depends(require_trainer)):
#     try:
#         """Returns a specific learning path by ID."""
#         curriculum = load_data()
#         link = []
#         for card in curriculum.get("cards", []):
#             print(card)
#             for link in card.get("links", []):
#                 print(link)
#                 if link.get("id") == link_id:
#                     print(link)
#                     return link[link_id]
#     except FileNotFoundError:
#         raise HTTPException(status_code=404, detail="data.json not found")
#     except Exception:
#         raise HTTPException(status_code=404, detail="Learning path not found")

@router.get("/learning-paths/exercises", response_model=List[dict])
async def get_all_exercises(trainer: User = Depends(require_trainer)):
    """Aggregates all exercises nested within the curriculum."""
    data = load_data()
    all_collected_exercises = []
    
    # Traverse the nested structure to find the exercises you injected
    for card in data.get("cards", []):
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            page_exercises = content.get("exercises", [])
            all_collected_exercises.extend(page_exercises)
            
    return all_collected_exercises

@router.post("/learning-paths/add-exercise", status_code=status.HTTP_201_CREATED)
async def inject_exercise_to_page(
    path_heading: str, 
    page_text: str, 
    exercise: ExerciseCreate, 
    trainer: User = Depends(require_trainer)
):
    """
    Finds a specific page by its display text (heading) and adds an exercise.
    Example: path_heading="JavaScript Core", page_text="Closures and Callbacks"
    """
    data = load_data()
    path_found = False
    page_found = False

    # 1. Iterate through Learning Paths (Cards)
    for card in data.get("cards", []):
        if card.get("heading") == path_heading:
            path_found = True
            
            # 2. Iterate through individual Pages (Links)
            for link in card.get("links", []):
                # We now match based on the display text
                if link.get("text") == page_text:
                    page_found = True
                    
                    # 3. Initialize nested structures if they don't exist
                    if "pageContent" not in link:
                        link["pageContent"] = {}
                    if "exercises" not in link["pageContent"]:
                        link["pageContent"]["exercises"] = []
                    
                    # 4. Check for duplicate exercise IDs on this specific page
                    if any(ex['id'] == exercise.id for ex in link["pageContent"]["exercises"]):
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Exercise ID {exercise.id} already exists on this page."
                        )
                    
                    # 5. Append and Save
                    link["pageContent"]["exercises"].append(exercise.dict())
                    save_data(data)
                    
                    return {
                        "message": f"Successfully added '{exercise.title}' to '{page_text}'",
                        "target_path": path_heading,
                        "target_page": page_text
                    }

    # Error handling for missing targets
    if not path_found:
        raise HTTPException(status_code=404, detail=f"Learning Path '{path_heading}' not found.")
    if not page_found:
        raise HTTPException(status_code=404, detail=f"Page '{page_text}' not found within '{path_heading}'.")

@router.post("/learning-paths/add-exercises-batch", status_code=status.HTTP_201_CREATED)
async def inject_exercises_batch(
    path_heading: str, 
    page_text: str, 
    exercises: List[ExerciseCreate], 
    trainer: User = Depends(require_trainer)
):
    """
    Finds a specific page and adds multiple exercises at once.
    """
    data = load_data()
    path_found = False
    page_found = False

    for card in data.get("cards", []):
        if card.get("heading") == path_heading:
            path_found = True
            
            for link in card.get("links", []):
                if link.get("text") == page_text:
                    page_found = True
                    
                    if "pageContent" not in link:
                        link["pageContent"] = {}
                    if "exercises" not in link["pageContent"]:
                        link["pageContent"]["exercises"] = []
                    
                    target_exercises = link["pageContent"]["exercises"]
                    existing_ids = {ex['id'] for ex in target_exercises}
                    
                    # Check for duplicates within the new batch AND existing data
                    new_ids = [ex.id for ex in exercises]
                    if len(new_ids) != len(set(new_ids)):
                         raise HTTPException(status_code=400, detail="Duplicate IDs found within the batch.")
                    
                    for ex_to_add in exercises:
                        if ex_to_add.id in existing_ids:
                            raise HTTPException(
                                status_code=400, 
                                detail=f"Exercise ID {ex_to_add.id} already exists on this page."
                            )
                    
                    # 5. Bulk Append and Save
                    for ex_to_add in exercises:
                        target_exercises.append(ex_to_add.dict())
                    
                    save_data(data)
                    
                    return {
                        "message": f"Successfully added {len(exercises)} exercises to '{page_text}'",
                        "added_count": len(exercises)
                    }

    if not path_found:
        raise HTTPException(status_code=404, detail=f"Path '{path_heading}' not found.")
    if not page_found:
        raise HTTPException(status_code=404, detail=f"Page '{page_text}' not found.")

@router.put("/learning-paths/update-exercises/{ex_id}")
async def update_exercise(
    ex_id: int, 
    update_data: ExerciseUpdate, 
    trainer: User = Depends(require_trainer)
):
    """Deep searches the curriculum to modify an existing exercise by ID."""
    data = load_data()
    exercise_found = False

    # 1. Traverse Cards (Learning Paths)
    for card in data.get("cards", []):
        # 2. Traverse Links (Pages)
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            exercises = content.get("exercises", [])

            # 3. Traverse Exercises on this page
            for i, ex in enumerate(exercises):
                if ex['id'] == ex_id:
                    # Update only the fields provided in the request
                    update_dict = update_data.dict(exclude_unset=True)
                    updated_exercise = {**ex, **update_dict}
                    
                    # Apply update back to the list
                    exercises[i] = updated_exercise
                    exercise_found = True
                    break
            
            if exercise_found: break
        if exercise_found: break

    if exercise_found:
        save_data(data)
        return {"message": f"Exercise {ex_id} updated successfully", "updated": updated_exercise}
    
    raise HTTPException(status_code=404, detail=f"Exercise with ID {ex_id} not found in curriculum.")

@router.delete("/learning-paths/delete-exercises/{ex_id}")
async def delete_exercise(
    ex_id: int, 
    trainer: User = Depends(require_trainer)
):
    """Deep searches the curriculum to delete an existing exercise by ID."""
    data = load_data()
    exercise_found = False

    # 1. Traverse Cards (Learning Paths)
    for card in data.get("cards", []):
        # 2. Traverse Links (Pages)
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            exercises = content.get("exercises", [])

            # 3. Traverse Exercises on this page
            for i, ex in enumerate(exercises):
                if ex['id'] == ex_id:
                    # Remove the exercise from the list
                    exercises.pop(i)
                    exercise_found = True
                    break
            
            if exercise_found: break
        if exercise_found: break

    if exercise_found:
        save_data(data)
        return {"message": f"Exercise {ex_id} deleted successfully"}
    
    raise HTTPException(status_code=404, detail=f"Exercise with ID {ex_id} not found in curriculum.")