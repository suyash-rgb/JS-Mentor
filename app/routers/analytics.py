from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User, UserRole
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from app.schemas.analytics import ProgressUpdate, ExerciseSubmission, QuizSubmission

router = APIRouter(prefix="/analytics", tags=["Analytics (Student Ingestion)"])



@router.post("/progress")
async def log_progress(
    progress_in: ProgressUpdate, 
    user: User = Depends(get_current_clerk_student), 
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    progress = db.query(StudentProgress).filter(
        StudentProgress.student_id == student.id,
        StudentProgress.topic_id == progress_in.topic_id
    ).first()

    if progress:
        progress.status = progress_in.status
        progress.time_spent_seconds += progress_in.time_spent_seconds
    else:
        progress = StudentProgress(
            student_id=student.id,
            topic_id=progress_in.topic_id,
            status=progress_in.status,
            time_spent_seconds=progress_in.time_spent_seconds
        )
        db.add(progress)
    
    db.commit()
    return {"message": "Progress logged successfully"}

@router.post("/exercise")
async def log_exercise(
    exercise_in: ExerciseSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    # Check for previous attempts to increment attempt_number
    previous_attempt = db.query(ExerciseEvaluation).filter(
        ExerciseEvaluation.student_id == student.id,
        ExerciseEvaluation.exercise_id == exercise_in.exercise_id
    ).order_by(ExerciseEvaluation.attempt_number.desc()).first()

    attempt_num = 1
    if previous_attempt:
        attempt_num = previous_attempt.attempt_number + 1

    evaluation = ExerciseEvaluation(
        student_id=student.id,
        exercise_id=exercise_in.exercise_id,
        code_submitted=exercise_in.code_submitted,
        is_correct=exercise_in.is_correct,
        execution_time_ms=exercise_in.execution_time_ms,
        attempt_number=attempt_num,
        status='NEW'
    )
    db.add(evaluation)
    db.commit()
    return {"message": "Exercise submission logged successfully"}

@router.post("/quiz")
async def log_quiz(
    quiz_in: QuizSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    previous_attempt = db.query(QuizEvaluation).filter(
        QuizEvaluation.student_id == student.id,
        QuizEvaluation.quiz_id == quiz_in.quiz_id
    ).order_by(QuizEvaluation.attempt_number.desc()).first()

    attempt_num = 1
    if previous_attempt:
        attempt_num = previous_attempt.attempt_number + 1

    # Simple logic: passed if score >= 60% of total_questions
    passed = quiz_in.score >= (quiz_in.total_questions * 0.6)

    evaluation = QuizEvaluation(
        student_id=student.id,
        quiz_id=quiz_in.quiz_id,
        score=quiz_in.score,
        total_questions=quiz_in.total_questions,
        passed=passed,
        attempt_number=attempt_num
    )
    db.add(evaluation)
    db.commit()
    return {"message": "Quiz performance logged successfully"}
