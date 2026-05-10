import json
import os
import re
from typing import List
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.schemas.learning_path_overview import PathOverview, PageOverview   
from app.schemas.exercise import ExerciseUpdate
from app.dependencies import require_trainer
from app.schemas.exercise import ExerciseCreate
import uuid
from app.schemas.quiz import QuizUpdate

DATA_FILE = "data.json"

def load_data():
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=500, detail="data.json not found")
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=4)

def get_full_curriculum():
    # The Backend serves the file directly to the frontend
    return load_data()

def get_learning_path_names():
    try:
        data = load_data()
        return [card.get("heading") for card in data.get("cards", [])]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load path names: {str(e)}")

def get_path_structure(trainer: User = Depends(require_trainer)):
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

def add_learning_path(path_data):
    data = load_data()
    if "cards" not in data:
        data["cards"] = []
        
    for card in data["cards"]:
        if card.get("heading") == path_data.heading:
            raise HTTPException(status_code=400, detail=f"Learning path '{path_data.heading}' already exists.")
            
    new_card = {
        "heading": path_data.heading,
        "content": path_data.content,
        "links": []
    }
    data["cards"].append(new_card)
    save_data(data)
    return {"message": f"Successfully created learning path '{path_data.heading}'", "path": new_card}

def update_learning_path(heading: str, path_update):
    data = load_data()
    path_found = False
    updated_card = None
    
    for card in data.get("cards", []):
        if card.get("heading") == heading:
            path_found = True
            
            if path_update.heading is not None and path_update.heading != heading:
                for c in data.get("cards", []):
                    if c.get("heading") == path_update.heading:
                        raise HTTPException(status_code=400, detail=f"Learning path with heading '{path_update.heading}' already exists.")
                card["heading"] = path_update.heading
                
            if path_update.content is not None:
                card["content"] = path_update.content
                
            updated_card = card
            break
            
    if not path_found:
        raise HTTPException(status_code=404, detail=f"Learning path '{heading}' not found.")
        
    save_data(data)
    return {"message": f"Successfully updated learning path '{heading}'", "path": updated_card}

def get_all_exercises_list(path_heading: str = None):
    data = load_data()
    all_exercises = []
    for card in data.get("cards", []):
        heading = card.get("heading")
        if path_heading and heading != path_heading:
            continue
            
        for link in card.get("links", []):
            page_text = link.get("text")
            exercises = link.get("pageContent", {}).get("exercises", [])
            for ex in exercises:
                ex["path_heading"] = heading
                ex["page_text"] = page_text
                all_exercises.append(ex)
    return all_exercises

#automated topic discovery
def get_automatic_topic_groups():
    """
    Dynamically generates topic groups based on curriculum headings and their page IDs.
    Returns: {"Fundamentals": ["intro", "variables"...], "JS Core": [...]}
    """
    data = load_data()
    groups = {}
    for card in data.get("cards", []):
        heading = card.get("heading")
        # We use the text or a specific ID field from the links to match StudentProgress.topic_id
        topic_ids = [link.get("text").lower().replace(" ", "-") for link in card.get("links", [])]
        groups[heading] = topic_ids
    return groups

def add_exercise_to_page(path_heading: str, page_text: str, exercise_data: dict):
    """
    Adds a new exercise to a specific page within the curriculum.
    """
    # 1. Load the JSON data
    data = load_data()
    
    # 2. Find the target path and page
    for card in data.get("cards", []):
        if card.get("heading") == path_heading:
            for link in card.get("links", []):
                # Use 'text' field to match the page
                if link.get("text") == page_text:
                    
                    # 3. Prepare the exercise object
                    # Ensure ID is set (e.g., using count or a UUID if implemented)
                    # Here we use a simple length-based ID for demonstration
                    page_exercises = link.get("pageContent", {}).get("exercises", [])
                    exercise_data["id"] = f"ex_{len(page_exercises) + 1}"
                    
                    # Ensure 'status' is set to 'NEW' if not provided
                    if "status" not in exercise_data:
                        exercise_data["status"] = "NEW"
                    
                    # 4. Add to the page
                    link["pageContent"]["exercises"].append(exercise_data)
                    
                    # 5. Save data back to file
                    save_data(data)
                    return

    # Error handling: Page not found
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND, 
        detail=f"Page with text '{page_text}' not found in path '{path_heading}'"
    )

def inject_exercises_batch(
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


def get_exercises_map():
    """Helper for the grading hub to lookup titles/questions by ID."""
    data = load_data()
    ex_map = {}
    for card in data.get("cards", []):
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            for ex in content.get("exercises", []):
                ex_map[str(ex.get("id"))] = ex
    return ex_map

def update_exercise(ex_id: int, update_data: ExerciseUpdate):
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

def delete_exercise(
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

def get_all_quizzes_list(path_heading: str = None):
    data = load_data()
    all_quizzes = []
    for card in data.get("cards", []):
        heading = card.get("heading")
        # If filtering by path, skip cards that don't match
        if path_heading and heading != path_heading:
            continue
            
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            for q in content.get("quizzes", []):
                q["path_heading"] = heading
                q["page_text"] = link.get("text")
                all_quizzes.append(q)
    return all_quizzes

def add_quiz_to_page(path_heading: str, page_text: str, quiz_data: dict):
    data = load_data()
    for card in data.get("cards", []):
        if card.get("heading") == path_heading:
            for link in card.get("links", []):
                if link.get("text") == page_text:
                    if "quizzes" not in link.setdefault("pageContent", {}):
                        link["pageContent"]["quizzes"] = []
                    
                    quiz_data["id"] = str(uuid.uuid4())
                    for q in quiz_data.get("questions", []):
                        if not q.get("id"):
                            q["id"] = str(uuid.uuid4())
                            
                    link["pageContent"]["quizzes"].append(quiz_data)
                    save_data(data)
                    return
    raise HTTPException(status_code=404, detail=f"Page with text '{page_text}' not found in path '{path_heading}'")

def update_quiz(quiz_id: str, update_data: QuizUpdate):
    data = load_data()
    quiz_found = False
    
    for card in data.get("cards", []):
        for link in card.get("links", []):
            quizzes = link.get("pageContent", {}).get("quizzes", [])
            for i, q in enumerate(quizzes):
                if q.get("id") == quiz_id:
                    update_dict = update_data.dict(exclude_unset=True)
                    updated_quiz = {**q, **update_dict}
                    quizzes[i] = updated_quiz
                    quiz_found = True
                    break
            if quiz_found: break
        if quiz_found: break

    if quiz_found:
        save_data(data)
        return {"message": f"Quiz {quiz_id} updated successfully", "updated": updated_quiz}
        
    raise HTTPException(status_code=404, detail=f"Quiz with ID {quiz_id} not found.")

def delete_quiz(quiz_id: str):
    data = load_data()
    quiz_found = False
    
    for card in data.get("cards", []):
        for link in card.get("links", []):
            quizzes = link.get("pageContent", {}).get("quizzes", [])
            for i, q in enumerate(quizzes):
                if q.get("id") == quiz_id:
                    quizzes.pop(i)
                    quiz_found = True
                    break
            if quiz_found: break
        if quiz_found: break

    if quiz_found:
        save_data(data)
        return {"message": f"Quiz {quiz_id} deleted successfully"}
        
    raise HTTPException(status_code=404, detail=f"Quiz with ID {quiz_id} not found.")
