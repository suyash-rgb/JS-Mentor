import socketio
import urllib.parse
from app.database import SessionLocal
from app.dependencies import get_user_from_token
from app.models.interaction import MentorshipSession
from app.models.user import UserRole
import os
from datetime import datetime

# Allow origins from environment or fallback to frontend URLs
allowed_origins = os.getenv("SOCKETIO_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

# Create Socket.IO ASGI application
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins=allowed_origins)
signaling_app = socketio.ASGIApp(sio, socketio_path="")

@sio.event
async def connect(sid, environ, auth):
    query_string = environ.get("QUERY_STRING", "")
    params = urllib.parse.parse_qs(query_string)
    
    token = auth.get("token") if auth and "token" in auth else None
    
    if not token and "token" in params:
        token = params["token"][0]
        
    if not token:
        # Check authorization header
        auth_header = environ.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            
    if not token:
        raise socketio.exceptions.ConnectionRefusedError("Authentication failed: No token provided")
        
    db = SessionLocal()
    try:
        user = get_user_from_token(token, db)
        if not user:
             raise socketio.exceptions.ConnectionRefusedError("Authentication failed: Invalid token")
        
        async with sio.session(sid) as session:
            session["user_id"] = user.id
            session["role"] = user.role.value if hasattr(user.role, 'value') else user.role
            
        # Join global user room for cross-feature notifications (e.g., chat/calls)
        await sio.enter_room(sid, f"global_user_{user.id}")
            
    finally:
        db.close()

@sio.event
async def disconnect(sid):
    async with sio.session(sid) as session:
        active_room = session.get("room")
        if active_room:
             await sio.emit("partner-disconnected", {"message": "Partner disconnected"}, room=active_room, skip_sid=sid)

@sio.event
async def join_session(sid, data):
    session_id = data.get("session_id")
    if not session_id:
        return {"error": "session_id required"}
        
    db = SessionLocal()
    try:
        # verify user is a participant
        async with sio.session(sid) as socket_session:
            user_id = socket_session.get("user_id")
            role = socket_session.get("role")
            
        m_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
        if not m_session:
             return {"error": "Session not found"}
             
        if role == UserRole.STUDENT.value and m_session.student_id != user_id:
            return {"error": "Not authorized to join this session"}
        elif role == UserRole.TRAINER.value and m_session.trainer_id != user_id:
            return {"error": "Not authorized to join this session"}
            
        room_name = f"session_{session_id}"
        await sio.enter_room(sid, room_name)
        
        async with sio.session(sid) as socket_session:
            socket_session["room"] = room_name
            socket_session["session_id"] = session_id
            
        return {"status": "joined", "room": room_name}
    finally:
        db.close()
        

@sio.event
async def initiate_call(sid, data):
    session_id = data.get("session_id")
    peer_id = data.get("peerId")
    caller_name = data.get("callerName")
    
    if not all([session_id, peer_id, caller_name]):
        return {"error": "Missing required fields"}
        
    db = SessionLocal()
    try:
        async with sio.session(sid) as socket_session:
            role = socket_session.get("role")

        # Verification: check if mentorship_session is valid
        m_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
        if not m_session:
             return {"error": "Session not found"}
             
        # Prevent double initiation
        if m_session.status == 'ACTIVE':
             return {"error": "Call is already active"}

        # Validate time constraints (only an issue if it's the student initiating)
        # Note: In a real system, you might want more complex time bounds.
        # Here we just verify it is generally allowed or already SCHEDULED.
        if role == UserRole.STUDENT.value:
            if m_session.status != 'SCHEDULED':
                return {"error": "Session is not scheduled or already past"}
             
        room_name = f"session_{session_id}"
        await sio.emit("incoming-call", {
            "session_id": session_id,
            "peerId": peer_id,
            "callerName": caller_name
        }, room=room_name, skip_sid=sid)
        
        # Also notify the student globally to auto-open their chatbot
        if m_session.student_id:
            await sio.emit("global-incoming-session", {
                "sessionId": session_id,
                "topic": m_session.topic,
                "mentor": caller_name,
                "type": "video",
                "peerId": peer_id
            }, room=f"global_user_{m_session.student_id}")
    finally:
        db.close()

@sio.event
async def accept_call(sid, data):
    session_id = data.get("session_id")
    peer_id = data.get("peerId")
    
    if not all([session_id, peer_id]):
        return {"error": "Missing required fields"}
        
    db = SessionLocal()
    try:
        m_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
        if m_session:
            m_session.status = "ACTIVE"
            db.commit()
            
        room_name = f"session_{session_id}"
        await sio.emit("call-accepted", {
            "session_id": session_id,
            "peerId": peer_id
        }, room=room_name)
    finally:
        db.close()

@sio.event
async def signal_media_state(sid, data):
    session_id = data.get("session_id")
    if not session_id:
        return {"error": "session_id required"}
        
    room_name = f"session_{session_id}"
    await sio.emit("signal-media-state", data, room=room_name, skip_sid=sid)

@sio.event
async def end_call(sid, data):
    session_id = data.get("session_id")
    if not session_id:
        return {"error": "session_id required"}
        
    db = SessionLocal()
    try:
        m_session = db.query(MentorshipSession).filter(MentorshipSession.id == session_id).first()
        if m_session:
            m_session.status = "COMPLETED"
            db.commit()
            
        room_name = f"session_{session_id}"
        await sio.emit("call-ended", {
            "session_id": session_id
        }, room=room_name)
    finally:
        db.close()
