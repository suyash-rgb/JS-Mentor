import { useEffect, useState } from 'react';
import { getSocket } from '../services/signalingService';

export const useGlobalNotifications = () => {
    // We need to handle Clerk's async load — it may not be ready on first render.
    // Poll for sign-in state every 500ms for up to 10 seconds so we don't miss
    // the window where Clerk finishes loading.
    const [isSignedIn, setIsSignedIn] = useState(
        !!(window.Clerk?.session || localStorage.getItem('token'))
    );

    useEffect(() => {
        // If already signed in, no need to poll
        if (isSignedIn) return;

        let attempts = 0;
        const maxAttempts = 20; // 20 × 500ms = 10 seconds
        const timer = setInterval(() => {
            attempts++;
            const signedIn = !!(window.Clerk?.session || localStorage.getItem('token'));
            if (signedIn) {
                setIsSignedIn(true);
                clearInterval(timer);
            } else if (attempts >= maxAttempts) {
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);
    }, [isSignedIn]);

    useEffect(() => {
        if (!isSignedIn) return;

        let socket;
        let isMounted = true;

        const initSocket = async () => {
            try {
                socket = await getSocket();
                if (!isMounted || !socket) return;

                console.log('[GlobalNotifications] Socket connected, listening for global-incoming-session');

                // Listen for global session notifications (trainer → student or student → trainer)
                socket.on('global-incoming-session', (data) => {
                    // ── FIX: Read role FRESH inside the callback, not from a stale closure.
                    // The value captured at hook render time may be wrong if localStorage
                    // was set after the initial render (e.g. Clerk/auth finishes async).
                    const isTrainerNow = localStorage.getItem('role') === 'trainer';

                    console.log(
                        `[GlobalNotifications] Incoming event:`,
                        data,
                        `| role=${isTrainerNow ? 'trainer' : 'student'}`
                    );

                    if (isTrainerNow) {
                        // Trainer receiving a student's message — notify the trainer dashboard
                        window.dispatchEvent(new CustomEvent('trainer-incoming-message', {
                            detail: data
                        }));
                    } else {
                        // Student receiving a trainer's message/call — open the Chatbot UI
                        window.dispatchEvent(new CustomEvent('open-mentorship-chat', {
                            detail: data
                        }));
                    }
                });
            } catch (err) {
                console.warn('[GlobalNotifications] Failed to initialize socket:', err);
            }
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socket) {
                socket.off('global-incoming-session');
            }
        };
    // Only re-run when sign-in state changes. Role is read fresh inside the
    // callback so it does NOT need to be a dependency.
    }, [isSignedIn]);
};
