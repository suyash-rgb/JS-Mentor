from fastapi import APIRouter, Depends, status, HTTPException, File, UploadFile, Form
from typing import List, Optional
from app.services import curriculum_service, cloudinary_service
from app.dependencies import require_trainer, get_any_user
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate
from app.schemas.learning_path_overview import PathOverview 
from app.schemas.learning_path import LearningPathCreate, LearningPathUpdate
from app.schemas.quiz import QuizCreate, QuizUpdate
from app.schemas.video import VideoCreate, VideoUpdate
from app.schemas.curriculum_note import CurriculumNoteUpsert, CurriculumNoteResponse, StudentNoteResponse, StudentNoteUpsert, ClassSummaryResponse
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/curriculum", tags=["Curriculum Management"])

#public endpoint 
@router.get("/", summary="Get full curriculum")
async def get_curriculum():
    try:
        return curriculum_service.get_full_curriculum()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch curriculum: {str(e)}")

@router.get("/learning-path-topic-index-map", summary="Get mapping of URL slugs to path indices")
async def get_learning_path_topic_index_map():
    """Returns a map of { slug: 1-indexed-position } for all learning paths."""
    try:
        return curriculum_service.get_learning_path_topic_index_map()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate mapping: {str(e)}")

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
        return await curriculum_service.handle_video_upload(path_heading, page_text, title, url, file)
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
        return await curriculum_service.handle_video_update(video_id, title, url, file)
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
        return await curriculum_service.add_quiz_from_csv(path_heading, page_text, title, content)
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

@router.get("/notes/{path_id}", response_model=CurriculumNoteResponse)
async def get_path_note(
    path_id: str,
    user=Depends(get_any_user),
    db: Session = Depends(get_db)
):
    try:
        from app.models.learning import StudentNote, CurriculumNote
        from app.models.user import UserRole
        
        # If user is a student, check if they have personal notes
        if user.role == UserRole.STUDENT:
            student_profile = user.student_profile
            if student_profile:
                student_note = db.query(StudentNote).filter(
                    StudentNote.student_id == student_profile.id,
                    StudentNote.path_id == path_id
                ).first()
                if student_note:
                    return CurriculumNoteResponse(
                        path_id=path_id,
                        content=student_note.content,
                        created_at=student_note.created_at,
                        updated_at=student_note.updated_at
                    )
                    
        # Otherwise (or if no personal note exists), return curriculum note
        return curriculum_service.get_curriculum_note(path_id, db)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch note: {str(e)}")

@router.put("/notes/{path_id}", response_model=CurriculumNoteResponse)
async def update_path_note(
    path_id: str,
    note_data: CurriculumNoteUpsert,
    trainer=Depends(require_trainer),
    db: Session = Depends(get_db)
):
    try:
        return curriculum_service.upsert_curriculum_note(path_id, note_data, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update note: {str(e)}")

@router.put("/student/notes/{path_id}", response_model=StudentNoteResponse)
async def update_student_personal_note(
    path_id: str,
    note_data: StudentNoteUpsert,
    user=Depends(get_any_user),
    db: Session = Depends(get_db)
):
    try:
        from app.models.user import UserRole
        from app.models.learning import StudentNote, CurriculumNote
        
        if user.role != UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Only students can save personal notes")
            
        student_profile = user.student_profile
        if not student_profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
            
        student_note = db.query(StudentNote).filter(
            StudentNote.student_id == student_profile.id,
            StudentNote.path_id == path_id
        ).first()
        
        if student_note:
            student_note.content = note_data.content
        else:
            student_note = StudentNote(
                student_id=student_profile.id,
                path_id=path_id,
                content=note_data.content
            )
            db.add(student_note)
            
        db.commit()
        db.refresh(student_note)
        return student_note
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to update student note: {str(e)}")

@router.get("/notes/summary/{summary_id}", response_model=ClassSummaryResponse)
async def get_class_summary_detail(
    summary_id: int,
    user=Depends(get_any_user),
    db: Session = Depends(get_db)
):
    try:
        from app.models.learning import ClassSummary
        summary = db.query(ClassSummary).filter(ClassSummary.id == summary_id).first()
        if not summary:
            raise HTTPException(status_code=404, detail="Class summary not found or expired")
        return summary
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")

@router.post("/notes/{path_id}/import-summary/{summary_id}", response_model=StudentNoteResponse)
async def import_class_summary_to_notes(
    path_id: str,
    summary_id: int,
    user=Depends(get_any_user),
    db: Session = Depends(get_db)
):
    try:
        from app.models.user import UserRole
        from app.models.learning import StudentNote, CurriculumNote, ClassSummary
        
        if user.role != UserRole.STUDENT:
            raise HTTPException(status_code=403, detail="Only students can import summaries to personal notes")
            
        student_profile = user.student_profile
        if not student_profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
            
        # Get temporary class summary
        summary = db.query(ClassSummary).filter(ClassSummary.id == summary_id).first()
        if not summary:
            raise HTTPException(status_code=404, detail="Class summary not found or expired")
            
        # Get or create student personal note
        student_note = db.query(StudentNote).filter(
            StudentNote.student_id == student_profile.id,
            StudentNote.path_id == path_id
        ).first()
        
        # If no personal note exists, fallback to master curriculum note content and append summary
        if student_note:
            existing_content = student_note.content
        else:
            master_note = db.query(CurriculumNote).filter(CurriculumNote.path_id == path_id).first()
            existing_content = master_note.content if master_note else ""
            
        new_content = f"{existing_content}\n\n{summary.content}"
        
        if student_note:
            student_note.content = new_content
        else:
            student_note = StudentNote(
                student_id=student_profile.id,
                path_id=path_id,
                content=new_content
            )
            db.add(student_note)
            
        db.commit()
        db.refresh(student_note)
        return student_note
        
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        raise HTTPException(status_code=500, detail=f"Failed to import summary: {str(e)}")




