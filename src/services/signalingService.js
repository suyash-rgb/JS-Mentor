import { io } from 'socket.io-client';

const SIGNALING_URL = 'http://localhost:8000';

let socket = null;

/**
 * Returns the singleton Socket.IO instance. Creates it on first call.
 * Auth token is extracted from Clerk on initialization.
 */
export const getSocket = async () => {
    if (socket && socket.connected) return socket;

    // Get Clerk token
    let token = null;
    try {
        if (window.Clerk?.session) {
            token = await window.Clerk.session.getToken();
        }
    } catch (e) {
        // Fall back to localStorage trainer token
        token = localStorage.getItem('token');
    }
    if (!token) {
        token = localStorage.getItem('token');
    }

    socket = io(SIGNALING_URL, {
        path: '/ws/socket.io',
        auth: { token },
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[SignalingService] Socket.IO connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
        console.error('[SignalingService] Connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
        console.warn('[SignalingService] Disconnected:', reason);
    });

    return socket;
};

/**
 * Disconnects and destroys the singleton instance.
 * Should be called when the user logs out or navigates away from a call.
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log('[SignalingService] Socket.IO disconnected and destroyed.');
    }
};
