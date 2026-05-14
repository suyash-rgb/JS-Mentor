import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, List, Button, Chip, IconButton, Tooltip, Divider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Icons
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';

// Styles
import * as S from './StudentSupport.styles';
import { getDoubtQueue, getTrainerSessions } from '../../../utils/scheduleService';
import ChatBox from '../../../components/chat/ChatBox';

const StudentSupport = () => {
  const [activeSession, setActiveSession] = useState(null);
  const [queue, setQueue] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);

  // Correctly defined state and setters
  const [queueLoading, setQueueLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const fetchAll = useCallback(async () => {
    setQueueLoading(true);
    setSessionsLoading(true);
    try {
      const [queueData, sessionsData] = await Promise.all([
        getDoubtQueue(),
        getTrainerSessions(dayjs().format('YYYY-MM-DD'))
      ]);
      setQueue(queueData);
      setSessions(sessionsData);
    } catch (err) {
      console.error("Failed to load support data", err);
    } finally {
      setQueueLoading(false);
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchAll();
  }, [fetchAll]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <S.MainContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, flexGrow: 1, color: '#1e293b' }}>
            Student Doubts
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={() => {
                // Future: Open a full archive modal
                setCalendarOpen(!calendarOpen);
              }}
              sx={{ borderRadius: '10px', px: 3, textTransform: 'none' }}
            >
              {calendarOpen ? 'Live Dashboard' : 'View Archive'}
            </Button>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchAll} sx={{ border: '1px solid #e2e8f0' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1, gap: 3, minHeight: 0 }}>
          <S.SidePanel sx={{ width: 380 }}>
            {/* Section 1: My Sessions */}
            <S.PanelHeader>
              <Typography variant="subtitle2" fontWeight={700} color="primary">
                MY SESSIONS (TODAY)
              </Typography>
              {!sessionsLoading && <Chip label={sessions.length} size="small" color="primary" variant="outlined" />}
            </S.PanelHeader>
            <List sx={{ p: 0, mb: 2 }}>
              {sessions.map((session) => (
                <S.StyledListItem 
                  key={`sess-${session.session_id}`} 
                  selected={activeSession?.id === session.session_id}
                  onClick={() => setActiveSession({ id: session.session_id, student_name: session.student_name, topic: session.topic })}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <PersonIcon color="primary" />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{session.student_name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {session.topic} • {dayjs(session.scheduled_for).format('hh:mm A')}
                      </Typography>
                    </Box>
                  </Box>
                </S.StyledListItem>
              ))}
              {sessions.length === 0 && !sessionsLoading && (
                <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}>No sessions assigned for today.</Typography>
              )}
            </List>

            <Divider />

            {/* Section 2: Incoming Queue */}
            <S.PanelHeader sx={{ mt: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color="secondary">
                INCOMING QUEUE (OPEN)
              </Typography>
              {!queueLoading && <Chip label={queue.length} size="small" color="secondary" variant="outlined" />}
            </S.PanelHeader>
            <List sx={{ overflowY: 'auto', p: 0 }}>
              {queue.map((doubt) => (
                <S.StyledListItem 
                  key={`doubt-${doubt.doubt_id}`} 
                  selected={activeSession?.id === doubt.session_id}
                  onClick={() => {
                    if (doubt.session_id) {
                      setActiveSession({ id: doubt.session_id, student_name: doubt.student_name, topic: doubt.topic });
                    } else {
                      alert("This doubt hasn't been scheduled yet. It will be assigned to an online trainer shortly.");
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <QuestionAnswerIcon color="secondary" />
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{doubt.student_name}</Typography>
                      <Typography variant="caption" color="text.secondary">{doubt.topic}</Typography>
                    </Box>
                  </Box>
                </S.StyledListItem>
              ))}
              {queue.length === 0 && !queueLoading && (
                <Typography variant="caption" sx={{ p: 2, display: 'block', textAlign: 'center', color: 'text.secondary' }}>Queue is empty.</Typography>
              )}
            </List>
          </S.SidePanel>

          <S.ChatPanel sx={{ flexGrow: 1 }}>
            {activeSession ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <S.PanelHeader sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" fontWeight={700}>{activeSession.student_name}</Typography>
                    <Chip label={activeSession.topic} color="secondary" size="small" variant="outlined" />
                    {activeSession.status === 'COMPLETED' && <Chip label="RESOLVED" color="success" size="small" />}
                  </Box>
                  
                  {activeSession.status !== 'COMPLETED' && (
                    <Button 
                      variant="contained" 
                      color="success" 
                      size="small"
                      startIcon={<QuestionAnswerIcon />}
                      onClick={async () => {
                        if (window.confirm("Mark this doubt as resolved and conclude the session?")) {
                          try {
                            const t = localStorage.getItem('token');
                            await axios.put(
                              `http://localhost:8000/api/v1/trainer/sessions/${activeSession.id}/resolve`,
                              {},
                              { headers: { Authorization: `Bearer ${t}` } }
                            );
                            fetchAll();
                          } catch (err) {
                            console.error("Failed to resolve session", err);
                          }
                        }
                      }}
                      sx={{ borderRadius: '8px', textTransform: 'none' }}
                    >
                      Resolve Session
                    </Button>
                  )}
                </S.PanelHeader>
                <ChatBox 
                  sessionId={activeSession.id} 
                  userToken={token} 
                  userRole={role} 
                />
              </Box>
            ) : (
              <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.4 }}>
                <QuestionAnswerIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">Select a session to start chatting</Typography>
              </Box>
            )}
          </S.ChatPanel>
        </Box>
      </S.MainContainer>
    </LocalizationProvider>
  );
};

export default StudentSupport;