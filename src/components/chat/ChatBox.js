import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import * as S from './ChatBox.styles';

const ChatBox = ({ sessionId, userToken, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!sessionId || !userToken) return;

        // WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const socket = new WebSocket(`${protocol}//localhost:8000/ws/chat/${sessionId}?token=${userToken}`);

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => {
                // Prevent duplicate messages if needed (backend sends history then live)
                // Since history is sent first and socket is live after, it should be fine.
                return [...prev, data];
            });
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        socket.onerror = (err) => {
            console.error('WebSocket Error:', err);
        };

        setWs(socket);

        return () => {
            if (socket) socket.close();
        };
    }, [sessionId, userToken]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (!inputValue.trim() && images.length === 0) return;

        const payload = {
            message: inputValue,
            image_urls: images
        };

        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(payload));
            setInputValue('');
            setImages([]);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get signed signature from backend
            const authHeader = { Authorization: `Bearer ${userToken}` };
            const sigResponse = await axios.post(
                `http://localhost:8000/assets/generate-signature?folder=js-mentor/sessions/${sessionId}`,
                {},
                { headers: authHeader }
            );

            const { signature, timestamp, cloud_name, api_key, folder } = sigResponse.data;

            // 2. Upload to Cloudinary using the signature
            const formData = new FormData();
            formData.append('file', file);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('api_key', api_key);
            formData.append('folder', folder);

            const uploadResponse = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
                formData
            );

            setImages((prev) => [...prev, uploadResponse.data.secure_url]);
        } catch (err) {
            console.error('Image upload failed:', err);
            alert('Failed to upload image. Please ensure your session is active and try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Normalize role for comparison (Backend uses 'STUDENT'/'TRAINER')
    const normalizedUserRole = userRole?.toUpperCase();

    return (
        <S.ChatContainer>
            <S.MessageList>
                {messages.length === 0 && (
                    <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="body2">No messages yet. Start the conversation!</Typography>
                    </Box>
                )}
                {messages.map((msg, index) => {
                    const isMe = msg.sender_role === normalizedUserRole;
                    return (
                        <S.MessageBubble key={index} isMe={isMe}>
                            <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700, opacity: 0.8 }}>
                                {msg.sender_role}
                            </Typography>
                            {msg.message && <Typography variant="body2">{msg.message}</Typography>}
                            {msg.image_urls && msg.image_urls.map((url, i) => (
                                <Box key={i} mt={1} sx={{ cursor: 'pointer' }} onClick={() => window.open(url, '_blank')}>
                                    <img src={url} alt="upload" style={{ maxWidth: '100%', borderRadius: '8px', display: 'block' }} />
                                </Box>
                            ))}
                            <S.Timestamp variant="caption">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </S.Timestamp>
                        </S.MessageBubble>
                    );
                })}
                <div ref={messagesEndRef} />
            </S.MessageList>

            {images.length > 0 && (
                <S.ImagePreviewContainer>
                    {images.map((url, index) => (
                        <Box key={index} position="relative" sx={{ flexShrink: 0 }}>
                            <S.ImageThumbnail src={url} />
                            <IconButton 
                                size="small" 
                                onClick={() => removeImage(index)}
                                sx={{ 
                                    position: 'absolute', top: -8, right: -8, 
                                    bgcolor: '#ffffff', boxShadow: 1,
                                    '&:hover': { bgcolor: '#f1f5f9' },
                                    width: 20, height: 20
                                }}
                            >
                                <CloseIcon sx={{ fontSize: 14 }} />
                            </IconButton>
                        </Box>
                    ))}
                </S.ImagePreviewContainer>
            )}

            <S.InputArea>
                <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="chat-image-upload"
                    type="file"
                    onChange={handleImageUpload}
                />
                <label htmlFor="chat-image-upload">
                    <Tooltip title="Upload Image">
                        <IconButton component="span" disabled={isUploading} size="small">
                            {isUploading ? <CircularProgress size={20} /> : <ImageIcon fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </label>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: '#f1f5f9' } }}
                />
                <IconButton color="primary" onClick={handleSendMessage} disabled={!inputValue.trim() && images.length === 0} size="small">
                    <SendIcon fontSize="small" />
                </IconButton>
            </S.InputArea>
        </S.ChatContainer>
    );
};

export default ChatBox;
