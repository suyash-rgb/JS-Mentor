from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_user_from_token
from app.models.interaction import Doubt, MentorshipSession, DoubtReply
from app.models.user import UserRole
import json
from datetime import datetime
from typing import List, Dict

router = APIRouter(prefix="/ws/chat", tags=["Chat"])

class ConnectionManager:
    def __init__(self):
        # session_id (mentorship session) -> list of websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, session_id: int):
        await websocket.accept()
        if session_id not in self.active_connections:
            self.active_connections[session_id] = []
        self.active_connections[session_id].append(websocket)

    def disconnect(self, websocket: WebSocket, session_id: int):
        if session_id in self.active_connections:
            if websocket in self.active_connections[session_id]:
                self.active_connections[session_id].remove(websocket)
            if not self.active_connections[session_id]:
                del self.active_connections[session_id]

    async def broadcast(self, message: dict, session_id: int):
        if session_id in self.active_connections:
            # We iterate over a copy to avoid issues if a connection drops during broadcast
            for connection in self.active_connections[session_id][:]:
                try:
                    await connection.send_json(message)
                except Exception:
                    # Broken pipe or closed connection
                    self.disconnect(connection, session_id)

manager = ConnectionManager()

@router.websocket("/{session_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    session_id: int,
    token: str = Query(...),
    db: Session = Depends(get_db)
):
    # 1. Authentication
    user = get_user_from_token(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Authorization
    # Check if mentorship session exists
    mentorship_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
    if not mentorship_session:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Verify user is part of the session
    is_authorized = False
    if user.role == UserRole.STUDENT and user.student_profile and mentorship_session.student_id == user.student_profile.id:
        is_authorized = True
    elif user.role == UserRole.TRAINER and user.trainer_profile and mentorship_session.trainer_id == user.trainer_profile.id:
        is_authorized = True

    if not is_authorized:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Find the doubt linked to this session for history/saving
    doubt = db.query(Doubt).filter(Doubt.session_id == session_id).first()
    if not doubt:
        # If no doubt is linked, we can still chat if the session exists, 
        # but the prompt implies we refer to doubt_replies.
        # We'll need a doubt_id for doubt_replies FK.
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Connection
    await manager.connect(websocket, session_id)
    
    try:
        # On Connect: Fetch last 20 messages
        history = db.query(DoubtReply).filter(DoubtReply.doubt_id == doubt.id)\
            .order_by(DoubtReply.created_at.desc()).limit(20).all()
        
        # Send history in reverse (oldest to newest)
        for msg in reversed(history):
            await websocket.send_json({
                "sender_id": msg.user_id,
                "sender_role": msg.user.role,
                "message": msg.message,
                "image_urls": json.loads(msg.image_urls) if msg.image_urls else [],
                "timestamp": msg.created_at.isoformat()
            })

        # 4. Lifecycle: Listen for messages
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            
            message_text = payload.get("message", "").strip()
            image_urls = payload.get("image_urls", [])

            # Safety: Do not broadcast or save empty messages
            if not message_text and not image_urls:
                continue

            # Save to Database
            new_reply = DoubtReply(
                doubt_id=doubt.id,
                user_id=user.id,
                message=message_text,
                image_urls=json.dumps(image_urls) if image_urls else None,
                created_at=datetime.utcnow()
            )
            db.add(new_reply)
            db.commit()
            db.refresh(new_reply)

            # Broadcast to all in session
            broadcast_payload = {
                "sender_id": user.id,
                "sender_role": user.role,
                "message": message_text,
                "image_urls": image_urls,
                "timestamp": new_reply.created_at.isoformat()
            }
            await manager.broadcast(broadcast_payload, session_id)

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        print(f"WebSocket Error in session {session_id}: {e}")
        manager.disconnect(websocket, session_id)
