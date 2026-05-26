import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { getSocket } from '../services/signalingService';

const CALL_STATUS = {
    IDLE: 'IDLE',
    CONNECTING: 'CONNECTING',
    RINGING: 'RINGING',      // Student side: incoming call waiting
    CALLING: 'CALLING',       // Trainer side: call initiated, waiting for accept
    ACTIVE: 'ACTIVE',
    ENDED: 'ENDED',
};

/**
 * useMentorshipCall
 * 
 * Manages the full WebRTC + PeerJS + Socket.IO lifecycle for a 1-on-1 video call.
 * 
 * @param {number} sessionId - The MentorshipSession ID
 * @param {string} userRole - 'TRAINER' or 'STUDENT'
 * @param {string} userName - Display name of the user (for "Incoming Call from X")
 * @param {object} initialIncomingCallData - Initial incoming call data if resuming/joining a ringing state
 */
export const useMentorshipCall = (sessionId, userRole, userName, initialIncomingCallData = null) => {
    // ── State ─────────────────────────────────────────────────────────────────

    const [callStatus, setCallStatus] = useState(initialIncomingCallData ? CALL_STATUS.RINGING : CALL_STATUS.IDLE);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const [peerId, setPeerId] = useState(null);
    const [incomingCallData, setIncomingCallData] = useState(initialIncomingCallData); // { peerId, callerName }

    // Sync state if initialIncomingCallData changes after mount
    useEffect(() => {
        if (initialIncomingCallData) {
            setIncomingCallData(initialIncomingCallData);
            setCallStatus(CALL_STATUS.RINGING);
        }
    }, [initialIncomingCallData]);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [mediaStatePartner, setMediaStatePartner] = useState(null); // { audioMuted, videoOff }

    const peerRef = useRef(null);
    const activeCallRef = useRef(null); // Holds the active PeerJS MediaConnection
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const socketRef = useRef(null);

    // ── Cleanup Helpers ───────────────────────────────────────────────────────

    const stopAllTracks = useCallback((stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    const cleanupCall = useCallback(() => {
        if (activeCallRef.current) {
            activeCallRef.current.close();
            activeCallRef.current = null;
        }
        stopAllTracks(localStreamRef.current);
        stopAllTracks(screenStreamRef.current);
        localStreamRef.current = null;
        screenStreamRef.current = null;
        setLocalStream(null);
        setRemoteStream(null);
        setIsScreenSharing(false);
        setIsAudioMuted(false);
        setIsVideoOff(false);
        setCallStatus(CALL_STATUS.IDLE);
    }, [stopAllTracks]);

    // ── Peer Initialization ───────────────────────────────────────────────────

    const initializePeer = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (peerRef.current && !peerRef.current.destroyed) {
                resolve(peerRef.current.id);
                return;
            }

            const peer = new Peer({
                // Uses PeerJS Cloud by default (no config needed for dev)
                // For production, point to a self-hosted PeerServer
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('[PeerJS] Got peer ID:', id);
                setPeerId(id);
                peerRef.current = peer;
                resolve(id);
            });

            peer.on('error', (err) => {
                console.error('[PeerJS] Error:', err.type, err);
                setCallStatus(CALL_STATUS.ENDED);
                reject(err);
            });

            peer.on('call', (incomingCall) => {
                // Student receives the P2P call from trainer after emitting accept_call
                console.log('[PeerJS] Receiving P2P call from peer:', incomingCall.peer);
                activeCallRef.current = incomingCall;

                incomingCall.answer(localStreamRef.current);

                incomingCall.on('stream', (remoteStr) => {
                    console.log('[PeerJS] Got remote stream');
                    setRemoteStream(remoteStr);
                    setCallStatus(CALL_STATUS.ACTIVE);
                });

                incomingCall.on('close', () => {
                    console.log('[PeerJS] Call closed by peer');
                    cleanupCall();
                });
            });
        });
    }, [cleanupCall]);

    // ── Stream Management ─────────────────────────────────────────────────────

    const startLocalStream = useCallback(async (videoConstraints = true, audioConstraints = true) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: audioConstraints,
            });
            localStreamRef.current = stream;
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.warn('[useMentorshipCall] getUserMedia failed:', err.name);
            // Fallback: audio only
            if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                try {
                    const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                    localStreamRef.current = audioOnlyStream;
                    setLocalStream(audioOnlyStream);
                    setIsVideoOff(true);
                    return audioOnlyStream;
                } catch (audioErr) {
                    console.error('[useMentorshipCall] No media devices available:', audioErr);
                    throw audioErr;
                }
            }
            throw err;
        }
    }, []);

    // ── Screen Share Toggle ───────────────────────────────────────────────────

    const toggleScreenShare = useCallback(async () => {
        if (!activeCallRef.current) return;

        if (isScreenSharing) {
            // Switch back to webcam
            stopAllTracks(screenStreamRef.current);
            screenStreamRef.current = null;

            const webcamTrack = localStreamRef.current?.getVideoTracks()[0];
            if (webcamTrack) {
                const sender = activeCallRef.current.peerConnection
                    ?.getSenders()
                    ?.find(s => s.track?.kind === 'video');
                if (sender) await sender.replaceTrack(webcamTrack);
            }
            setIsScreenSharing(false);
        } else {
            // Start screen capture and replace video sender track
            try {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                screenStreamRef.current = screenStream;

                const screenTrack = screenStream.getVideoTracks()[0];
                const sender = activeCallRef.current.peerConnection
                    ?.getSenders()
                    ?.find(s => s.track?.kind === 'video');

                if (sender) await sender.replaceTrack(screenTrack);
                setIsScreenSharing(true);

                // Auto-revert when user stops screen share via browser UI
                screenTrack.onended = () => {
                    toggleScreenShare();
                };
            } catch (err) {
                console.warn('[useMentorshipCall] Screen share denied or failed:', err);
            }
        }
    }, [isScreenSharing, stopAllTracks]);

    // ── Audio / Video Toggles ─────────────────────────────────────────────────

    const toggleAudio = useCallback(async () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            const muted = !audioTrack.enabled;
            setIsAudioMuted(muted);
            // Signal partner
            if (socketRef.current && sessionId) {
                socketRef.current.emit('signal_media_state', {
                    session_id: sessionId,
                    audioMuted: muted,
                    videoOff: isVideoOff
                });
            }
        }
    }, [isVideoOff, sessionId]);

    const toggleVideo = useCallback(async () => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            const off = !videoTrack.enabled;
            setIsVideoOff(off);
            if (socketRef.current && sessionId) {
                socketRef.current.emit('signal_media_state', {
                    session_id: sessionId,
                    audioMuted: isAudioMuted,
                    videoOff: off
                });
            }
        }
    }, [isAudioMuted, sessionId]);

    // ── Trainer: Initiate Call ────────────────────────────────────────────────

    const initiateCall = useCallback(async () => {
        setCallStatus(CALL_STATUS.CONNECTING);
        try {
            const socket = await getSocket();
            socketRef.current = socket;

            await socket.emitWithAck('join_session', { session_id: sessionId });

            const generatedPeerId = await initializePeer();
            await startLocalStream();

            setCallStatus(CALL_STATUS.CALLING);
            socket.emit('initiate_call', {
                session_id: sessionId,
                peerId: generatedPeerId,
                callerName: userName
            });
        } catch (err) {
            console.error('[useMentorshipCall] initiateCall failed:', err);
            cleanupCall();
        }
    }, [sessionId, userName, initializePeer, startLocalStream, cleanupCall]);

    // ── Student: Accept Call ──────────────────────────────────────────────────

    const acceptCall = useCallback(async () => {
        if (!incomingCallData) return;
        setCallStatus(CALL_STATUS.CONNECTING);
        try {
            await startLocalStream();
            const generatedPeerId = await initializePeer();

            socketRef.current.emit('accept_call', {
                session_id: sessionId,
                peerId: generatedPeerId,
            });
            // PeerJS call will arrive via peer.on('call') above
        } catch (err) {
            console.error('[useMentorshipCall] acceptCall failed:', err);
            cleanupCall();
        }
    }, [incomingCallData, sessionId, startLocalStream, initializePeer, cleanupCall]);

    // ── Student: Decline Call ─────────────────────────────────────────────────

    const declineCall = useCallback(() => {
        setIncomingCallData(null);
        setCallStatus(CALL_STATUS.IDLE);
    }, []);

    // ── End Call (both sides) ─────────────────────────────────────────────────

    const endCall = useCallback(() => {
        if (socketRef.current && sessionId) {
            socketRef.current.emit('end_call', { session_id: sessionId });
        }
        cleanupCall();
    }, [sessionId, cleanupCall]);

    // ── Socket.IO Listener Setup ──────────────────────────────────────────────

    useEffect(() => {
        if (!sessionId) return;

        let isMounted = true;

        const setupListeners = async () => {
            const socket = await getSocket();
            socketRef.current = socket;

            // Join session room for signaling
            socket.emit('join_session', { session_id: sessionId });

            // Student receives incoming call notification from trainer
            socket.on('incoming-call', (data) => {
                if (!isMounted) return;
                console.log('[Socket] incoming-call', data);
                setIncomingCallData({ peerId: data.peerId, callerName: data.callerName });
                setCallStatus(CALL_STATUS.RINGING);
            });

            // Trainer receives student's peerId and initiates P2P call
            socket.on('call-accepted', (data) => {
                if (!isMounted) return;
                console.log('[Socket] call-accepted, dialing student peerId:', data.peerId);
                setCallStatus(CALL_STATUS.CONNECTING);

                const peer = peerRef.current;
                if (!peer || !localStreamRef.current) return;

                const outgoingCall = peer.call(data.peerId, localStreamRef.current);
                activeCallRef.current = outgoingCall;

                outgoingCall.on('stream', (remoteStr) => {
                    if (!isMounted) return;
                    console.log('[PeerJS] Got remote stream from student');
                    setRemoteStream(remoteStr);
                    setCallStatus(CALL_STATUS.ACTIVE);
                });

                outgoingCall.on('close', () => {
                    if (isMounted) cleanupCall();
                });
            });

            socket.on('partner-disconnected', () => {
                if (!isMounted) return;
                console.log('[Socket] partner disconnected');
                cleanupCall();
            });

            socket.on('call-ended', () => {
                if (!isMounted) return;
                console.log('[Socket] call ended by partner');
                cleanupCall();
            });

            socket.on('signal-media-state', (data) => {
                if (!isMounted) return;
                setMediaStatePartner({
                    audioMuted: data.audioMuted,
                    videoOff: data.videoOff,
                });
            });
        };

        setupListeners();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                socketRef.current.off('incoming-call');
                socketRef.current.off('call-accepted');
                socketRef.current.off('partner-disconnected');
                socketRef.current.off('call-ended');
                socketRef.current.off('signal-media-state');
            }
        };
    }, [sessionId, cleanupCall]);

    return {
        // State
        callStatus,
        CALL_STATUS,
        localStream,
        remoteStream,
        peerId,
        incomingCallData,
        isAudioMuted,
        isVideoOff,
        isScreenSharing,
        mediaStatePartner,

        // Actions
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
    };
};
