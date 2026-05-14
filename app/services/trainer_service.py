from fastapi import Depends, HTTPException, status
from app.models.user import User, UserRole
from app.dependencies import get_current_user   
from app.database import get_db
from sqlalchemy.orm import Session
from app.models.student import Student
from app.models.learning import StudentProgress, ExerciseEvaluation, QuizEvaluation
from app.models.interaction import Doubt, MentorshipSession
from app.schemas.dashboard import DashboardOverview, DashboardStats, RecentSubmission, ActiveSession
from datetime import datetime
from sqlalchemy import func
from app.schemas.grading import SubmissionDetail, GradeSubmissionRequest
from app.services.curriculum_service import load_data, save_data, get_automatic_topic_groups
from app.dependencies import require_trainer


def get_dashboard_overview(
    trainer= Depends(require_trainer),
    db: Session = Depends(get_db)
):
    """
    Provides aggregated data for the Trainer Dashboard overview.
    Currently returns structured mock data until full DB tables are implemented for Doubts and Mentorships.
    """
    # 1. Active Students
    active_students = db.query(Student).count()
    
    # 2. Pending Reviews
    pending_reviews = db.query(ExerciseEvaluation).filter(
        ExerciseEvaluation.status.in_(['NEW', 'PENDING_REVIEW'])
    ).count()
    
    # 3. New Doubts
    new_doubts = db.query(Doubt).filter(Doubt.status == 'OPEN').count()
    
    # 4. Average Score (Simplified: average of quiz scores)
    avg_score = db.query(func.avg(QuizEvaluation.score)).scalar()
    average_score_percentage = float(avg_score) if avg_score else 0.0
    
    stats = DashboardStats(
        active_students=active_students,
        pending_reviews=pending_reviews,
        new_doubts=new_doubts,
        average_score_percentage=round(average_score_percentage, 1)
    )
    
    # 5. Recent Submissions (Latest 5 pending/new)
    recent_evals = db.query(ExerciseEvaluation).filter(
        ExerciseEvaluation.status.in_(['NEW', 'PENDING_REVIEW'])
    ).order_by(ExerciseEvaluation.submitted_at.desc()).limit(5).all()
    
    # Extract all exercises from data.json into a dictionary for quick lookup
    from app.services.curriculum_service import load_data
    curriculum_data = load_data()
    exercises_map = {}
    for card in curriculum_data.get("cards", []):
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            for ex in content.get("exercises", []):
                exercises_map[str(ex.get("id"))] = ex

    recent_submissions = []
    for ev in recent_evals:
        ex_data = exercises_map.get(str(ev.exercise_id), {})
        actual_title = ex_data.get("title", f"Exercise {ev.exercise_id}")
        
        recent_submissions.append(RecentSubmission(
            submission_id=f"sub_{ev.id}",
            exercise_title=actual_title,
            student_id=str(ev.student_id),
            student_name=ev.student.name if ev.student else "Unknown",
            status=ev.status,
            submitted_at=ev.submitted_at or datetime.utcnow()
        ))
        
    # 6. Active Mentorship Sessions
    trainer_profile = trainer.trainer_profile
    active_sessions_query = []
    if trainer_profile:
        active_sessions_query = db.query(MentorshipSession).filter(
            MentorshipSession.trainer_id == trainer_profile.id,
            MentorshipSession.status.in_(['SCHEDULED', 'ACTIVE'])
        ).order_by(MentorshipSession.scheduled_for.asc()).limit(5).all()
        
    active_sessions = []
    for sess in active_sessions_query:
        active_sessions.append(ActiveSession(
            session_id=f"sess_{sess.id}",
            topic=sess.topic,
            time_remaining_minutes=sess.duration_minutes,
            student_name=sess.student.name if sess.student else "Unknown",
            status=sess.status
        ))
        
    return DashboardOverview(
        trainer_name=trainer_profile.name if trainer_profile else "Unknown Trainer",
        is_available=trainer_profile.is_available if trainer_profile else False,
        stats=stats,
        recent_submissions=recent_submissions,
        active_sessions=active_sessions
    )

# get grades
def get_grading_submissions(
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db)
):
    submissions = db.query(ExerciseEvaluation).order_by(ExerciseEvaluation.submitted_at.desc()).all()
    
    # Extract all exercises from data.json into a dictionary for quick lookup
    data = load_data()
    exercises_map = {}
    for card in data.get("cards", []):
        for link in card.get("links", []):
            content = link.get("pageContent", {})
            for ex in content.get("exercises", []):
                exercises_map[str(ex.get("id"))] = ex
    
    result = []
    for sub in submissions:
        # Lookup the actual title and description from our parsed data.json
        ex_data = exercises_map.get(str(sub.exercise_id), {})
        actual_title = ex_data.get("title", f"Exercise {sub.exercise_id}")
        actual_question = ex_data.get("description", "Description not found for this exercise.")
        
        result.append(SubmissionDetail(
            id=sub.id,
            student_id=sub.student_id,
            student_name=sub.student.name if sub.student else "Unknown",
            exercise_id=sub.exercise_id,
            exercise_title=actual_title,
            exercise_question=actual_question,
            status=sub.status,
            submitted_at=sub.submitted_at or datetime.utcnow(),
            code_submitted=sub.code_submitted,
            grade=float(sub.grade) if sub.grade is not None else None,
            feedback=sub.feedback
        ))
    return result

def grade_submission(
    submission_id: int,
    request: GradeSubmissionRequest,
    trainer: User = Depends(require_trainer),
    db: Session = Depends(get_db)
):
    submission = db.query(ExerciseEvaluation).filter(ExerciseEvaluation.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    submission.grade = request.score
    submission.feedback = request.feedback
    submission.status = 'GRADED'
    submission.graded_by = trainer.trainer_profile.id if trainer.trainer_profile else None
    submission.graded_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Submission graded successfully"}

def get_cohort_stats(db: Session = Depends(get_db)):
    # 1. Total Student Count
    total_students = db.query(Student).count()
    if total_students == 0:
        return {"curriculum_mastery": [], "evaluation_metrics": {}}

    # 2. Calculate Curriculum Mastery per Group
    mastery_report = []
    print("--------------- topics ------------- ",get_automatic_topic_groups())
    for group_name, topics in get_automatic_topic_groups().items():
        # Count how many students completed topics in this group
        completions = db.query(StudentProgress).filter(
            StudentProgress.topic_id.in_(topics),
            StudentProgress.status == 'COMPLETED'
        ).count()
        
        # Total possible completions = students * number of topics in group
        total_possible = total_students * len(topics)
        avg_percentage = (completions / total_possible * 100) if total_possible > 0 else 0
        
        mastery_report.append({
            "topic": group_name,
            "average_completion": round(avg_percentage, 1)
        })

    # 3. Aggregate Evaluation Metrics
    # Average Quiz Score
    avg_quiz = db.query(func.avg(QuizEvaluation.score)).scalar() or 0
    
    # Exercise Success Rate (Ratio of is_correct=True)
    total_exercises = db.query(ExerciseEvaluation).count()
    correct_exercises = db.query(ExerciseEvaluation).filter(ExerciseEvaluation.is_correct == True).count()
    success_rate = (correct_exercises / total_exercises * 100) if total_exercises > 0 else 0

    return {
        "curriculum_mastery": mastery_report,
        "evaluation_metrics": {
            "avg_quiz_score": round(float(avg_quiz), 1),
            "exercise_success_rate": round(success_rate, 1),
            "total_active_students": total_students
        }
    }

async def resolve_session(
    session_id: int,
    background_tasks,
    trainer: User,
    db: Session
):
    session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.status = "COMPLETED"
    
    # Resolve the linked doubt
    linked_doubts = session.linked_doubt
    if linked_doubts:
        doubt = linked_doubts[0]
        doubt.status = "RESOLVED"
        doubt.resolved_at = datetime.utcnow()
        doubt.resolved_by = trainer.trainer_profile.id if trainer.trainer_profile else None
        
        # Trigger cleanup
        if doubt.cloudinary_folder:
            from app.services.assets import cleanup_cloudinary_folder
            background_tasks.add_task(cleanup_cloudinary_folder, doubt.cloudinary_folder)
            
    db.commit()

    # WebSocket Notification: Inform both parties that the session is concluded
    try:
        from app.routers.chat import manager
        import asyncio
        asyncio.create_task(manager.broadcast({
            "sender_id": 0,
            "sender_role": "SYSTEM",
            "message": "This session has been marked as RESOLVED by the trainer.",
            "type": "SESSION_RESOLVED",
            "timestamp": datetime.utcnow().isoformat()
        }, session_id))
    except Exception as e:
        print(f"Failed to broadcast session resolution: {e}")

    # Reactive Trigger: Try to schedule any pending doubts into the newly freed time
    try:
        from app.services.scheduler import run_scheduling_engine
        from datetime import date
        run_scheduling_engine(db, date.today())
    except Exception as e:
        print(f"Error triggering reactive scheduling after resolution: {e}")

    return {"message": "Session and linked doubt resolved successfully"}

async def toggle_availability(
    is_available: bool,
    trainer: User,
    db: Session
):
    trainer_profile = trainer.trainer_profile
    if not trainer_profile:
        raise HTTPException(status_code=404, detail="Trainer profile not found")
        
    trainer_profile.is_available = is_available
    db.commit()
    
    # Reactive Trigger: If trainer goes online, try to schedule pending doubts
    if is_available:
        try:
            from app.services.scheduler import run_scheduling_engine
            from datetime import date
            run_scheduling_engine(db, date.today())
        except Exception as e:
            print(f"Error triggering reactive scheduling: {e}")
            
    return {"message": f"Trainer status set to {'Online' if is_available else 'Offline'}", "is_available": is_available}
