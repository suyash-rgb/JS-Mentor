from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile, Form
from typing import List, Optional
from app.services import curriculum_service, cloudinary_service
from app.dependencies import require_trainer
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview 
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.schemas.quiz import QuizCreate, QuizUpdate
from app.schemas.video import VideoCreate, VideoUpdate

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

@router.get("/learning-path/{learning_path}/topics", response_model=List[str])
async def get_topics_for_learning_path(learning_path: str, trainer=Depends(require_trainer)):
    """Returns the list of topic texts for a specific learning path."""
    try:
        return curriculum_service.get_topics_for_path(learning_path)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch topics: {str(e)}")

@router.get("/learning-path/{learning_path}/videos", response_model=List[dict])
async def get_videos_for_learning_path(learning_path: str, trainer=Depends(require_trainer)):
    """Returns the list of videos for a specific learning path."""
    try:
        return curriculum_service.get_all_videos_list(learning_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch videos: {str(e)}")

@router.get("/visualize", response_model=List[PathOverview])
async def visualize_paths(trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_path_structure()
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to visualize structure: {str(e)}")

@router.get("/exercises", response_model=List[dict])
async def list_exercises(path_heading: str = None, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_all_exercises_list(path_heading)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list exercises: {str(e)}")

@router.get("/quizzes", response_model=List[dict])
async def list_quizzes(path_heading: str = None, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_all_quizzes_list(path_heading)
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

@router.get("/videos", response_model=List[dict])
async def list_videos(path_heading: str = None, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.get_all_videos_list(path_heading)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list videos: {str(e)}")

@router.post("/add-video", status_code=status.HTTP_201_CREATED)
async def add_video(
    path_heading: str, 
    page_text: str, 
    title: str = Form(...),
    url: Optional[str] = Form(None),
    file: UploadFile = File(None),
    trainer=Depends(require_trainer)
):
    try:
        video_url = url
        if file:
            # Check file size (100MB limit)
            MAX_SIZE = 100 * 1024 * 1024 # 100MB
            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)
            
            if file_size > MAX_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
                    detail="Video file is too large. Maximum allowed size is 100MB."
                )

            # Upload to cloudinary
            video_url = cloudinary_service.upload_video_large(file.file, file.filename)
            if not video_url:
                raise HTTPException(status_code=500, detail="Failed to upload video to Cloudinary")
        
        if not video_url:
            raise HTTPException(status_code=400, detail="Either video URL or a file must be provided")

        video_data = {"title": title, "url": video_url}
        result = curriculum_service.add_video_to_page(path_heading, page_text, video_data)
        return {"message": f"Successfully added '{title}' to '{page_text}'", "video": result}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to add video: {str(e)}")

@router.put("/videos/{video_id}", status_code=status.HTTP_200_OK)
async def update_existing_video(
    video_id: str, 
    title: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    file: UploadFile = File(None),
    trainer=Depends(require_trainer)
):
    try:
        video_url = url
        if file:
            # Check file size (100MB limit)
            MAX_SIZE = 100 * 1024 * 1024 # 100MB
            file.file.seek(0, 2)
            file_size = file.file.tell()
            file.file.seek(0)
            
            if file_size > MAX_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, 
                    detail="Video file is too large. Maximum allowed size is 100MB."
                )

            # Upload to cloudinary
            video_url = cloudinary_service.upload_video_large(file.file, file.filename)
            if not video_url:
                raise HTTPException(status_code=500, detail="Failed to upload video to Cloudinary")
        
        update_data = VideoUpdate(title=title, url=video_url)
        return curriculum_service.update_video(video_id, update_data)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to update video: {str(e)}")

@router.delete("/videos/{video_id}")
async def delete_video(video_id: str, trainer=Depends(require_trainer)):
    try:
        return curriculum_service.delete_video(video_id)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to delete video: {str(e)}")

@router.post("/add-quiz", status_code=status.HTTP_201_CREATED)
async def add_quiz(path_heading: str, page_text: str, quiz: QuizCreate, trainer=Depends(require_trainer)):
    try:
        curriculum_service.add_quiz_to_page(path_heading, page_text, quiz.dict())
        return {"message": f"Successfully added '{quiz.title}' to '{page_text}'"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to add quiz: {str(e)}")

import csv
import io
import uuid

@router.post("/add-quiz-csv", status_code=status.HTTP_201_CREATED)
async def add_quiz_csv(
    path_heading: str, 
    page_text: str, 
    title: str = Form(...),
    file: UploadFile = File(...),
    trainer=Depends(require_trainer)
):
    try:
        content = await file.read()
        try:
            decoded_content = content.decode('utf-8')
        except UnicodeDecodeError:
            decoded_content = content.decode('latin-1')
            
        csv_reader = csv.reader(io.StringIO(decoded_content))
        
        questions = []
        header_skipped = False
        for row in csv_reader:
            if not row or all(not cell.strip() for cell in row):
                continue
                
            if not header_skipped:
                header_skipped = True
                if "question" in str(row[0]).lower():
                    continue
                
            if len(row) >= 6:
                text = row[0].strip()
                options = [row[1].strip(), row[2].strip(), row[3].strip(), row[4].strip()]
                correct_answer = row[5].strip()
                
                # If correct_answer is just 1,2,3,4 or A,B,C,D
                if correct_answer.lower() == 'a': correct_answer = options[0]
                elif correct_answer.lower() == 'b': correct_answer = options[1]
                elif correct_answer.lower() == 'c': correct_answer = options[2]
                elif correct_answer.lower() == 'd': correct_answer = options[3]
                elif correct_answer == '1': correct_answer = options[0]
                elif correct_answer == '2': correct_answer = options[1]
                elif correct_answer == '3': correct_answer = options[2]
                elif correct_answer == '4': correct_answer = options[3]
                
                q = {
                    "id": str(uuid.uuid4()),
                    "text": text,
                    "options": options,
                    "correct_answer": correct_answer
                }
                questions.append(q)

        if not questions:
            raise HTTPException(status_code=400, detail="No valid questions found in the CSV.")

        quiz_data = {
            "title": title,
            "questions": questions
        }
        
        curriculum_service.add_quiz_to_page(path_heading, page_text, quiz_data)
        return {"message": f"Successfully imported '{title}' with {len(questions)} questions.", "quiz": quiz_data}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to process CSV quiz: {str(e)}")

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


