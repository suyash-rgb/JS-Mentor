import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, List, ListItem, ListItemText,
  Divider, TextField, Button, Avatar, Badge, Chip,
  CircularProgress, Alert, IconButton, Tooltip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getDoubtQueue, getTrainerSessions } from '../../../utils/scheduleService';

// ─── helpers ─────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

const formatTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const formatDateLabel = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const statusColor = (status) => {
  switch (status) {
    case 'SCHEDULED': return '#3182ce';
    case 'ACTIVE':    return '#38a169';
    case 'COMPLETED': return '#718096';
    case 'CANCELLED': return '#e53e3e';
    default:          return '#dd6b20';
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

const StudentSupport = () => {
  const [activeDoubt, setActiveDoubt]       = useState(null);
  const [reply, setReply]                   = useState('');

  // Queue (pending doubts for today)
  const [queue, setQueue]                   = useState([]);
  const [queueLoading, setQueueLoading]     = useState(true);
  const [queueError, setQueueError]         = useState(null);

  // Calendar mode — sessions filtered by chosen date
  const [calendarOpen, setCalendarOpen]     = useState(false);
  const [selectedDate, setSelectedDate]     = useState('');
  const [sessions, setSessions]             = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError]   = useState(null);

  // ── fetch today's pending queue ──────────────────────────────────────────
  const fetchQueue = useCallback(async () => {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const data = await getDoubtQueue();
      // API says "show only doubts for the same day" — backend already filters FIFO
      setQueue(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        setQueueError('Session expired. Please log in again.');
      } else if (err?.response?.status === 403) {
        setQueueError('Access denied. Trainer role required.');
      } else {
        setQueueError(err?.response?.data?.detail || 'Failed to load the doubt queue.');
      }
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // ── fetch sessions for a given date ─────────────────────────────────────
  const fetchSessions = useCallback(async (date) => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const data = await getTrainerSessions(date || null);
      setSessions(data);
    } catch (err) {
      if (err?.response?.status === 401) {
        setSessionsError('Session expired. Please log in again.');
      } else {
        setSessionsError(err?.response?.data?.detail || 'Failed to load sessions.');
      }
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  // when a date is picked from the calendar, load sessions for that date
  const handleDateChange = (e) => {
    const date = e.target.value; // "YYYY-MM-DD"
    setSelectedDate(date);
    if (date) fetchSessions(date);
    else setSessions([]);
  };

  const handleReply = () => {
    setReply('');
    setActiveDoubt(null);
  };

  // decide which list items to show in the left panel
  const listItems = calendarOpen ? sessions : queue;

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header row ─────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
          Student Doubts
        </Typography>

        {/* Calendar toggle */}
        <Tooltip title={calendarOpen ? 'Show today\'s queue' : 'Browse by date'}>
          <Button
            variant={calendarOpen ? 'contained' : 'outlined'}
            startIcon={<CalendarMonthIcon />}
            onClick={() => {
              setCalendarOpen(p => !p);
              setActiveDoubt(null);
              if (!calendarOpen && selectedDate) fetchSessions(selectedDate);
            }}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
          >
            {calendarOpen ? 'Hide Calendar' : 'Calendar'}
          </Button>
        </Tooltip>

        {/* Refresh queue */}
        {!calendarOpen && (
          <Tooltip title="Refresh queue">
            <IconButton onClick={fetchQueue} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* ── Calendar date picker (shown when open) ─────────────────────────── */}
      {calendarOpen && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            type="date"
            label="Select date"
            value={selectedDate}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: 200 }}
          />
          {selectedDate && (
            <Typography variant="body2" color="text.secondary">
              Sessions on <strong>{formatDateLabel(selectedDate + 'T00:00:00')}</strong>
            </Typography>
          )}
        </Box>
      )}

      {/* ── Main layout ────────────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, minHeight: '500px' }}>

        {/* ── Left panel: queue OR calendar sessions ─────────────────────── */}
        <Paper elevation={0} sx={{
          width: '350px',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.1)',
          overflow: 'hidden',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {calendarOpen ? 'Sessions' : 'New Sessions'}
            </Typography>
            {!calendarOpen && !queueLoading && (
              <Chip label={`${queue.length} pending`} size="small" color="warning" />
            )}
          </Box>

          {/* Loading / error states */}
          {(calendarOpen ? sessionsLoading : queueLoading) && (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          )}

          {!calendarOpen && queueError && (
            <Alert severity="error" sx={{ m: 1 }}>{queueError}</Alert>
          )}
          {calendarOpen && sessionsError && (
            <Alert severity="error" sx={{ m: 1 }}>{sessionsError}</Alert>
          )}

          {/* Empty states */}
          {!calendarOpen && !queueLoading && !queueError && queue.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <QuestionAnswerIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No pending doubts for today.</Typography>
            </Box>
          )}

          {calendarOpen && !sessionsLoading && !sessionsError && sessions.length === 0 && selectedDate && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <CalendarMonthIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No sessions scheduled for this date.</Typography>
            </Box>
          )}

          {calendarOpen && !selectedDate && !sessionsLoading && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Pick a date to load sessions.</Typography>
            </Box>
          )}

          {/* List */}
          <List sx={{ p: 0, overflowY: 'auto', flexGrow: 1 }}>
            {listItems.map((item, idx) => {
              // queue item fields: doubt_id, student_name, topic, description, expected_duration_minutes
              // session item fields: session_id, student_name, topic, scheduled_for, duration_minutes, status
              const id = item.doubt_id ?? item.session_id;
              const isActive = activeDoubt?.id === id;

              return (
                <React.Fragment key={id ?? idx}>
                  <ListItem
                    button
                    selected={isActive}
                    onClick={() => setActiveDoubt({
                      id,
                      student: item.student_name,
                      topic: item.topic,
                      content: item.description || `Scheduled: ${formatTime(item.scheduled_for)}`,
                      duration: item.expected_duration_minutes ?? item.duration_minutes,
                      scheduledFor: item.scheduled_for ?? null,
                      status: item.status ?? 'OPEN',
                    })}
                    sx={{
                      py: 2,
                      '&.Mui-selected': { bgcolor: '#ebf8ff', borderLeft: '4px solid #3182ce' },
                    }}
                  >
                    <Avatar sx={{ mr: 2, bgcolor: calendarOpen ? statusColor(item.status) : '#3182ce' }}>
                      <AccountCircleIcon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {item.student_name}
                          </Typography>
                          {calendarOpen && item.status && (
                            <Chip
                              label={item.status}
                              size="small"
                              sx={{ fontSize: '0.65rem', height: 18,
                                    bgcolor: statusColor(item.status) + '22',
                                    color: statusColor(item.status),
                                    fontWeight: 700 }}
                            />
                          )}
                          {!calendarOpen && (
                            <Badge color="warning" variant="dot" sx={{ mr: 1 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.topic}: {item.description
                            ? item.description.substring(0, 40) + '…'
                            : formatTime(item.scheduled_for)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        </Paper>

        {/* ── Right panel: chat / detail ──────────────────────────────────── */}
        <Paper elevation={0} sx={{
          flexGrow: 1,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.1)',
          bgcolor: 'white',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activeDoubt ? (
            <>
              <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Session Response: {activeDoubt.student}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={activeDoubt.topic} color="primary" size="small" />
                  {activeDoubt.status !== 'OPEN' && (
                    <Chip
                      label={activeDoubt.status}
                      size="small"
                      sx={{ bgcolor: statusColor(activeDoubt.status) + '22',
                            color: statusColor(activeDoubt.status), fontWeight: 700 }}
                    />
                  )}
                </Box>
              </Box>

              {/* Session meta */}
              <Box sx={{ px: 3, pt: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {activeDoubt.scheduledFor && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">
                      {formatDateLabel(activeDoubt.scheduledFor)} · {formatTime(activeDoubt.scheduledFor)}
                    </Typography>
                  </Box>
                )}
                {activeDoubt.duration && (
                  <Typography variant="body2" color="text.secondary">
                    ⏱ {activeDoubt.duration} min session
                  </Typography>
                )}
              </Box>

              <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column',
                          gap: 2, bgcolor: '#f9fafb', overflow: 'auto' }}>
                <Box sx={{ alignSelf: 'flex-start', maxWidth: '80%', p: 2,
                            bgcolor: '#fff', borderRadius: '15px 15px 15px 0',
                            border: '1px solid #e2e8f0' }}>
                  <Typography variant="body1">{activeDoubt.content}</Typography>
                </Box>
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
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center',
                        alignItems: 'center', color: 'text.secondary', p: 4, textAlign: 'center' }}>
              <Box>
                <QuestionAnswerIcon sx={{ fontSize: 60, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">Select a session to begin mentoring</Typography>
                <Typography variant="body2">
                  Doubt messages from the student chatbot will appear here.
                </Typography>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default StudentSupport;
