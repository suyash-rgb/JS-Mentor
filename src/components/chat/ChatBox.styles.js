import { styled, Box, Paper, Typography } from '@mui/material';

export const ChatContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  backgroundColor: '#ffffff',
});

export const MessageList = styled(Box)({
  flexGrow: 1,
  padding: '16px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  backgroundColor: '#f8fafc',
});

export const MessageBubble = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isMe',
})(({ theme, isMe }) => ({
  padding: '10px 16px',
  maxWidth: '75%',
  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
  backgroundColor: isMe ? theme.palette.primary.main : '#ffffff',
  color: isMe ? '#ffffff' : '#1e293b',
  alignSelf: isMe ? 'flex-end' : 'flex-start',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  position: 'relative',
}));

export const Timestamp = styled(Typography)({
  fontSize: '0.7rem',
  marginTop: '4px',
  opacity: 0.7,
  textAlign: 'right',
});

export const InputArea = styled(Box)({
  padding: '16px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  backgroundColor: '#ffffff',
});

export const ImagePreviewContainer = styled(Box)({
  display: 'flex',
  gap: '8px',
  padding: '8px 16px',
  borderTop: '1px solid #e2e8f0',
  overflowX: 'auto',
});

export const ImageThumbnail = styled('img')({
  width: '60px',
  height: '60px',
  borderRadius: '8px',
  objectFit: 'cover',
  border: '1px solid #e2e8f0',
});
