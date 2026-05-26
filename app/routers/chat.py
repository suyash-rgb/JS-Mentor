from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_user_from_token
from app.services import chat_service
import json
import logging

logger = logging.getLogger("ChatRouter")

class ConnectionManager:
    def __init__(self):
        # session_id (mentorship session) -> list of websockets
        self.active_connections = {}

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
            for connection in self.active_connections[session_id][:]:
                try:
                    await connection.send_json(message)
                except Exception:
                    self.disconnect(connection, session_id)

manager = ConnectionManager()

router = APIRouter(prefix="/ws/chat", tags=["Chat"])

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
        logger.warning(f"WebSocket auth failed for session {session_id}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Authorization & Session Validation via Service
    mentorship_session, doubt = chat_service.validate_session_access(session_id, user, db)
    if not mentorship_session or not doubt:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 3. Connection
    await manager.connect(websocket, session_id)
    
    try:
        # On Connect: Send chat history
        history = chat_service.get_chat_history(doubt.id, db)
        for msg in history:
            await websocket.send_json(msg)

        # 4. Message Loop
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
            except json.JSONDecodeError:
                continue
            
            message_text = payload.get("message", "")
            image_urls = payload.get("image_urls", [])

            # Save via Service
            saved_msg = chat_service.save_chat_message(
                doubt.id, user.id, message_text, image_urls, db
            )

            if saved_msg:
                # Add sender role for the broadcast
                saved_msg["sender_role"] = user.role.value if hasattr(user.role, 'value') else user.role
                await manager.broadcast(saved_msg, session_id)

                # Cross-feature notification: If trainer sends a message, globally notify the student
                from app.routers.signaling import sio
                from app.models.user import UserRole
                
                role_val = user.role.value if hasattr(user.role, 'value') else user.role
                if role_val == UserRole.TRAINER.value and mentorship_session.student_id:
                    await sio.emit("global-incoming-session", {
                        "sessionId": session_id,
                        "topic": doubt.topic,
                        "mentor": user.name,
                        "type": "chat"
                    }, room=f"global_user_{mentorship_session.student_id}")

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
    except Exception as e:
        logger.error(f"WebSocket Error in session {session_id}: {e}")
        manager.disconnect(websocket, session_id)

