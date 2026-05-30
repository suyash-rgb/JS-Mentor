import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, Typography, List, Button, Chip, IconButton, Tooltip, Divider, useMediaQuery, useTheme, Avatar } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Icons
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';

import { getDoubtQueue, getTrainerSessions } from '../../../services/scheduleService';
import ChatBox from '../../../components/chat/ChatBox';
import { useMentorshipCall } from '../../../hooks/useMentorshipCall';
import VideoContainer from '../../../components/call/VideoContainer';

const StudentSupport = () => {
  const theme = useTheme();
  // Match standard Tailwind md breakpoint (768px)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeSession, setActiveSession] = useState(null);
  const [queue, setQueue] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [sessions, setSessions] = useState([]);

  const [queueLoading, setQueueLoading] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Variable to toggle mobile view visibility between panel and open chat threads
  const [showMobileChat, setShowMobileChat] = useState(false);

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const trainerName = localStorage.getItem('trainerName') || localStorage.getItem('name') || 'Trainer';
  
  const callHook = useMentorshipCall(activeSession?.id, 'TRAINER', trainerName);

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

  const handleSelectSession = (sessionData) => {
    setActiveSession(sessionData);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  const handleBackToPanel = () => {
    setShowMobileChat(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-3 sm:p-6 max-w-7xl mx-auto space-y-4">
        
        {/* Dynamic App Bar Header - Hidden on mobile when chat thread context is focused */}
        {(!isMobile || !showMobileChat) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <Typography variant="h4" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Student Doubts
              </Typography>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Manage assigned mentorship items and respond to active student issues in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button
                variant="outlined"
                startIcon={<CalendarMonthIcon />}
                onClick={() => setCalendarOpen(!calendarOpen)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm py-2 px-4 normal-case rounded-xl shadow-none"
              >
                {calendarOpen ? 'Live Dashboard' : 'View Archive'}
              </Button>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchAll} className="border border-slate-200 bg-white hover:bg-slate-50 rounded-xl p-2">
                  <RefreshIcon className="text-slate-600 w-5 h-5" />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        )}

        {/* Master Workspace Split-Pane Grid */}
        <div className="flex flex-1 gap-4 overflow-hidden relative min-h-0 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
          
          {/* MASTER PANEL (Sessions / Queue Directories) */}
          {(!isMobile || !showMobileChat) && (
            <div className="w-full md:w-[360px] lg:w-[400px] flex flex-col h-full shrink-0 divide-y divide-slate-100 bg-slate-50/40">
              
              {/* SECTION 1: ACTIVE ASSIGNED SESSIONS */}
              <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
                <div className="flex items-center justify-between px-1 pb-2">
                  <span className="text-[11px] font-black tracking-wider text-blue-600 uppercase">My Sessions (Today)</span>
                  {!sessionsLoading && (
                    <Chip label={sessions.length} size="small" className="font-extrabold text-[10px] bg-blue-50 text-blue-600 border-blue-100" variant="outlined" />
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {sessions.map((session) => {
                    const isSelected = activeSession?.id === session.session_id;
                    return (
                      <div
                        key={`sess-${session.session_id}`}
                        onClick={() => handleSelectSession({ id: session.session_id, student_name: session.student_name, topic: session.topic, status: session.status })}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-200 text-blue-900 shadow-sm'
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Avatar className={`w-9 h-9 font-bold text-sm ${isSelected ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
                          {session.student_name.charAt(0)}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm tracking-tight truncate">{session.student_name}</h4>
                          <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-blue-600 font-medium' : 'text-slate-400'}`}>
                            {session.topic} • {dayjs(session.scheduled_for).format('hh:mm A')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {sessions.length === 0 && !sessionsLoading && (
                    <div className="text-center py-6 text-xs text-slate-400 italic">No assigned mentor lines today.</div>
                  )}
                </div>
              </div>

              {/* SECTION 2: LIVE OPEN INCOMING QUEUE */}
              <div className="flex-1 flex flex-col min-h-0 p-3 overflow-hidden">
                <div className="flex items-center justify-between px-1 pb-2 pt-1">
                  <span className="text-[11px] font-black tracking-wider text-purple-600 uppercase">Incoming Queue (Open)</span>
                  {!queueLoading && (
                    <Chip label={queue.length} size="small" className="font-extrabold text-[10px] bg-purple-50 text-purple-600 border-purple-100" variant="outlined" />
                  )}
                </div>

                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {queue.map((doubt) => {
                    const isSelected = activeSession?.id === doubt.session_id;
                    return (
                      <div
                        key={`doubt-${doubt.doubt_id}`}
                        onClick={() => {
                          if (doubt.session_id) {
                            handleSelectSession({ id: doubt.session_id, student_name: doubt.student_name, topic: doubt.topic, status: doubt.status });
                          } else {
                            alert("This ticket context is currently being matching via routing algorithms.");
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
                          isSelected
                            ? 'bg-purple-50 border-purple-200 text-purple-900 shadow-sm'
                            : 'bg-white border-slate-100 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isSelected ? 'bg-purple-600 text-white' : 'bg-purple-50 text-purple-600'}`}>
                          <QuestionAnswerIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm tracking-tight truncate">{doubt.student_name}</h4>
                          <p className={`text-xs truncate mt-0.5 ${isSelected ? 'text-purple-600 font-medium' : 'text-slate-400'}`}>
                            {doubt.topic}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {queue.length === 0 && !queueLoading && (
                    <div className="text-center py-6 text-xs text-slate-400 italic">Queue lines are safely cleared.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* DETAIL CHAT AREA PANEL */}
          {(!isMobile || showMobileChat) && (
            <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
              {activeSession ? (
                <div className="flex flex-col h-full min-h-0">
                  
                  {/* Dynamic Conversation Sub-Header Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 p-3 sm:px-4 bg-slate-50/50">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isMobile && (
                        <IconButton onClick={handleBackToPanel} size="small" className="mr-1 text-slate-600">
                          <ArrowBackIcon fontSize="small" />
                        </IconButton>
                      )}
                      <div className="truncate">
                        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight truncate leading-tight">
                          {activeSession.student_name}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-[120px] sm:max-w-none">
                            {activeSession.topic}
                          </span>
                          {activeSession.status === 'COMPLETED' && (
                            <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                              Resolved
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {activeSession.status !== 'COMPLETED' && (
                      <div className="flex gap-2">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<VideocamIcon className="!w-4 !h-4" />}
                          onClick={() => callHook.initiateCall()}
                          disabled={callHook.callStatus === callHook.CALL_STATUS.IN_CALL}
                          className="bg-blue-600 hover:bg-blue-700 shadow-none text-xs font-bold py-1.5 px-3 normal-case rounded-xl shrink-0"
                        >
                          Video Call
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<QuestionAnswerIcon className="!w-3.5 !h-3.5" />}
                          onClick={async () => {
                            if (window.confirm("Mark this doubt as resolved and conclude the session?")) {
                              try {
                                const t = localStorage.getItem('token');
                                const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
                                await axios.put(
                                  `${API_BASE_URL}/api/v1/trainer/sessions/${activeSession.id}/resolve`,
                                  {},
                                  { headers: { Authorization: `Bearer ${t}` } }
                                );
                                fetchAll();
                                if (isMobile) setShowMobileChat(false);
                              } catch (err) {
                                console.error("Failed to resolve session", err);
                              }
                            }
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 shadow-none text-xs font-bold py-1.5 px-3 normal-case rounded-xl shrink-0"
                        >
                          Resolve
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Real-time WebRTC/WebSocket Message Stream Core Wrapper */}
                  <div className="flex-1 min-h-0 bg-slate-50/30">
                    <ChatBox
                      sessionId={activeSession.id}
                      userToken={token}
                      userRole={role}
                    />
                  </div>

                </div>
              ) : (
                /* Unselected Session Context Screen */
                <div className="m-auto flex flex-col items-center justify-center p-6 text-center max-w-sm">
                  <div className="p-4 bg-slate-50 text-slate-300 rounded-2xl mb-3 border border-slate-100">
                    <QuestionAnswerIcon className="w-10 h-10" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">No Active Conversation</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Select an inline item from your assigned today panel or check the public support triage line queue to begin troubleshooting.
                  </p>
                </div>
              )}
          </div>
          )}

        </div>
        {activeSession && callHook.callStatus !== callHook.CALL_STATUS.IDLE && (
          <VideoContainer
            callStatus={callHook.callStatus}
            CALL_STATUS={callHook.CALL_STATUS}
            localStream={callHook.localStream}
            remoteStream={callHook.remoteStream}
            isAudioMuted={callHook.isAudioMuted}
            isVideoOff={callHook.isVideoOff}
            isScreenSharing={callHook.isScreenSharing}
            mediaStatePartner={callHook.mediaStatePartner}
            onToggleAudio={callHook.toggleAudio}
            onToggleVideo={callHook.toggleVideo}
            onToggleScreenShare={callHook.toggleScreenShare}
            onEndCall={callHook.endCall}
            userRole="TRAINER"
          />
        )}
      </div>
    </LocalizationProvider>
  );
};

export default StudentSupport;