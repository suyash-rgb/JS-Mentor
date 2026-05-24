import React, { useRef, useEffect, useState } from 'react';
import {
    Box, Typography, IconButton, Tooltip, Chip, Paper
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import CallEndIcon from '@mui/icons-material/CallEnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MinimizeIcon from '@mui/icons-material/Minimize';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const CallStatusChip = ({ callStatus, CALL_STATUS, mediaStatePartner }) => {
    if (callStatus === CALL_STATUS.CONNECTING || callStatus === CALL_STATUS.CALLING) {
        return (
            <Chip
                icon={<PendingIcon sx={{ fontSize: 14 }} />}
                label="Connecting..."
                size="small"
                sx={{ bgcolor: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid #fbbf24', fontSize: 11 }}
            />
        );
    }
    if (callStatus === CALL_STATUS.ACTIVE) {
        const partnerMuted = mediaStatePartner?.audioMuted;
        return (
            <Chip
                icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                label={partnerMuted ? 'P2P Established · Partner Muted' : 'P2P Established'}
                size="small"
                sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e', fontSize: 11 }}
            />
        );
    }
    return null;
};

/**
 * VideoContainer
 * 
 * A draggable floating window housing both video feeds, the control bar, and status indicators.
 * Supports screen-share layout swap automatically.
 */
const VideoContainer = ({
    callStatus,
    CALL_STATUS,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    mediaStatePartner,
    onToggleAudio,
    onToggleVideo,
    onToggleScreenShare,
    onEndCall,
    userRole,
}) => {
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const containerRef = useRef(null);
    const dragStart = useRef(null);
    const [position, setPosition] = useState({ x: 20, y: 80 });
    const [isMinimized, setIsMinimized] = useState(false);

    // Attach local stream
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    // Attach remote stream
    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // ── Drag Logic ────────────────────────────────────────────────────────────
    const handleMouseDown = (e) => {
        dragStart.current = {
            startX: e.clientX - position.x,
            startY: e.clientY - position.y,
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!dragStart.current) return;
        setPosition({
            x: e.clientX - dragStart.current.startX,
            y: e.clientY - dragStart.current.startY,
        });
    };

    const handleMouseUp = () => {
        dragStart.current = null;
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };

    const isConnecting = callStatus === CALL_STATUS.CONNECTING || callStatus === CALL_STATUS.CALLING;

    return (
        <Paper
            ref={containerRef}
            elevation={24}
            sx={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                zIndex: 9999,
                width: isMinimized ? 280 : 480,
                borderRadius: 3,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                transition: 'width 0.3s ease',
                userSelect: 'none',
            }}
        >
            {/* ── Drag Handle / Title Bar ─────────────────────────────────── */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: 'grab',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.04)',
                }}
            >
                <DragIndicatorIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, flex: 1 }}>
                    🎥 Mentorship Call
                </Typography>
                <CallStatusChip callStatus={callStatus} CALL_STATUS={CALL_STATUS} mediaStatePartner={mediaStatePartner} />
                <IconButton size="small" onClick={() => setIsMinimized(v => !v)} sx={{ color: 'rgba(255,255,255,0.5)', p: 0.3 }}>
                    {isMinimized ? <OpenInFullIcon sx={{ fontSize: 14 }} /> : <MinimizeIcon sx={{ fontSize: 14 }} />}
                </IconButton>
            </Box>

            {!isMinimized && (
                <>
                    {/* ── Video Feeds ─────────────────────────────────────── */}
                    <Box sx={{ position: 'relative', height: 280, bgcolor: '#000' }}>
                        {/* Remote: Large (main) */}
                        {remoteStream ? (
                            <video
                                ref={remoteVideoRef}
                                autoPlay
                                playsInline
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                                    {isConnecting ? 'Waiting for partner…' : 'No remote stream'}
                                </Typography>
                            </Box>
                        )}

                        {/* Local: Picture-in-Picture corner */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8,
                            width: 100,
                            height: 75,
                            borderRadius: 2,
                            overflow: 'hidden',
                            border: '2px solid rgba(59,130,246,0.5)',
                            bgcolor: '#111',
                        }}>
                            {localStream && !isVideoOff ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                                />
                            ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <VideocamOffIcon sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 22 }} />
                                </Box>
                            )}
                        </Box>

                        {/* Partner muted indicator */}
                        {mediaStatePartner?.audioMuted && (
                            <Box sx={{
                                position: 'absolute', top: 8, left: 8,
                                bgcolor: 'rgba(239,68,68,0.8)', borderRadius: 1,
                                px: 1, py: 0.3, display: 'flex', alignItems: 'center', gap: 0.5
                            }}>
                                <MicOffIcon sx={{ fontSize: 12, color: '#fff' }} />
                                <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>Muted</Typography>
                            </Box>
                        )}
                    </Box>

                    {/* ── Control Bar ─────────────────────────────────────── */}
                    <Box sx={{
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1,
                        py: 1.5, borderTop: '1px solid rgba(255,255,255,0.07)',
                        background: 'rgba(0,0,0,0.3)',
                    }}>
                        <Tooltip title={isAudioMuted ? 'Unmute' : 'Mute'}>
                            <IconButton
                                onClick={onToggleAudio}
                                sx={{
                                    bgcolor: isAudioMuted ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                                    color: isAudioMuted ? '#ef4444' : '#fff',
                                    border: `1px solid ${isAudioMuted ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                                    '&:hover': { bgcolor: isAudioMuted ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.2)' },
                                    width: 40, height: 40,
                                }}
                            >
                                {isAudioMuted ? <MicOffIcon sx={{ fontSize: 18 }} /> : <MicIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}>
                            <IconButton
                                onClick={onToggleVideo}
                                sx={{
                                    bgcolor: isVideoOff ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                                    color: isVideoOff ? '#ef4444' : '#fff',
                                    border: `1px solid ${isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.2)'}`,
                                    '&:hover': { bgcolor: isVideoOff ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.2)' },
                                    width: 40, height: 40,
                                }}
                            >
                                {isVideoOff ? <VideocamOffIcon sx={{ fontSize: 18 }} /> : <VideocamIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}>
                            <IconButton
                                onClick={onToggleScreenShare}
                                sx={{
                                    bgcolor: isScreenSharing ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.1)',
                                    color: isScreenSharing ? '#3b82f6' : '#fff',
                                    border: `1px solid ${isScreenSharing ? '#3b82f6' : 'rgba(255,255,255,0.2)'}`,
                                    '&:hover': { bgcolor: isScreenSharing ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.2)' },
                                    width: 40, height: 40,
                                }}
                            >
                                {isScreenSharing ? <StopScreenShareIcon sx={{ fontSize: 18 }} /> : <ScreenShareIcon sx={{ fontSize: 18 }} />}
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="End Call">
                            <IconButton
                                onClick={onEndCall}
                                sx={{
                                    bgcolor: '#ef4444',
                                    color: '#fff',
                                    border: '1px solid #dc2626',
                                    '&:hover': { bgcolor: '#dc2626' },
                                    width: 44, height: 44,
                                }}
                            >
                                <CallEndIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </>
            )}
        </Paper>
    );
};

export default VideoContainer;
