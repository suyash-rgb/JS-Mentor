from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.sql import func
from fastapi import HTTPException
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from app.models.interaction import Doubt
from app.models.student import Student
from app.schemas.analytics import ProgressUpdate, ExerciseSubmission, QuizSubmission
from app.schemas.scheduling import MyDoubtDetail

def log_progress(
    progress_in: ProgressUpdate, 
    student: Student, 
    db: Session
):
    # Atomic Upsert using PostgreSQL specific syntax via SQLAlchemy
    stmt = insert(StudentProgress).values(
        student_id=student.id,
        topic_id=progress_in.topic_id,
        status=progress_in.status,
        time_spent_seconds=progress_in.time_spent_seconds
    )

    stmt = stmt.on_conflict_do_update(
        index_elements=['student_id', 'topic_id'],
        set_={
            'status': stmt.excluded.status,
            'time_spent_seconds': StudentProgress.time_spent_seconds + progress_in.time_spent_seconds,
            'last_accessed_at': func.now()
        }
    )

    db.execute(stmt)
    db.commit()
    return {"message": "Progress logged successfully"}

def log_exercise(
    exercise_in: ExerciseSubmission,
    student: Student,
    db: Session
):
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

def log_quiz(
    quiz_in: QuizSubmission,
    student: Student,
    db: Session
):
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

def get_my_doubts(
    student: Student,
    db: Session,
):
    # We expect a Student model instance here
    doubts = db.query(Doubt).filter(
        Doubt.student_id == student.id
    ).order_by(Doubt.created_at.desc()).all()

    result = []
    for d in doubts:
        session = d.session  # Linked MentorshipSession (None if not yet scheduled)
        result.append(MyDoubtDetail(
            doubt_id=d.id,
            topic=d.topic,
            description=d.description,
            learning_path_index=d.learning_path_index,
            status=d.status,
            created_at=d.created_at,
            scheduled_for=session.scheduled_for if session else None,
            trainer_name=session.trainer.name if session and session.trainer else None,
            duration_minutes=session.duration_minutes if session else None,
            session_id=session.id if session else None,
        ))
    return result
