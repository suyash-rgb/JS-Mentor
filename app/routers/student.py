from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User
from app.models.student import Student
from app.schemas.analytics import ProgressUpdate, ExerciseSubmission, QuizSubmission, VideoProgressUpdate
from app.schemas.scheduling import MyDoubtDetail
from app.services import student_service

router = APIRouter(prefix="/student", tags=["Student Features"])

@router.post("/progress", summary="Log student learning progress")
async def log_progress(
    progress_in: ProgressUpdate, 
    user: User = Depends(get_current_clerk_student), 
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_progress(progress_in, student, db)

@router.post("/exercise", summary="Log exercise submission")
async def log_exercise(
    exercise_in: ExerciseSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_exercise(exercise_in, student, db)

@router.post("/quiz", summary="Log quiz performance")
async def log_quiz(
    quiz_in: QuizSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_quiz(quiz_in, student, db)

@router.get("/doubts/mine", response_model=List[MyDoubtDetail], summary="Student views all their doubt requests and session status")
async def get_my_doubts(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db),
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.get_my_doubts(student, db)

@router.post("/video", summary="Log video completion progress")
async def log_video(
    video_in: VideoProgressUpdate,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.log_video(video_in, student, db)

@router.get("/topic-status/{topic_id:path}", summary="Get completion status of topic components")
async def get_topic_status(
    topic_id: str,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student_service.get_topic_status(topic_id, student, db)

from app.models.cohort import GroupClass
from app.schemas.cohort import GroupClassResponse

@router.get("/classes", response_model=List[GroupClassResponse], summary="Student lists scheduled cohort classes")
async def list_student_classes(
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if not student.cohort_id:
        return []
        
    classes = db.query(GroupClass).filter(
        GroupClass.cohort_id == student.cohort_id
    ).order_by(GroupClass.scheduled_for.desc()).all()
    
    res = []
    for c in classes:
        res.append(GroupClassResponse(
            id=c.id,
            cohort_id=c.cohort_id,
            cohort_name=c.cohort.name if c.cohort else "Cohort",
            trainer_id=c.trainer_id,
            trainer_name=c.trainer.name if c.trainer else "Trainer",
            title=c.title,
            topic=c.topic,
            status=c.status,
            scheduled_for=c.scheduled_for,
            duration_minutes=c.duration_minutes,
            created_at=c.created_at
        ))
    return res

@router.get("/classes/{class_id}", response_model=GroupClassResponse, summary="Student gets details of a single group class")
async def get_student_class(
    class_id: int,
    user=Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    c = db.query(GroupClass).filter(GroupClass.id == class_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Class not found")
    return GroupClassResponse(
        id=c.id,
        cohort_id=c.cohort_id,
        cohort_name=c.cohort.name if c.cohort else "Cohort",
        trainer_id=c.trainer_id,
        trainer_name=c.trainer.name if c.trainer else "Trainer",
        title=c.title,
        topic=c.topic,
        status=c.status,
        scheduled_for=c.scheduled_for,
        duration_minutes=c.duration_minutes,
        created_at=c.created_at
    )


