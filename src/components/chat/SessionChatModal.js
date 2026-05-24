import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatBox from './ChatBox';

const SessionChatModal = ({ open, onClose, session }) => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const fetchToken = async () => {
            if (window.Clerk?.session) {
                const t = await window.Clerk.session.getToken();
                setToken(t);
            }
        };
        if (open) fetchToken();
    }, [open]);

    if (!session) return null;

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            fullWidth 
            maxWidth="md"
            PaperProps={{ sx: { height: '80vh', borderRadius: '16px' } }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Chat with Mentor</Typography>
                    <Typography variant="caption" color="text.secondary">Topic: {session.topic} • Mentor: {session.mentor}</Typography>
                </Box>
                <IconButton onClick={onClose}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {token ? (
                    <ChatBox 
                        sessionId={session.sessionId} 
                        userToken={token} 
                        userRole="STUDENT" 
                    />
                ) : (
                    <Box sx={{ m: 'auto', textAlign: 'center' }}>
                        <Typography>Authenticating chat session...</Typography>
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default SessionChatModal;
