import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, TextField, IconButton, Tooltip, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import * as S from './ChatBox.styles';

const ChatBox = ({ sessionId, userToken, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isResolved, setIsResolved] = useState(false);
    const [ws, setWs] = useState(null);
    const messagesEndRef = useRef(null);

    const handleFileUpload = useCallback(async (file) => {
        if (!file) return;

        setIsUploading(true);
        try {
            // 1. Get signed signature from backend
            const authHeader = { Authorization: `Bearer ${userToken}` };
            const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
            const sigResponse = await axios.post(
                `${API_BASE_URL}/api/v1/assets/generate-signature`,
                { folder: `js-mentor/sessions/${sessionId}` },
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
    }, [sessionId, userToken]);

    const onDrop = useCallback(async (acceptedFiles) => {
        if (isResolved || isUploading) return;

        for (const file of acceptedFiles) {
            await handleFileUpload(file);
        }
    }, [isResolved, isUploading, handleFileUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        disabled: isResolved,
        noClick: true,
    });

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };

    useEffect(() => {
        if (!sessionId || !userToken) return;

        let API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        if (!API_BASE_URL.startsWith('http')) {
            API_BASE_URL = `http://${API_BASE_URL}`;
        }
        const wsProtocol = API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
        const host = API_BASE_URL.replace(/^https?:\/\//, '');

        const socket = new WebSocket(`${wsProtocol}//${host}/ws/chat/${sessionId}?token=${userToken}`);


        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            // Check for system signals
            if (data.type === 'SESSION_RESOLVED') {
                setIsResolved(true);
            }

            setMessages((prev) => {
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
        if (isResolved) return;
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

    const handleImageUpload = (e) => {
        handleFileUpload(e.target.files[0]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // Normalize role for comparison (Backend uses 'STUDENT'/'TRAINER')
    const normalizedUserRole = userRole?.toUpperCase();

    return (
        <S.DropzoneContainer {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive && (
                <S.ActiveOverlay>
                    <Box textAlign="center">
                        <CloudUploadIcon sx={{ fontSize: 48, color: '#3b82f6', mb: 1 }} />
                        <Typography variant="h6" color="primary">Drop images to upload</Typography>
                    </Box>
                </S.ActiveOverlay>
            )}
            <S.ChatContainer>
                <S.MessageList>
                    {isResolved && (
                        <Box sx={{ bgcolor: '#fff4e5', p: 1.5, mb: 2, borderRadius: '8px', border: '1px solid #ffe2b7', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#663c00', fontWeight: 600 }}>
                                This session has been resolved and is now read-only.
                            </Typography>
                        </Box>
                    )}
                    {messages.length === 0 && !isResolved && (
                        <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.5 }}>
                            <Typography variant="body2">No messages yet. Start the conversation!</Typography>
                        </Box>
                    )}
                    {messages.map((msg, index) => {
                        const isMe = msg.sender_role === normalizedUserRole;
                        return (
                            <S.MessageBubble key={index} isMe={isMe}>
                                <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontWeight: 700, opacity: 0.8 }}>
                                    {msg.sender_role === 'SYSTEM' ? '🔔 SYSTEM' : msg.sender_role}
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

                {images.length > 0 && !isResolved && (
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

                <S.InputArea sx={{ opacity: isResolved ? 0.6 : 1 }}>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="chat-image-upload"
                        type="file"
                        onChange={handleImageUpload}
                        disabled={isResolved || isUploading}
                    />
                    <label htmlFor="chat-image-upload">
                        <Tooltip title={isResolved ? "Session Resolved" : "Upload Image"}>
                            <IconButton component="span" disabled={isResolved || isUploading} size="small">
                                {isUploading ? <CircularProgress size={20} /> : <ImageIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>
                    </label>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder={isResolved ? "Session Resolved (Read-only)" : "Type a message..."}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={isResolved}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '24px', bgcolor: isResolved ? '#e2e8f0' : '#f1f5f9' } }}
                    />
                    <IconButton
                        color="primary"
                        onClick={handleSendMessage}
                        disabled={isResolved || (!inputValue.trim() && images.length === 0)}
                        size="small"
                    >
                        <SendIcon fontSize="small" />
                    </IconButton>
                </S.InputArea>
            </S.ChatContainer>
        </S.DropzoneContainer>
    );
};

export default ChatBox;
