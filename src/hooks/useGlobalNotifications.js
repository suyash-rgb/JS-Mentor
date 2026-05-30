import { useEffect } from 'react';
import { getSocket } from '../services/signalingService';

export const useGlobalNotifications = () => {
    // Determine if the user is authenticated (either Student or Trainer)
    const isSignedIn = !!(window.Clerk?.session || localStorage.getItem('token'));
    const isTrainer = localStorage.getItem('role') === 'trainer';

    useEffect(() => {
        if (!isSignedIn) return;

        let socket;
        let isMounted = true;

        const initSocket = async () => {
            try {
                socket = await getSocket();
                if (!isMounted || !socket) return;

                // Listen for global session notifications (e.g., from trainer to student or student to trainer)
                socket.on('global-incoming-session', (data) => {
                    const { sessionId, topic, mentor, type } = data;
                    console.log(`[Global Notifications] Incoming ${type} from ${mentor} for session ${sessionId}`);

                    if (isTrainer) {
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
                console.warn('[Global Notifications] Failed to initialize socket:', err);
            }
        };

        initSocket();

        return () => {
            isMounted = false;
            if (socket) {
                socket.off('global-incoming-session');
            }
        };
    }, [isSignedIn, isTrainer]);
};
