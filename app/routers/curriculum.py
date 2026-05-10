from fastapi import APIRouter, Depends, status
from typing import List
from app.services import curriculum_service
from app.dependencies import require_trainer
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview 
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.schemas.quiz import QuizCreate, QuizUpdate

router = APIRouter(prefix="/curriculum", tags=["Curriculum Management"])

#public endpoint 
@router.get("/", summary="Get full curriculum")
async def get_curriculum():
    try:
        return curriculum_service.get_full_curriculum()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch curriculum: {str(e)}")

@router.get("/learning-path-names", response_model=List[str])
async def get_learning_path_names(trainer=Depends(require_trainer)):
    """Returns only the names of the learning paths for sidebar navigation."""
    try:
        return curriculum_service.get_learning_path_names()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch path names: {str(e)}")

@router.get("/visualize", response_model=List[PathOverview])
async def visualize_paths(trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_path_structure()
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to visualize structure: {str(e)}")

@router.get("/exercises", response_model=List[dict])
async def list_exercises(trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_all_exercises_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list exercises: {str(e)}")

@router.get("/quizzes", response_model=List[dict])
async def list_quizzes(trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_all_quizzes_list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list quizzes: {str(e)}")

@router.post("/learning-paths", status_code=status.HTTP_201_CREATED)
async def create_learning_path(path: LearningPathCreate, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.add_learning_path(path)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to create path: {str(e)}")

@router.put("/learning-paths/{heading}", status_code=status.HTTP_200_OK)
async def update_learning_path(heading: str, path_update: LearningPathUpdate, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.update_learning_path(heading, path_update)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to update path: {str(e)}")

@router.post("/add-exercise", status_code=status.HTTP_201_CREATED)
async def add_exercise(path_heading: str, page_text: str, exercise: ExerciseCreate, trainer=Depends(require_trainer)):
    try:
        curriculum_service.add_exercise_to_page(path_heading, page_text, exercise.dict())
        return {"message": f"Successfully added '{exercise.title}' to '{page_text}'"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to add exercise: {str(e)}")

@router.post("/learning-paths/add-exercises-batch", status_code=status.HTTP_201_CREATED)
async def inject_exercises_batch(
    path_heading: str, 
    page_text: str, 
    exercises: List[ExerciseCreate], 
    trainer=Depends(require_trainer)
):
    try:
        return curriculum_service.inject_exercises_batch(path_heading, page_text, exercises)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to inject batch: {str(e)}")

@router.put("/exercises/{ex_id}", status_code=status.HTTP_200_OK)
async def update_existing_exercise(
    ex_id: str, 
    update_data: ExerciseUpdate, 
    trainer=Depends(require_trainer)
):
    try:
        return curriculum_service.update_exercise(ex_id, update_data)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to update exercise: {str(e)}")

@router.delete("/learning-paths/delete-exercises/{ex_id}")
async def delete_exercise(ex_id: str, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.delete_exercise(ex_id)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete exercise: {str(e)}")

@router.post("/add-quiz", status_code=status.HTTP_201_CREATED)
async def add_quiz(path_heading: str, page_text: str, quiz: QuizCreate, trainer=Depends(require_trainer)):
    try:
        curriculum_service.add_quiz_to_page(path_heading, page_text, quiz.dict())
        return {"message": f"Successfully added '{quiz.title}' to '{page_text}'"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to add quiz: {str(e)}")

@router.put("/quizzes/{quiz_id}", status_code=status.HTTP_200_OK)
async def update_quiz(quiz_id: str, update_data: QuizUpdate, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.update_quiz(quiz_id, update_data)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to update quiz: {str(e)}")

@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.delete_quiz(quiz_id)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete quiz: {str(e)}")


