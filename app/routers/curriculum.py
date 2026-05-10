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
    return curriculum_service.get_full_curriculum()

@router.get("/visualize", response_model=List[PathOverview])
async def visualize_paths(trainer=Depends(require_trainer)):
    return curriculum_service.get_path_structure()

@router.get("/exercises", response_model=List[dict])
async def list_exercises(trainer=Depends(require_trainer)):
    return curriculum_service.get_all_exercises_list()

@router.get("/quizzes", response_model=List[dict])
async def list_quizzes(trainer=Depends(require_trainer)):
    return curriculum_service.get_all_quizzes_list()

@router.post("/learning-paths", status_code=status.HTTP_201_CREATED)
async def create_learning_path(path: LearningPathCreate, trainer=Depends(require_trainer)):
    return curriculum_service.add_learning_path(path)

@router.put("/learning-paths/{heading}", status_code=status.HTTP_200_OK)
async def update_learning_path(heading: str, path_update: LearningPathUpdate, trainer=Depends(require_trainer)):
    return curriculum_service.update_learning_path(heading, path_update)

@router.post("/add-exercise", status_code=status.HTTP_201_CREATED)
async def add_exercise(path_heading: str, page_text: str, exercise: ExerciseCreate, trainer=Depends(require_trainer)):
    curriculum_service.add_exercise_to_page(path_heading, page_text, exercise.dict())
    return {"message": f"Successfully added '{exercise.title}' to '{page_text}'"}

@router.post("/learning-paths/add-exercises-batch", status_code=status.HTTP_201_CREATED)
async def inject_exercises_batch(
    path_heading: str, 
    page_text: str, 
    exercises: List[ExerciseCreate], 
    trainer=Depends(require_trainer)
):
    """
    Finds a specific page and adds multiple exercises at once.
    """
    curriculum_service.inject_exercises_batch(path_heading, page_text, exercises)
    return {"message": f"Successfully added {len(exercises)} exercises to '{page_text}'"}

#update an exercise
@router.put("/exercises/{ex_id}", status_code=status.HTTP_200_OK)
async def update_existing_exercise(
    ex_id: int, 
    update_data: ExerciseUpdate, 
    trainer=Depends(require_trainer)
):
    return curriculum_service.update_exercise(ex_id, update_data)

@router.delete("/learning-paths/delete-exercises/{ex_id}")
async def delete_exercise(ex_id: int, trainer=Depends(require_trainer)):
    return curriculum_service.delete_exercise(ex_id, trainer)

@router.post("/add-quiz", status_code=status.HTTP_201_CREATED)
async def add_quiz(path_heading: str, page_text: str, quiz: QuizCreate, trainer=Depends(require_trainer)):
    curriculum_service.add_quiz_to_page(path_heading, page_text, quiz.dict())
    return {"message": f"Successfully added '{quiz.title}' to '{page_text}'"}

@router.put("/quizzes/{quiz_id}", status_code=status.HTTP_200_OK)
async def update_quiz(quiz_id: str, update_data: QuizUpdate, trainer=Depends(require_trainer)):
    return curriculum_service.update_quiz(quiz_id, update_data)

@router.delete("/quizzes/{quiz_id}")
async def delete_quiz(quiz_id: str, trainer=Depends(require_trainer)):
    return curriculum_service.delete_quiz(quiz_id)

# #API to check if get_automatic_topic_groups() works 
# @router.get("/topic-groups", response_model=dict)
# async def get_topic_groups():
#     return curriculum_service.get_automatic_topic_groups()
