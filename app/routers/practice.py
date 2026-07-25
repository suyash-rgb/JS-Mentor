from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from app.database import get_db
from app.dependencies import get_current_clerk_student
from app.models.user import User
from app.models.learning import PracticeProgress, ChallengeLeaderboard, WeeklyChallenge
from app.schemas.practice import PracticeSubmission, ChallengeSubmission
import json
import os
from datetime import datetime

router = APIRouter(prefix="/practice", tags=["Practice Hub"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def load_practice_data():
    try:
        with open(os.path.join(BASE_DIR, "practice_data.json"), 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return []

@router.get("/questions", summary="Get practice questions")
def get_questions():
    return load_practice_data()

@router.post("/submit", summary="Submit standard practice question")
def submit_practice(
    submission: PracticeSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if submission.is_correct:
        # Check if already solved
        existing = db.query(PracticeProgress).filter(
            PracticeProgress.student_id == student.id,
            PracticeProgress.question_id == submission.question_id
        ).first()
        if not existing:
            new_prog = PracticeProgress(
                student_id=student.id,
                question_id=submission.question_id
            )
            db.add(new_prog)
            db.commit()
    return {"status": "success"}

@router.get("/weekly-challenge", summary="Get active weekly challenge")
def get_weekly_challenge(db: Session = Depends(get_db)):
    now = datetime.now()
    active = db.query(WeeklyChallenge).filter(
        WeeklyChallenge.start_date <= now,
        WeeklyChallenge.end_date >= now
    ).order_by(desc(WeeklyChallenge.id)).first()
    
    if not active:
        return {"active": False}
        
    questions = load_practice_data()
    q_data = next((q for q in questions if q["id"] == active.challenge_id), None)
    
    return {
        "active": True,
        "challenge_id": active.challenge_id,
        "end_date": active.end_date,
        "question_data": q_data
    }

@router.post("/weekly-challenge/submit", summary="Submit weekly challenge")
def submit_challenge(
    submission: ChallengeSubmission,
    user: User = Depends(get_current_clerk_student),
    db: Session = Depends(get_db)
):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    if not submission.is_correct:
        return {"status": "failed", "message": "Code failed test cases. Not eligible for leaderboard."}
        
    # Leaderboard Formula: (Time to solve weight) + (Execution time weight). Smaller is better.
    # Inverse score so higher is better for leaderboard UI.
    time_weight = 1000000.0 / max(1, submission.time_to_solve_ms) 
    exec_weight = 10000.0 / max(1, submission.execution_time_ms)
    final_score = time_weight * 0.7 + exec_weight * 0.3
    
    # Insert or update leaderboard
    existing = db.query(ChallengeLeaderboard).filter(
        ChallengeLeaderboard.student_id == student.id,
        ChallengeLeaderboard.challenge_id == submission.challenge_id
    ).first()
    
    if existing:
        if final_score > existing.final_score:
            existing.final_score = final_score
            existing.execution_time_ms = submission.execution_time_ms
            db.commit()
    else:
        new_entry = ChallengeLeaderboard(
            student_id=student.id,
            challenge_id=submission.challenge_id,
            execution_time_ms=submission.execution_time_ms,
            final_score=final_score
        )
        db.add(new_entry)
        db.commit()
        
    return {"status": "success", "score": final_score}

@router.get("/weekly-challenge/leaderboard/{challenge_id}", summary="Get leaderboard for challenge")
def get_leaderboard(challenge_id: str, db: Session = Depends(get_db)):
    entries = db.query(ChallengeLeaderboard).filter(
        ChallengeLeaderboard.challenge_id == challenge_id
    ).order_by(desc(ChallengeLeaderboard.final_score)).limit(10).all()
    
    return [
        {
            "student_name": entry.student.name if entry.student.name else "Anonymous",
            "score": round(entry.final_score, 2),
            "execution_time_ms": entry.execution_time_ms
        }
        for entry in entries
    ]

@router.get("/stats", summary="Get practice stats")
def get_practice_stats(user: User = Depends(get_current_clerk_student), db: Session = Depends(get_db)):
    student = user.student_profile
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    solved_count = db.query(PracticeProgress).filter(PracticeProgress.student_id == student.id).count()
    
    # Get solved question IDs
    solved_questions = db.query(PracticeProgress.question_id).filter(PracticeProgress.student_id == student.id).all()
    
    return {
        "practice_problems_solved": solved_count,
        "solved_question_ids": [q[0] for q in solved_questions]
    }
