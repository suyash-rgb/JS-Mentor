import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, IconButton, Paper, TextField, List, ListItem,
    ListItemText, ListItemAvatar, Avatar, Divider, Chip, CircularProgress, Alert, Tooltip
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import SendIcon from '@mui/icons-material/Send';
import PanToolIcon from '@mui/icons-material/PanTool';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import PeopleIcon from '@mui/icons-material/People';
import ChatIcon from '@mui/icons-material/Chat';

import { useGroupClass } from '../hooks/useGroupClass';
import api from '../services/api'; // Assuming axios instance is exported from services/api

const EMOJI_LIST = ['🔥', '👏', '💡', '❓', '🎉', '👍'];

const GroupClassRoom = () => {
    const { classId } = useParams();
    const navigate = useNavigate();
    
    // User Profile
    const [userRole, setUserRole] = useState(null);
    const [userName, setUserName] = useState('');
    const [studentId, setStudentId] = useState(null);
    const [classDetails, setClassDetails] = useState(null);
    const [metaLoading, setMetaLoading] = useState(true);

    const videoRef = useRef(null);
    const chatEndRef = useRef(null);

    // Get User Role and profile info
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch current user details
                const profileRes = await api.get('/auth/me'); // Check authentication details
                const user = profileRes.data;
                setUserRole(user.role);
                setUserName(user.username || 'User');
                
                if (user.role === 'STUDENT') {
                    // Fetch student profile for student_id
                    const stdProfile = await api.get('/api/v1/student/classes');
                    // Find our student_id (usually user.student_profile.id if loaded from backend, fallback user.id)
                    setStudentId(user.student_profile?.id || user.id);
                }
                
                // Fetch class metadata
                const endpoint = user.role === 'TRAINER' 
                    ? `/api/v1/trainer/classes/${classId}`
                    : `/api/v1/student/classes/${classId}`;
                const classRes = await api.get(endpoint);
                setClassDetails(classRes.data);
            } catch (err) {
                console.error('Failed to load user session/class details:', err);
            } finally {
                setMetaLoading(false);
            }
        };
        fetchProfile();
    }, [classId]);

    // useGroupClass hook
    const {
        classStatus,
        localStream,
        remoteStream,
        chatMessages,
        raisedHands,
        isAudioMuted,
        isScreenSharing,
        isVoiceGranted,
        reactions,
        startClass,
        leaveClass,
        sendChatMessage,
        toggleRaiseHand,
        toggleLocalAudio,
        grantVoicePrivilege,
        revokeVoicePrivilege,
        sendEmojiReaction
    } = useGroupClass(classId, userRole, userName, studentId);

    const [chatInput, setChatInput] = useState('');
    const [showReactionsMenu, setShowReactionsMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'participants'

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current) {
            if (userRole === 'TRAINER' && localStream) {
                // Trainer previewing screen stream locally (silenced to avoid loopback)
                videoRef.current.srcObject = localStream;
                videoRef.current.muted = true;
            } else if (userRole === 'STUDENT' && remoteStream) {
                videoRef.current.srcObject = remoteStream;
                videoRef.current.muted = false;
            }
        }
    }, [localStream, remoteStream, userRole]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = (e) => {
        e.preventDefault();
        if (chatInput.trim()) {
            sendChatMessage(chatInput);
            setChatInput('');
        }
    };

    const handleLeave = () => {
        leaveClass();
        navigate(userRole === 'TRAINER' ? '/dashboard' : '/practice-hub');
    };

    if (metaLoading) {
        return (
            <Box className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white gap-3">
                <CircularProgress color="inherit" />
                <Typography className="text-sm text-slate-400">Verifying session token...</Typography>
            </Box>
        );
    }

    return (
        <Box className="flex flex-col md:flex-row h-screen bg-slate-950 text-white overflow-hidden font-sans">
            <style>{`
                @keyframes floatUp {
                    0% { transform: translateY(100vh) scale(0.5); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 0.8; }
                    100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
                }
                .floating-reaction {
                    position: absolute;
                    bottom: 0;
                    font-size: 2.5rem;
                    animation: floatUp 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    pointer-events: none;
                    z-index: 50;
                }
            `}</style>

            {/* Floating Reactions Render */}
            {reactions.map((react, idx) => (
                <span
                    key={react.id}
                    className="floating-reaction"
                    style={{
                        left: `${15 + (idx * 13) % 60}%`,
                        animationDelay: `${(idx * 0.1) % 0.5}s`
                    }}
                >
                    {react.emoji}
                </span>
            ))}

            {/* MAIN CLASSROOM CONTENT CONTAINER */}
            <Box className="flex-1 flex flex-col justify-between p-4 relative h-full">
                {/* Header Information Bar */}
                <Box className="flex items-center justify-between bg-slate-900/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-lg z-10">
                    <Box>
                        <Box className="flex items-center gap-2">
                            <Chip label="LIVE" color="error" size="small" className="font-bold text-[10px]" />
                            <Typography className="text-lg font-black tracking-tight">{classDetails?.title || 'Group Online Class'}</Typography>
                        </Box>
                        <Typography className="text-xs text-slate-400 mt-0.5">Topic: {classDetails?.topic} | Instructor: {classDetails?.trainer_name}</Typography>
                    </Box>
                    <Box className="flex items-center gap-3">
                        <Chip
                            label={`Status: ${classStatus}`}
                            variant="outlined"
                            className="border-slate-700 text-slate-300 font-semibold"
                        />
                        {userRole === 'TRAINER' && classStatus === 'IDLE' && (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={startClass}
                                className="bg-red-600 hover:bg-red-700 text-xs font-bold capitalize px-4 rounded-xl"
                            >
                                Start Stream
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Central Video Viewport */}
                <Box className="flex-1 flex items-center justify-center my-4 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-2xl">
                    {classStatus === 'ACTIVE' ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <Box className="text-center p-6 space-y-4">
                            <CircularProgress color="inherit" size={40} className="text-slate-400" />
                            <Typography className="text-slate-400 font-semibold">
                                {userRole === 'TRAINER' ? 'Click "Start Stream" to share your screen and voice.' : 'Waiting for mentor to broadcast stream...'}
                            </Typography>
                        </Box>
                    )}

                    {/* Mute Overlay (For students if unmuted) */}
                    {userRole === 'STUDENT' && isVoiceGranted && (
                        <Box className="absolute top-4 left-4 bg-emerald-500/90 text-slate-950 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-md">
                            <MicIcon className="w-4 h-4" /> You are allowed to speak
                        </Box>
                    )}
                </Box>

                {/* Bottom Control Toolbar */}
                <Box className="flex items-center justify-center gap-3 bg-slate-900/60 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-lg z-10 max-w-lg mx-auto w-full">
                    {/* Audio Mute/Unmute */}
                    {(userRole === 'TRAINER' || isVoiceGranted) && (
                        <Tooltip title={isAudioMuted ? "Unmute Mic" : "Mute Mic"}>
                            <IconButton
                                onClick={toggleLocalAudio}
                                className={`rounded-xl p-3 ${isAudioMuted ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-red-500 text-white hover:bg-red-600'}`}
                            >
                                {isAudioMuted ? <MicOffIcon /> : <MicIcon />}
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Student Hand Raise */}
                    {userRole === 'STUDENT' && (
                        <Tooltip title={raisedHands.some(h => h.student_id === studentId) ? "Lower Hand" : "Raise Hand"}>
                            <IconButton
                                onClick={toggleRaiseHand}
                                className={`rounded-xl p-3 ${raisedHands.some(h => h.student_id === studentId) ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-600' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <PanToolIcon />
                            </IconButton>
                        </Tooltip>
                    )}

                    {/* Reactions Trigger */}
                    <Box className="relative">
                        <Tooltip title="Send Reaction">
                            <IconButton
                                onClick={() => setShowReactionsMenu(!showReactionsMenu)}
                                className={`rounded-xl p-3 ${showReactionsMenu ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                            >
                                <EmojiEmotionsIcon />
                            </IconButton>
                        </Tooltip>

                        {showReactionsMenu && (
                            <Paper className="absolute bottom-16 left-1/2 -translate-x-1/2 p-2 bg-slate-900 border border-slate-700 rounded-xl flex gap-1 shadow-2xl z-20">
                                {EMOJI_LIST.map((emoji) => (
                                    <IconButton
                                        key={emoji}
                                        onClick={() => {
                                            sendEmojiReaction(emoji);
                                            setShowReactionsMenu(false);
                                        }}
                                        className="hover:bg-slate-800 rounded-lg text-lg p-1.5"
                                    >
                                        {emoji}
                                    </IconButton>
                                ))}
                            </Paper>
                        )}
                    </Box>

                    {/* Disconnect Call */}
                    <Tooltip title="Leave Class">
                        <IconButton
                            onClick={handleLeave}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-xl p-3"
                        >
                            <CallEndIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* SIDE INTERACTIVE COLLABORATION PANEL */}
            <Box className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-[40vh] md:h-full shrink-0">
                {/* Tab Navigation */}
                <Box className="flex border-b border-slate-800">
                    <Button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 rounded-none py-3 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 ${
                            activeTab === 'chat' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <ChatIcon className="w-4 h-4" /> Live Chat
                    </Button>
                    <Button
                        onClick={() => setActiveTab('participants')}
                        className={`flex-1 rounded-none py-3 font-bold text-xs flex items-center justify-center gap-1.5 border-b-2 ${
                            activeTab === 'participants' ? 'border-red-500 text-red-500' : 'border-transparent text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        <PeopleIcon className="w-4 h-4" /> Queue / Members ({raisedHands.length})
                    </Button>
                </Box>

                {/* Tab content area */}
                {activeTab === 'chat' ? (
                    // CHAT INTERFACE
                    <Box className="flex-1 flex flex-col justify-between overflow-hidden">
                        <Box className="flex-1 p-4 overflow-y-auto space-y-3">
                            {chatMessages.length === 0 ? (
                                <Box className="text-center text-xs text-slate-500 mt-10">
                                    No chat messages yet. Introduce yourself!
                                </Box>
                            ) : (
                                chatMessages.map((msg, index) => (
                                    <Box key={index} className="space-y-1">
                                        <Box className="flex items-center gap-2">
                                            <span className="text-xs font-black text-slate-400">{msg.sender}</span>
                                            <span className="text-[10px] text-slate-600">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </Box>
                                        <Typography className="text-sm bg-slate-800/80 p-2.5 rounded-xl border border-slate-850 break-words max-w-[90%]">
                                            {msg.text}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </Box>
                        
                        <form onSubmit={handleSendChat} className="p-3 border-t border-slate-800 bg-slate-950/40 flex gap-2">
                            <TextField
                                size="small"
                                placeholder="Send message..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                autoComplete="off"
                                className="flex-1"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        color: 'white',
                                        backgroundColor: '#1e293b',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        '& fieldset': { borderColor: '#334155' },
                                        '&:hover fieldset': { borderColor: '#475569' },
                                    }
                                }}
                            />
                            <IconButton type="submit" className="bg-red-600 hover:bg-red-700 text-white rounded-xl">
                                <SendIcon fontSize="small" />
                            </IconButton>
                        </form>
                    </Box>
                ) : (
                    // PARTICIPANTS / HAND RAISE QUEUE INTERFACE
                    <Box className="flex-1 p-4 overflow-y-auto space-y-4">
                        <Box>
                            <Typography className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hand Raise Queue</Typography>
                            {raisedHands.length === 0 ? (
                                <Typography className="text-xs text-slate-500 text-center py-4 bg-slate-950/20 rounded-xl border border-slate-800/50">
                                    No hand raises currently.
                                </Typography>
                            ) : (
                                <List className="p-0 space-y-2">
                                    {raisedHands.map((student) => (
                                        <ListItem
                                            key={student.student_id}
                                            className="bg-slate-850 border border-slate-800 p-2 rounded-xl flex items-center justify-between"
                                        >
                                            <Box className="flex items-center gap-2">
                                                <Avatar className="w-7 h-7 bg-yellow-500 text-slate-950 font-black text-xs">
                                                    {student.student_name.charAt(0)}
                                                </Avatar>
                                                <Typography className="text-xs font-bold text-yellow-500">{student.student_name}</Typography>
                                            </Box>
                                            
                                            {userRole === 'TRAINER' && (
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    onClick={() => grantVoicePrivilege(student.student_id, peerId)}
                                                    className="bg-emerald-600 hover:bg-emerald-700 text-[10px] py-1 px-2.5 min-w-0 font-bold capitalize rounded-lg"
                                                >
                                                    Unmute
                                                </Button>
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>

                        <Divider className="border-slate-800" />

                        {userRole === 'TRAINER' && (
                            <Box>
                                <Typography className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Active Speakers</Typography>
                                {/* Display active student unmuted nodes */}
                                {Object.keys(activeStudentSourcesRef.current).length === 0 ? (
                                    <Typography className="text-xs text-slate-500 text-center py-4">
                                        No unmuted students.
                                    </Typography>
                                ) : (
                                    <List className="p-0 space-y-2">
                                        {Object.keys(activeStudentSourcesRef.current).map((sid) => {
                                            const name = raisedHands.find(h => h.student_id === parseInt(sid))?.student_name || `Student #${sid}`;
                                            return (
                                                <ListItem
                                                    key={sid}
                                                    className="bg-slate-850 border border-slate-800 p-2 rounded-xl flex items-center justify-between"
                                                >
                                                    <Box className="flex items-center gap-2">
                                                        <Avatar className="w-7 h-7 bg-emerald-500 text-slate-950 font-black text-xs">
                                                            {name.charAt(0)}
                                                        </Avatar>
                                                        <Typography className="text-xs font-bold text-emerald-400">{name}</Typography>
                                                    </Box>
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => revokeVoicePrivilege(parseInt(sid))}
                                                        className="bg-red-600 hover:bg-red-700 text-[10px] py-1 px-2.5 min-w-0 font-bold capitalize rounded-lg"
                                                    >
                                                        Mute
                                                    </Button>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default GroupClassRoom;
