import { io } from 'socket.io-client';

let SIGNALING_URL = process.env.REACT_APP_API_BASE_URL;
if (SIGNALING_URL && !SIGNALING_URL.startsWith('http')) {
    SIGNALING_URL = `http://${SIGNALING_URL}`;
}




let socket = null;
let connectingPromise = null;

/**
 * Returns the singleton Socket.IO instance. Creates it on first call.
 * Auth token is extracted from Clerk on initialization.
 * Uses a pending promise to prevent race conditions when multiple
 * callers invoke getSocket() simultaneously during initial connection.
 */
export const getSocket = async () => {
    if (socket && socket.connected) return socket;

    // If a connection attempt is already in progress, wait for it
    if (connectingPromise) return connectingPromise;

    connectingPromise = (async () => {
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

        // Wait for actual connection before returning
        await new Promise((resolve, reject) => {
            if (socket.connected) {
                resolve();
                return;
            }
            socket.once('connect', resolve);
            socket.once('connect_error', (err) => {
                console.error('[SignalingService] Initial connection failed:', err.message);
                resolve(); // Resolve anyway — caller can check socket.connected
            });
        });

        connectingPromise = null;
        return socket;
    })();

    return connectingPromise;
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
