import { useState, useEffect, useRef, useCallback } from 'react';
import Peer from 'peerjs';
import { getSocket } from '../services/signalingService';

export const CLASS_STATUS = {
    IDLE: 'IDLE',
    CONNECTING: 'CONNECTING',
    ACTIVE: 'ACTIVE',
    ENDED: 'ENDED'
};

export const useGroupClass = (classId, userRole, userName, studentId = null) => {
    const [classStatus, setClassStatus] = useState(CLASS_STATUS.IDLE);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null); // Students: Trainer's stream
    const [peerId, setPeerId] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [raisedHands, setRaisedHands] = useState([]); // List of { student_id, student_name }
    const [isAudioMuted, setIsAudioMuted] = useState(true); // Default muted
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isVoiceGranted, setIsVoiceGranted] = useState(false); // Student voice state
    const [reactions, setReactions] = useState([]);
    const [transcripts, setTranscripts] = useState([]);
    const [summaryId, setSummaryId] = useState(null);
    const [activeSpeakers, setActiveSpeakers] = useState([]); // List of unmuted student IDs

    const recognitionRef = useRef(null);



    const socketRef = useRef(null);
    const peerRef = useRef(null);
    const trainerCallRef = useRef(null); // Student's call to trainer
    const studentMicCallRef = useRef(null); // Student's mic call to trainer
    
    // Trainer Web Audio Mixer refs
    const audioContextRef = useRef(null);
    const audioDestinationRef = useRef(null);
    const trainerMicSourceRef = useRef(null);
    const activeStudentSourcesRef = useRef({}); // student_id -> audioSourceNode

    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const activeCallsRef = useRef([]); // Trainer: all connected student MediaConnections

    // Clean up streams helper
    const stopStreamTracks = useCallback((stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    // Cleanup classroom
    const cleanupClassroom = useCallback(() => {
        if (trainerCallRef.current) {
            trainerCallRef.current.close();
            trainerCallRef.current = null;
        }
        if (studentMicCallRef.current) {
            studentMicCallRef.current.close();
            studentMicCallRef.current = null;
        }
        activeCallsRef.current.forEach(call => call.close());
        activeCallsRef.current = [];

        stopStreamTracks(localStreamRef.current);
        stopStreamTracks(screenStreamRef.current);
        localStreamRef.current = null;
        screenStreamRef.current = null;

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }
        audioContextRef.current = null;
        audioDestinationRef.current = null;
        trainerMicSourceRef.current = null;
        activeStudentSourcesRef.current = {};

        setLocalStream(null);
        setRemoteStream(null);
        setIsScreenSharing(false);
        setIsAudioMuted(true);
        setIsVoiceGranted(false);
        setActiveSpeakers([]);
        setClassStatus(CLASS_STATUS.IDLE);
    }, [stopStreamTracks]);

    // Speech Recognition manager
    const startSpeechRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('[SpeechRecognition] Browser does not support speech recognition.');
            return;
        }

        if (recognitionRef.current) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const resultIndex = event.resultIndex;
            const transcript = event.results[resultIndex][0].transcript;
            const isFinal = event.results[resultIndex].isFinal;

            if (isFinal && transcript.trim() && socketRef.current) {
                socketRef.current.emit('live_transcript', {
                    class_id: classId,
                    speaker: userName,
                    role: userRole,
                    text: transcript.trim()
                });
            }
        };

        recognition.onend = () => {
            if (recognitionRef.current && classStatus === CLASS_STATUS.ACTIVE) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    console.error('[SpeechRecognition] Failed to restart:', e);
                }
            }
        };

        recognitionRef.current = recognition;
        try {
            recognition.start();
            console.log('[SpeechRecognition] Capturing active.');
        } catch (err) {
            console.error('[SpeechRecognition] Start failed:', err);
        }
    }, [classId, userName, userRole, classStatus]);

    const stopSpeechRecognition = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onend = null;
            try {
                recognitionRef.current.stop();
            } catch (err) {
                console.warn('[SpeechRecognition] Stop failed:', err);
            }
            recognitionRef.current = null;
            console.log('[SpeechRecognition] Capturing inactive.');
        }
    }, []);

    // Effect to auto-manage SpeechCapturing
    useEffect(() => {
        const shouldRecognize = classStatus === CLASS_STATUS.ACTIVE && 
                                !isAudioMuted && 
                                (userRole === 'TRAINER' || isVoiceGranted);

        if (shouldRecognize) {
            startSpeechRecognition();
        } else {
            stopSpeechRecognition();
        }

        return () => {
            stopSpeechRecognition();
        };
    }, [classStatus, isAudioMuted, userRole, isVoiceGranted, startSpeechRecognition, stopSpeechRecognition]);


    // Initialize PeerJS client
    const initializePeer = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (peerRef.current && !peerRef.current.destroyed) {
                resolve(peerRef.current.id);
                return;
            }

            const peer = new Peer({
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' },
                    ]
                }
            });

            peer.on('open', (id) => {
                console.log('[PeerJS Classroom] Got Peer ID:', id);
                setPeerId(id);
                peerRef.current = peer;
                resolve(id);
            });

            peer.on('error', (err) => {
                console.error('[PeerJS Classroom] Error:', err);
                reject(err);
            });

            // Trainer: answer incoming student requests
            peer.on('call', (incomingCall) => {
                console.log('[PeerJS Classroom] Incoming call from:', incomingCall.peer);
                
                // Check if this is a student sending their unmuted audio stream
                const isStudentAudioOnly = incomingCall.metadata && incomingCall.metadata.type === 'audio-only';
                
                if (isStudentAudioOnly && userRole === 'TRAINER') {
                    // Answer student audio call with null
                    incomingCall.answer(null);
                    incomingCall.on('stream', (studentAudioStream) => {
                        const studentId = incomingCall.metadata.studentId;
                        console.log(`[Audio Mixer] Received audio stream from student ${studentId}`);
                        
                        // Add to Web Audio mixing node
                        if (audioContextRef.current && audioDestinationRef.current) {
                            try {
                                // Resume context if suspended (browser safety)
                                if (audioContextRef.current.state === 'suspended') {
                                    audioContextRef.current.resume();
                                }
                                const sourceNode = audioContextRef.current.createMediaStreamSource(studentAudioStream);
                                sourceNode.connect(audioDestinationRef.current);
                                activeStudentSourcesRef.current[studentId] = sourceNode;
                                setActiveSpeakers(prev => [...new Set([...prev, studentId])]);
                            } catch (mixErr) {
                                console.error('Failed to mix student audio source:', mixErr);
                            }
                        }
                    });
                } else {
                    // This is a student calling to consume the trainer's screen + mixed audio stream
                    // Construct mixed stream (Screen Share + Mixed Web Audio Destination Track)
                    const screenTrack = screenStreamRef.current ? screenStreamRef.current.getVideoTracks()[0] : null;
                    const mixedAudioTrack = audioDestinationRef.current ? audioDestinationRef.current.stream.getAudioTracks()[0] : null;
                    
                    const tracks = [];
                    if (screenTrack) tracks.push(screenTrack);
                    if (mixedAudioTrack) tracks.push(mixedAudioTrack);

                    const mixedStream = new MediaStream(tracks);
                    incomingCall.answer(mixedStream);
                    activeCallsRef.current.push(incomingCall);
                }
            });
        });
    }, [userRole]);

    // Trainer actions: start class
    const startClass = useCallback(async () => {
        setClassStatus(CLASS_STATUS.CONNECTING);
        try {
            // 1. Get media streams (Trainer screen share + mic audio)
            const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 15 } });
            screenStreamRef.current = screen;
            setIsScreenSharing(true);

            let micStream;
            try {
                micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            } catch (micErr) {
                console.warn('Microphone denied or not found. Starting with screen share only.', micErr);
            }

            // 2. Setup Web Audio mixing context
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            
            const mixedDest = audioCtx.createMediaStreamDestination();
            audioDestinationRef.current = mixedDest;

            // Connect trainer's own mic if available
            if (micStream) {
                localStreamRef.current = micStream;
                setLocalStream(micStream);
                setIsAudioMuted(false);
                
                const micSource = audioCtx.createMediaStreamSource(micStream);
                micSource.connect(mixedDest);
                trainerMicSourceRef.current = micSource;
            }

            // 3. Initialize PeerJS and signal readiness
            const trainerPeerId = await initializePeer();
            
            const socket = await getSocket();
            socketRef.current = socket;
            
            await socket.emitWithAck('join_group_class', { class_id: classId });
            socket.emit('register_trainer_peer', { class_id: classId, peerId: trainerPeerId });
            
            setClassStatus(CLASS_STATUS.ACTIVE);
            console.log('[Classroom] Trainer started class successfully.');
        } catch (err) {
            console.error('Failed to start group class:', err);
            cleanupClassroom();
        }
    }, [classId, initializePeer, cleanupClassroom]);

    // Student action: Join and pull trainer's broadcast
    const joinClass = useCallback(async (trainerPeerId) => {
        setClassStatus(CLASS_STATUS.CONNECTING);
        try {
            const socket = await getSocket();
            socketRef.current = socket;
            
            await socket.emitWithAck('join_group_class', { class_id: classId });
            
            await initializePeer();
            const peer = peerRef.current;
            if (!peer) return;

            // Call Trainer with no outbound stream (student is muted by default)
            console.log('[Student] Dialing trainer peer:', trainerPeerId);
            const call = peer.call(trainerPeerId, null);
            trainerCallRef.current = call;

            call.on('stream', (trainerMixedStream) => {
                console.log('[Student] Received mixed stream from trainer');
                setRemoteStream(trainerMixedStream);
                setClassStatus(CLASS_STATUS.ACTIVE);
            });

            call.on('close', () => {
                console.log('[Student] Trainer call connection closed.');
                cleanupClassroom();
            });
        } catch (err) {
            console.error('Student failed to join group class:', err);
            cleanupClassroom();
        }
    }, [classId, initializePeer, cleanupClassroom]);

    // Student: toggle hand raise state
    const toggleRaiseHand = useCallback(() => {
        if (!socketRef.current) return;
        
        const isHandRaised = raisedHands.some(h => h.student_id === studentId);
        if (isHandRaised) {
            socketRef.current.emit('lower_hand', { class_id: classId, student_id: studentId });
            setRaisedHands(prev => prev.filter(h => h.student_id !== studentId));
        } else {
            socketRef.current.emit('raise_hand', { class_id: classId, student_id: studentId, student_name: userName });
            setRaisedHands(prev => [...prev, { student_id: studentId, student_name: userName }]);
        }
    }, [classId, studentId, userName, raisedHands]);

    // Student: establish outbound audio connection when unmuted by trainer
    const startStudentMicConnection = useCallback(async (trainerPeerId) => {
        try {
            const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            localStreamRef.current = micStream;
            setLocalStream(micStream);
            setIsAudioMuted(false);

            const peer = peerRef.current;
            if (!peer) return;

            console.log('[Student] Sending audio stream back to trainer...');
            const micCall = peer.call(trainerPeerId, micStream, {
                metadata: { type: 'audio-only', studentId: studentId }
            });
            studentMicCallRef.current = micCall;
        } catch (err) {
            console.error('Failed to access microphone for unmuting:', err);
        }
    }, [studentId]);

    // Student: stop outbound audio when muted by trainer
    const stopStudentMicConnection = useCallback(() => {
        if (studentMicCallRef.current) {
            studentMicCallRef.current.close();
            studentMicCallRef.current = null;
        }
        stopStreamTracks(localStreamRef.current);
        localStreamRef.current = null;
        setLocalStream(null);
        setIsAudioMuted(true);
    }, [stopStreamTracks]);

    // Send chat message
    const sendChatMessage = useCallback((text) => {
        if (socketRef.current && text.trim()) {
            socketRef.current.emit('send_group_chat', {
                class_id: classId,
                sender: userName,
                text: text
            });
        }
    }, [classId, userName]);

    // Send Emoji Reaction
    const sendEmojiReaction = useCallback((emoji) => {
        if (socketRef.current) {
            socketRef.current.emit('send_reaction', {
                class_id: classId,
                emoji: emoji
            });
            // Show locally instantly
            const id = Date.now() + Math.random();
            setReactions(prev => [...prev, { id, emoji }]);
            setTimeout(() => {
                setReactions(prev => prev.filter(r => r.id !== id));
            }, 2500);
        }
    }, [classId]);

    // Trainer moderation controls
    const grantVoicePrivilege = useCallback((targetStudentId, targetStudentPeerId) => {
        if (socketRef.current && userRole === 'TRAINER') {
            socketRef.current.emit('grant_voice', {
                class_id: classId,
                student_id: targetStudentId,
                student_peer_id: targetStudentPeerId
            });
        }
    }, [classId, userRole]);

    const revokeVoicePrivilege = useCallback((targetStudentId) => {
        if (socketRef.current && userRole === 'TRAINER') {
            socketRef.current.emit('revoke_voice', {
                class_id: classId,
                student_id: targetStudentId
            });
            
            // Clean up node in AudioContext mixer
            const node = activeStudentSourcesRef.current[targetStudentId];
            if (node) {
                node.disconnect();
                delete activeStudentSourcesRef.current[targetStudentId];
                setActiveSpeakers(prev => prev.filter(id => id !== targetStudentId && id !== String(targetStudentId)));
            }
        }
    }, [classId, userRole]);

    // Mute own microphone
    const toggleLocalAudio = useCallback(() => {
        const stream = localStreamRef.current;
        if (!stream) return;
        const track = stream.getAudioTracks()[0];
        if (track) {
            track.enabled = !track.enabled;
            setIsAudioMuted(!track.enabled);
        }
    }, []);

    // Trainer: leave/end class
    const leaveClass = useCallback(() => {
        if (socketRef.current && userRole === 'TRAINER') {
            socketRef.current.emit('end_group_class', { class_id: classId });
        }
        cleanupClassroom();
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
    }, [classId, userRole, cleanupClassroom]);


    // Handle WebSocket event listening
    useEffect(() => {
        if (!classId) return;
        let isMounted = true;

        const setupSocket = async () => {
            const socket = await getSocket();
            socketRef.current = socket;

            // Signal handler for trainer peer readiness
            socket.on('trainer-peer-ready', (data) => {
                if (!isMounted || userRole !== 'STUDENT') return;
                console.log('[Socket] Trainer is ready with Peer ID:', data.peerId);
                joinClass(data.peerId);
            });

            // Hand raises
            socket.on('student-raised-hand', (data) => {
                if (!isMounted) return;
                setRaisedHands(prev => {
                    if (prev.some(h => h.student_id === data.student_id)) return prev;
                    return [...prev, { student_id: data.student_id, student_name: data.student_name }];
                });
            });

            socket.on('student-lowered-hand', (data) => {
                if (!isMounted) return;
                setRaisedHands(prev => prev.filter(h => h.student_id !== data.student_id));
            });

            // Classroom Voice privileges (student side)
            socket.on('voice-granted', (data) => {
                if (!isMounted) return;
                if (userRole === 'STUDENT' && studentId === data.student_id) {
                    setIsVoiceGranted(true);
                    // Automatically stream microphone audio to the trainer
                    startStudentMicConnection(data.student_peer_id);
                }
            });

            socket.on('voice-revoked', (data) => {
                if (!isMounted) return;
                if (userRole === 'STUDENT' && studentId === data.student_id) {
                    setIsVoiceGranted(false);
                    stopStudentMicConnection();
                }
            });

            // Live Group Chat messages
            socket.on('group-chat-message', (msg) => {
                if (!isMounted) return;
                setChatMessages(prev => [...prev, msg]);
            });

            // Floating Emoji Reactions
            socket.on('incoming-reaction', (data) => {
                if (!isMounted) return;
                const id = Date.now() + Math.random();
                setReactions(prev => [...prev, { id, emoji: data.emoji }]);
                setTimeout(() => {
                    setReactions(prev => prev.filter(r => r.id !== id));
                }, 2500);
            });

            // Live Group Class transcripts
            socket.on('live-transcript-received', (data) => {
                if (!isMounted) return;
                setTranscripts(prev => [...prev, data]);
            });

            // Group class completed
            socket.on('group-class-ended', (data) => {
                if (!isMounted) return;
                console.log('[Socket] Group class ended by trainer.');
                setClassStatus(CLASS_STATUS.ENDED);
                cleanupClassroom();
            });

            // Class summary generated
            socket.on('class_summary_ready', (data) => {
                if (!isMounted) return;
                console.log('[Socket] AI Summary ready:', data.summary_id);
                setSummaryId(data.summary_id);
            });
        };



        setupSocket();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                socketRef.current.off('trainer-peer-ready');
                socketRef.current.off('student-raised-hand');
                socketRef.current.off('student-lowered-hand');
                socketRef.current.off('voice-granted');
                socketRef.current.off('voice-revoked');
                socketRef.current.off('group-chat-message');
                socketRef.current.off('incoming-reaction');
            }
        };
    }, [classId, userRole, studentId, joinClass, startStudentMicConnection, stopStudentMicConnection, cleanupClassroom]);

    return {
        classStatus,
        localStream,
        remoteStream,
        peerId,
        activeSpeakers,
        chatMessages,
        raisedHands,
        isAudioMuted,
        isScreenSharing,
        isVoiceGranted,
        reactions,
        transcripts,
        summaryId,

        startClass,

        leaveClass,
        sendChatMessage,
        toggleRaiseHand,
        toggleLocalAudio,
        grantVoicePrivilege,
        revokeVoicePrivilege,
        sendEmojiReaction
    };

};
