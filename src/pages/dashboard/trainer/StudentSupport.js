import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, List, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Icons
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';

// Styles
import * as S from './StudentSupport.styles';
import { getDoubtQueue, getTrainerSessions } from '../../../utils/scheduleService';

const StudentSupport = () => {
  const [activeDoubt, setActiveDoubt] = useState(null);
  const [queue, setQueue] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [sessions, setSessions] = useState([]);

  // Correctly defined state and setters
  const [queueLoading, setQueueLoading] = useState(true);
  const [queueError, setQueueError] = useState(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const data = await getDoubtQueue();
      setQueue(data);
    } catch (err) {
      setQueueError(err?.response?.data?.detail || 'Failed to load the doubt queue.');
    } finally {
      setQueueLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async (date) => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await getTrainerSessions(date || null);
      setSessions(data);
    } catch (err) {
      setSessionsError(err?.response?.data?.detail || 'Failed to load sessions.');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  const handleDateChange = (newValue) => {
    setSelectedDate(newValue);
    if (newValue) fetchSessions(newValue.format('YYYY-MM-DD'));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <S.MainContainer>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, flexGrow: 1, color: '#1e293b' }}>
            Student Doubts
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant={calendarOpen ? 'contained' : 'outlined'}
              startIcon={<CalendarMonthIcon />}
              onClick={() => setCalendarOpen(!calendarOpen)}
              sx={{ borderRadius: '10px', px: 3, textTransform: 'none' }}
            >
              {calendarOpen ? 'Live Queue' : 'Schedule Archive'}
            </Button>
            {!calendarOpen && (
              <Tooltip title="Refresh Queue">
                <IconButton onClick={fetchQueue} sx={{ border: '1px solid #e2e8f0' }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {calendarOpen && (
          <Box sx={{ mb: 3 }}>
            <DatePicker
              label="Select Session Date"
              value={selectedDate}
              onChange={handleDateChange}
              slotProps={{ textField: { size: 'small', sx: { width: 280 } } }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', flexGrow: 1, gap: 3, minHeight: 0 }}>
          <S.SidePanel sx={{ width: 380 }}>
            <S.PanelHeader>
              <Typography variant="subtitle1" fontWeight={700}>
                {calendarOpen ? 'Historical Sessions' : 'Incoming Doubts'}
              </Typography>
              {!calendarOpen && !queueLoading && <Chip label={queue.length} size="small" color="primary" />}
            </S.PanelHeader>

            <List sx={{ overflowY: 'auto', p: 0 }}>
              {/* Add your mapping logic for queue or sessions here */}
              {calendarOpen && sessions.length === 0 && !sessionsLoading && (
                <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No sessions found.</Typography>
              )}
            </List>
          </S.SidePanel>

          <S.ChatPanel sx={{ flexGrow: 1 }}>
            {activeDoubt ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <S.PanelHeader>
                  <Typography variant="h6" fontWeight={700}>{activeDoubt.student_name}</Typography>
                  <Chip label={activeDoubt.topic} color="secondary" size="small" variant="outlined" />
                </S.PanelHeader>
              </Box>
            ) : (
              <Box sx={{ m: 'auto', textAlign: 'center', opacity: 0.4 }}>
                <QuestionAnswerIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h6">Select a conversation to reply</Typography>
              </Box>
            )}
          </S.ChatPanel>
        </Box>
      </S.MainContainer>
    </LocalizationProvider>
  );
};

export default StudentSupport;