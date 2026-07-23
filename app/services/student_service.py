from sqlalchemy.orm import Session
from sqlalchemy.dialects.mysql import insert
from sqlalchemy.sql import func
from fastapi import HTTPException
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from app.models.interaction import Doubt
from app.models.student import Student
from app.schemas.analytics import ProgressUpdate, ExerciseSubmission, QuizSubmission, VideoProgressUpdate
from app.schemas.scheduling import MyDoubtDetail
from app.models.learning import VideoProgress
import json
import os

def log_progress(
    progress_in: ProgressUpdate, 
    student: Student, 
    db: Session
):
    # Atomic Upsert using MySQL specific syntax via SQLAlchemy
    stmt = insert(StudentProgress).values(
        student_id=student.id,
        topic_id=progress_in.topic_id,
        status=progress_in.status,
        time_spent_seconds=progress_in.time_spent_seconds
    )

    stmt = stmt.on_duplicate_key_update(
        status=stmt.inserted.status,
        time_spent_seconds=StudentProgress.time_spent_seconds + progress_in.time_spent_seconds,
        last_accessed_at=func.now()
    )

    db.execute(stmt)
    db.commit()
    evaluate_topic_completion(student, progress_in.topic_id, db)
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

    grade = None
    if exercise_in.total_tests and exercise_in.total_tests > 0:
        grade = round((exercise_in.tests_passed / exercise_in.total_tests) * 5)

    evaluation = ExerciseEvaluation(
        student_id=student.id,
        exercise_id=exercise_in.exercise_id,
        code_submitted=exercise_in.code_submitted,
        is_correct=exercise_in.is_correct,
        execution_time_ms=exercise_in.execution_time_ms,
        attempt_number=attempt_num,
        status='PENDING_REVIEW',
        grade=grade
    )
    db.add(evaluation)
    db.commit()
    
    topic_id = _find_topic_for_component("exercises", exercise_in.exercise_id)
    if topic_id:
        evaluate_topic_completion(student, topic_id, db)
        
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
    
    topic_id = _find_topic_for_component("quizzes", quiz_in.quiz_id)
    if topic_id:
        evaluate_topic_completion(student, topic_id, db)
        
    return {"message": "Quiz performance logged successfully"}

def _find_topic_for_component(comp_type, comp_id):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(BASE_DIR, "data.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        return None
    for card in data.get("cards", []):
        for link in card.get("links", []):
            page_content = link.get("pageContent", {})
            for item in page_content.get(comp_type, []):
                if item.get("id") == comp_id:
                    return link.get("url")
    return None

def get_my_doubts(
    student: Student,
    db: Session,
):
    doubts = db.query(Doubt).filter(
        Doubt.student_id == student.id,
        Doubt.status != 'RESOLVED'
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

def log_video(
    video_in: VideoProgressUpdate,
    student: Student,
    db: Session
):
    stmt = insert(VideoProgress).values(
        student_id=student.id,
        topic_id=video_in.topic_id,
        video_url=video_in.video_url,
        is_completed=video_in.is_completed,
        watched_seconds=video_in.watched_seconds
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=['student_id', 'topic_id'],
        set_={
            'is_completed': func.bool_or(VideoProgress.is_completed, stmt.excluded.is_completed),
            'watched_seconds': func.greatest(VideoProgress.watched_seconds, stmt.excluded.watched_seconds),
            'last_accessed_at': func.now()
        }
    )
    # Note: SQLite doesn't have bool_or/greatest natively in UPSERT sometimes, so let's do simple query first.
    # Actually, let's just query and update to be safe across DBs.
    pass

# We'll redefine log_video correctly using query/update to avoid dialect issues
def log_video_safe(
    video_in: VideoProgressUpdate,
    student: Student,
    db: Session
):
    vp = db.query(VideoProgress).filter_by(
        student_id=student.id, 
        topic_id=video_in.topic_id, 
        video_url=video_in.video_url
    ).first()
    
    if vp:
        if video_in.is_completed:
            vp.is_completed = True
        if video_in.watched_seconds > vp.watched_seconds:
            vp.watched_seconds = video_in.watched_seconds
        vp.last_accessed_at = func.now()
    else:
        vp = VideoProgress(
            student_id=student.id,
            topic_id=video_in.topic_id,
            video_url=video_in.video_url,
            is_completed=video_in.is_completed,
            watched_seconds=video_in.watched_seconds
        )
        db.add(vp)
    
    db.commit()
    evaluate_topic_completion(student, video_in.topic_id, db)
    return {"message": "Video progress logged"}

log_video = log_video_safe

def evaluate_topic_completion(student: Student, topic_id: str, db: Session):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(BASE_DIR, "data.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        return
    
    # Find the topic in data.json
    topic_data = None
    for card in data.get("cards", []):
        for link in card.get("links", []):
            if link.get("url") == topic_id:
                topic_data = link.get("pageContent", {})
                break
        if topic_data:
            break
            
    if not topic_data:
        return

    # Check requirements
    videos_req = topic_data.get("videos", [])
    quizzes_req = topic_data.get("quizzes", [])
    exercises_req = topic_data.get("exercises", [])
    
    is_complete = True
    
    # Check videos
    for v in videos_req:
        v_url = v.get("url")
        vp = db.query(VideoProgress).filter_by(student_id=student.id, topic_id=topic_id, video_url=v_url, is_completed=True).first()
        if not vp:
            is_complete = False
            break
            
    # Check quizzes
    if is_complete:
        for q in quizzes_req:
            q_id = q.get("id")
            qe = db.query(QuizEvaluation).filter_by(student_id=student.id, quiz_id=q_id, passed=True).first()
            if not qe:
                is_complete = False
                break
                
    # Check exercises
    if is_complete:
        for ex in exercises_req:
            ex_id = ex.get("id")
            ee = db.query(ExerciseEvaluation).filter_by(student_id=student.id, exercise_id=ex_id, is_correct=True).first()
            if not ee:
                is_complete = False
                break

    if is_complete:
        # Update StudentProgress to COMPLETED
        sp = db.query(StudentProgress).filter_by(student_id=student.id, topic_id=topic_id).first()
        if sp:
            sp.status = 'COMPLETED'
            sp.last_accessed_at = func.now()
        else:
            sp = StudentProgress(student_id=student.id, topic_id=topic_id, status='COMPLETED')
            db.add(sp)
        db.commit()

def get_topic_status(topic_id: str, student: Student, db: Session):
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    data_path = os.path.join(BASE_DIR, "data.json")
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        return {}
    
    topic_data = None
    for card in data.get("cards", []):
        for link in card.get("links", []):
            if link.get("url") == topic_id:
                topic_data = link.get("pageContent", {})
                break
        if topic_data:
            break
            
    if not topic_data:
        return {}

    status_data = {
        "videos": {},
        "quizzes": {},
        "exercises": {}
    }
    
    # Check videos
    for v in topic_data.get("videos", []):
        v_url = v.get("url")
        vp = db.query(VideoProgress).filter_by(student_id=student.id, topic_id=topic_id, video_url=v_url, is_completed=True).first()
        status_data["videos"][v_url] = bool(vp)
            
    # Check quizzes
    for q in topic_data.get("quizzes", []):
        q_id = q.get("id")
        qe = db.query(QuizEvaluation).filter_by(student_id=student.id, quiz_id=q_id, passed=True).first()
        status_data["quizzes"][q_id] = bool(qe)
                
    # Check exercises
    for ex in topic_data.get("exercises", []):
        ex_id = ex.get("id")
        ee = db.query(ExerciseEvaluation).filter_by(student_id=student.id, exercise_id=ex_id, is_correct=True).first()
        status_data["exercises"][ex_id] = bool(ee)

    return status_data
