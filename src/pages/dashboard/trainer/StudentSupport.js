import React, { useState } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  Divider, TextField, Button, Avatar, Badge, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

const StudentSupport = () => {
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [reply, setReply] = useState('');

  const doubts = [
    { id: 1, student: 'Alice Johnson', topic: 'Async/Await', content: "I don't understand how 'await' blocks execution within a function.", time: '10:15 AM', status: 'Unread' },
    { id: 2, student: 'Bob Smith', topic: 'Array Methods', content: "What's the difference between map() and forEach()?", time: 'Yesterday', status: 'Read' },
    { id: 3, student: 'Charlie Davis', topic: 'Closures', content: "Can you provide a practical example of a closure?", time: '2 days ago', status: 'Read' },
  ];

  const handleReply = () => {
    // Mock reply logic
    setReply('');
    setActiveDoubt(null);
  };

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Student Doubts</Typography>

      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, minHeight: '500px' }}>
        {/* Doubts List */}
        <Paper elevation={0} sx={{
          width: '350px',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.1)',
          overflow: 'hidden',
          bgcolor: 'white'
        }}>
          <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle1" fontWeight="bold">New Sessions</Typography>
          </Box>
          <List sx={{ p: 0 }}>
            {doubts.map((doubt) => (
              <React.Fragment key={doubt.id}>
                <ListItem
                  button
                  selected={activeDoubt?.id === doubt.id}
                  onClick={() => setActiveDoubt(doubt)}
                  sx={{
                    py: 2,
                    '&.Mui-selected': { bgcolor: '#ebf8ff', borderLeft: '4px solid #3182ce' }
                  }}
                >
                  <Avatar sx={{ mr: 2, bgcolor: '#3182ce' }}>
                    <AccountCircleIcon />
                  </Avatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight="bold">{doubt.student}</Typography>
                        {doubt.status === 'Unread' && <Badge color="error" variant="dot" sx={{ mr: 1 }} />}
                      </Box>
                    }
                    secondary={
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {doubt.topic}: {doubt.content}
                      </Typography>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Paper>

        {/* Chat Area */}
        <Paper elevation={0} sx={{
          flexGrow: 1,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.1)',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {activeDoubt ? (
            <>
              <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">Session Response: {activeDoubt.student}</Typography>
                <Chip label={activeDoubt.topic} color="primary" size="small" />
              </Box>

              <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: '#f9fafb', overflow: 'auto' }}>
                <Box sx={{ alignSelf: 'flex-start', maxWidth: '80%', p: 2, bgcolor: '#fff', borderRadius: '15px 15px 15px 0', border: '1px solid #e2e8f0' }}>
                  <Typography variant="body1">{activeDoubt.content}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>{activeDoubt.time}</Typography>
                </Box>
                {/* Mock response bubble could go here */}
              </Box>

              <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
                <TextField
                  fullWidth multiline rows={3}
                  placeholder="Explain the solution clearly..."
                  variant="outlined"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={handleReply}
                    disabled={!reply.trim()}
                    sx={{ borderRadius: 2 }}
                  >
                    Send Reply
                  </Button>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'text.secondary', p: 4, textAlign: 'center' }}>
              <Box>
                <QuestionAnswerIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Select a session to begin mentoring</Typography>
                <Typography variant="body2">Doubt messages from the student chatbot will appear here.</Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentSupport;
