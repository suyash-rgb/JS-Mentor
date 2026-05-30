from sqlalchemy.orm import Session
from app.models.interaction import Doubt, MentorshipSession, DoubtReply
from app.models.user import UserRole, User
from datetime import datetime
import json
import logging
from typing import List, Optional

logger = logging.getLogger("ChatService")

def validate_session_access(session_id: int, user: User, db: Session):
    """
    Validates if a user has access to a specific mentorship session.
    Returns the session and linked doubt if authorized, otherwise raises Exception.
    """
    # 1. Check if mentorship session exists
    mentorship_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not mentorship_session:
        logger.warning(f"Access denied: Session {session_id} not found.")
        return None, None

    # 2. Verify user is part of the session
    is_authorized = False
    if user.role == UserRole.STUDENT:
        if user.student_profile and mentorship_session.student_id == user.student_profile.id:
            is_authorized = True
    elif user.role == UserRole.TRAINER:
        if user.trainer_profile and mentorship_session.trainer_id == user.trainer_profile.id:
            is_authorized = True

    if not is_authorized:
        logger.warning(f"Access denied: User {user.id} not part of session {session_id}.")
        return None, None

    # 3. Find the doubt linked to this session
    doubt = db.query(Doubt).filter(Doubt.session_id == session_id).first()
    if not doubt:
        logger.warning(f"Access denied: No doubt linked to session {session_id}.")
        return None, None

    return mentorship_session, doubt

def get_chat_history(doubt_id: int, db: Session, limit: int = 20) -> List[dict]:
    """
    Fetches the last N messages for a specific doubt.
    """
    try:
        history = db.query(DoubtReply).filter(DoubtReply.doubt_id == doubt_id)\
            .order_by(DoubtReply.created_at.desc()).limit(limit).all()
        
        return [
            {
                "sender_id": msg.user_id,
                "sender_role": msg.user.role.value if hasattr(msg.user.role, 'value') else msg.user.role,
                "message": msg.message,
                "image_urls": json.loads(msg.image_urls) if msg.image_urls else [],
                "timestamp": msg.created_at.isoformat() + "Z" if msg.created_at else None
            }
            for msg in reversed(history)
        ]
    except Exception as e:
        logger.error(f"Error fetching chat history for doubt {doubt_id}: {e}")
        return []

def save_chat_message(doubt_id: int, user_id: int, message: str, image_urls: List[str], db: Session) -> Optional[dict]:
    """
    Saves a new chat message to the database.
    """
    if not message.strip() and not image_urls:
        return None

    try:
        new_reply = DoubtReply(
            doubt_id=doubt_id,
            user_id=user_id,
            message=message.strip(),
            image_urls=json.dumps(image_urls) if image_urls else None,
            created_at=datetime.utcnow()
        )
        db.add(new_reply)
        db.commit()
        db.refresh(new_reply)

        return {
            "sender_id": user_id,
            "message": message.strip(),
            "image_urls": image_urls,
            "timestamp": new_reply.created_at.isoformat() + "Z" if new_reply.created_at else None
        }
    except Exception as e:
        logger.error(f"Error saving chat message for doubt {doubt_id}: {e}")
        db.rollback()
        return None
