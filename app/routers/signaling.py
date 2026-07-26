import socketio
import asyncio
import urllib.parse
from app.database import SessionLocal
from app.dependencies import get_user_from_token
from app.models.interaction import MentorshipSession
from app.models.user import UserRole
import os
from datetime import datetime

# Global in-memory cache for live dialogue transcripts: class_id -> list of dialogue dicts
class_transcripts = {}


# Allow origins from environment or fallback to "*" for dynamic Netlify deploys
socketio_origins = os.getenv("SOCKETIO_ALLOWED_ORIGINS")
if socketio_origins:
    allowed_origins = socketio_origins.split(",")
else:
    allowed_origins = "*"

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
        # m_session.student_id is FK to students.id — we need the user_id for the socket room
        if m_session.student_id:
            from app.models.student import Student
            student = db.query(Student).filter(Student.id == m_session.student_id).first()
            if student:
                await sio.emit("global-incoming-session", {
                    "sessionId": session_id,
                    "topic": m_session.topic,
                    "mentor": caller_name,
                    "type": "video",
                    "peerId": peer_id
                }, room=f"global_user_{student.user_id}")
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


@sio.event
async def join_group_class(sid, data):
    class_id = data.get("class_id")
    if not class_id:
        return {"error": "class_id required"}
        
    room_name = f"group_class_{class_id}"
    await sio.enter_room(sid, room_name)
    
    async with sio.session(sid) as socket_session:
        socket_session["room"] = room_name
        socket_session["class_id"] = class_id
        
    return {"status": "joined", "room": room_name}

@sio.event
async def register_trainer_peer(sid, data):
    class_id = data.get("class_id")
    peer_id = data.get("peerId")
    if not all([class_id, peer_id]):
        return {"error": "class_id and peerId required"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("trainer-peer-ready", {
        "class_id": class_id,
        "peerId": peer_id
    }, room=room_name, skip_sid=sid)

@sio.event
async def send_group_chat(sid, data):
    class_id = data.get("class_id")
    sender = data.get("sender")
    text = data.get("text")
    if not all([class_id, sender, text]):
        return {"error": "Missing chat payload"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("group-chat-message", {
        "class_id": class_id,
        "sender": sender,
        "text": text,
        "timestamp": datetime.now().isoformat()
    }, room=room_name)

@sio.event
async def live_transcript(sid, data):
    class_id = data.get("class_id")
    speaker = data.get("speaker")
    role = data.get("role")
    text = data.get("text")
    if not all([class_id, speaker, role, text]):
        return {"error": "Missing transcript fields"}
        
    room_name = f"group_class_{class_id}"
    
    # Broadcast to all peers in the room for real-time Closed Captions
    timestamp_iso = datetime.now().isoformat()
    await sio.emit("live-transcript-received", {
        "class_id": class_id,
        "speaker": speaker,
        "role": role,
        "text": text,
        "timestamp": timestamp_iso
    }, room=room_name)
    
    # Append to the in-memory cache
    if class_id not in class_transcripts:
        class_transcripts[class_id] = []
    class_transcripts[class_id].append({
        "speaker": speaker,
        "role": role,
        "text": text,
        "timestamp": timestamp_iso
    })

@sio.event
async def end_group_class(sid, data):
    class_id = data.get("class_id")
    if not class_id:
        return {"error": "class_id required"}
        
    db = SessionLocal()
    try:
        from app.models.cohort import GroupClass, GroupClassStatus
        from app.services.summary_service import generate_summary
        
        # 1. Update GroupClass status to COMPLETED
        group_class = db.query(GroupClass).filter(GroupClass.id == class_id).first()
        if group_class:
            group_class.status = GroupClassStatus.COMPLETED
            db.commit()
            
        # 2. Emit call-ended to all participants
        room_name = f"group_class_{class_id}"
        await sio.emit("group-class-ended", {
            "class_id": class_id
        }, room=room_name)
        
        # 3. Trigger AI summary generation in the background asynchronously
        dialogue_log = class_transcripts.get(class_id, [])
        asyncio.create_task(generate_summary(db, class_id, dialogue_log))
        
        # Clear in-memory log cache
        if class_id in class_transcripts:
            del class_transcripts[class_id]
            
    except Exception as e:
        print(f"[Signaling] Error ending group class: {e}")
    finally:
        db.close()


@sio.event
async def raise_hand(sid, data):
    class_id = data.get("class_id")
    student_id = data.get("student_id")
    student_name = data.get("student_name")
    if not all([class_id, student_id, student_name]):
        return {"error": "Missing hand raise fields"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("student-raised-hand", {
        "student_id": student_id,
        "student_name": student_name
    }, room=room_name, skip_sid=sid)

@sio.event
async def lower_hand(sid, data):
    class_id = data.get("class_id")
    student_id = data.get("student_id")
    if not all([class_id, student_id]):
        return {"error": "Missing lower hand fields"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("student-lowered-hand", {
        "student_id": student_id
    }, room=room_name, skip_sid=sid)

@sio.event
async def grant_voice(sid, data):
    class_id = data.get("class_id")
    student_id = data.get("student_id")
    student_peer_id = data.get("student_peer_id")
    if not all([class_id, student_id]):
        return {"error": "Missing voice grant fields"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("voice-granted", {
        "student_id": student_id,
        "student_peer_id": student_peer_id
    }, room=room_name)

@sio.event
async def revoke_voice(sid, data):
    class_id = data.get("class_id")
    student_id = data.get("student_id")
    if not all([class_id, student_id]):
        return {"error": "Missing voice revoke fields"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("voice-revoked", {
        "student_id": student_id
    }, room=room_name)

@sio.event
async def send_reaction(sid, data):
    class_id = data.get("class_id")
    emoji = data.get("emoji")
    if not all([class_id, emoji]):
        return {"error": "Missing reaction fields"}
        
    room_name = f"group_class_{class_id}"
    await sio.emit("incoming-reaction", {
        "emoji": emoji
    }, room=room_name, skip_sid=sid)

