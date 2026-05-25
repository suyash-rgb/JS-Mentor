import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, useMediaQuery, useTheme, Alert } from '@mui/material';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../../hooks/useProgress';
import { useCurriculum } from '../../../hooks/useCurriculum';
import { getMyDoubts } from '../../../utils/studentService';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { 
    computeHeadingProgress, 
    getLastVisitedPage 
  } = useProgress();
  const { loading } = useCurriculum();
  const navigate = useNavigate();

  const learningPaths = [
    { id: 'Fundamentals', name: 'Fundamentals', color: '#f05204' },
    { id: 'JavaScript Core', name: 'JS Core', color: '#3498db' },
    { id: 'Frontend Frameworks', name: 'Frontend', color: '#61dafb' },
    { id: 'Node.js', name: 'Node.js', color: '#68a063' },
    { id: 'Full-Stack Architecture', name: 'Full Stack', color: '#2c3e50' },
    { id: 'Technologies and Trends', name: 'Tech Trends', color: '#ff4081' },
  ];

  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [sessionsError, setSessionsError] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const data = await getMyDoubts();
        const mapped = data.map(s => ({
          doubtId: s.doubt_id,
          date: s.scheduled_for
            ? new Date(s.scheduled_for).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : 'Awaiting Schedule',
          time: s.time ||
            (s.scheduled_for
              ? new Date(s.scheduled_for).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
              : '—'),
          topic: s.topic,
          mentor: s.trainer_name || 'Not assigned yet',
          mode: s.mode || 'Chat',
          status: s.status,
          sessionId: s.session_id,
        }));
        setScheduledSessions(mapped);
      } catch (err) {
        console.error('Dashboard: Failed to load doubt sessions', err);
        setSessionsError('Could not load sessions.');
      } finally {
        setSessionsLoading(false);
      }
    };
    loadSessions();
  }, []);

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const activeSession = scheduledSessions[activeSessionIndex];

  const handlePrevSession = () => setActiveSessionIndex((prev) => Math.max(prev - 1, 0));
  const handleNextSession = () => setActiveSessionIndex((prev) => Math.min(prev + 1, scheduledSessions.length - 1));

  const handleViewSession = () => {
    if (activeSession.sessionId) {
      const event = new CustomEvent('open-mentorship-chat', {
        detail: {
          sessionId: activeSession.sessionId,
          topic: activeSession.topic,
          mentor: activeSession.mentor
        }
      });
      window.dispatchEvent(event);
    } else {
      alert("This session is not yet scheduled for chat.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <Navbar />
        <div className="flex-1 flex justify-center items-center p-6 text-center">
          <Typography variant="h6" className="text-slate-500 font-semibold text-base sm:text-lg animate-pulse">
            Syncing Learning Insights...
          </Typography>
        </div>
        <Footer />
      </div>
    );
  }

  const pathsWithProgress = learningPaths.map(p => ({
    ...p,
    progress: computeHeadingProgress(p.id)
  }));

  const totalProgress = Math.round(
    pathsWithProgress.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length
  );

  const handleContinue = (headingId) => {
    const lastUrl = getLastVisitedPage(headingId);
    if (lastUrl) {
      navigate(`/${lastUrl.replace(/^\//, '')}`);
    }
  };

  const notesDownloadMap = {
    'Fundamentals': '/1.pdf',
    'JavaScript Core': '/2.pdf',
    'Frontend Frameworks': '/3.pdf',
    'Node.js': '/4.pdf',
    'Full-Stack Architecture': '/5.pdf',
    'Technologies and Trends': '/6.pdf',
  };

  const getNotesUrl = (pathId) => notesDownloadMap[pathId] || '/1.pdf';

  const mainChartData = {
    labels: pathsWithProgress.map(p => p.name),
    datasets: [{
      data: pathsWithProgress.map(p => p.progress || 1),
      backgroundColor: pathsWithProgress.map(p => p.color),
      hoverOffset: 25
    }]
  };

  const createDonutData = (progress, color) => ({
    datasets: [{
      data: [progress, 100 - progress],
      backgroundColor: [color, '#eceff1'],
      borderWidth: 0,
      cutout: '75%',
    }],
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full space-y-6">
        <Typography variant="h4" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Learning Insights
        </Typography>

        {/* Dashboard Top Section: Splits side-by-side on desktop, stacks vertically on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT CONTAINER: CURRICULUM PIE CHART CHART */}
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="w-full sm:w-1/2 flex flex-col justify-between self-start h-full">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Curriculum Mastery</h3>
                <p className="text-xs text-slate-400 mt-0.5">Distribution breakdown of active track completions.</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className="text-4xl font-black text-slate-900 tracking-tighter block">{totalProgress}%</span>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block mt-1">
                  Overall Mastery Achieved
                </span>
              </div>
            </div>

            <div className="w-full sm:w-1/2 h-[180px] sm:h-[200px] relative flex items-center justify-center">
              <Pie 
                data={mainChartData}
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { boxWidth: 8, font: { size: 10, weight: '700' } }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* RIGHT CONTAINER: LIVE SCHEDULED DOUBT SESSIONS CAROUSEL */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Upcoming Doubt Sessions</h3>
                {scheduledSessions.length > 0 && (
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg">
                    <IconButton
                      onClick={handlePrevSession}
                      disabled={activeSessionIndex === 0}
                      size="small"
                      className="p-1 text-slate-600 disabled:text-slate-300"
                    >
                      <ArrowBackIosNewIcon className="!w-3.5 !h-3.5" />
                    </IconButton>
                    <span className="text-[11px] font-bold text-slate-500 px-1">
                      {activeSessionIndex + 1} / {scheduledSessions.length}
                    </span>
                    <IconButton
                      onClick={handleNextSession}
                      disabled={activeSessionIndex === scheduledSessions.length - 1}
                      size="small"
                      className="p-1 text-slate-600 disabled:text-slate-300"
                    >
                      <ArrowForwardIosIcon className="!w-3.5 !h-3.5" />
                    </IconButton>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Converse live with assigned technical cohort mentors.</p>
            </div>

            {/* Content states wrapper */}
            <div className="my-4 flex-1 flex flex-col justify-center min-h-[140px]">
              {sessionsLoading && (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">Checking reservation logs...</div>
              )}

              {!sessionsLoading && sessionsError && (
                <Alert severity="error" className="rounded-xl text-xs py-0 px-3">{sessionsError}</Alert>
              )}

              {!sessionsLoading && !sessionsError && scheduledSessions.length === 0 && (
                <div className="text-center py-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                  <p className="text-xs font-bold text-slate-700">No doubts booked yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Use the copilot bot thread to link an intervention line.</p>
                </div>
              )}

              {!sessionsLoading && !sessionsError && scheduledSessions.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs bg-slate-50/70 border border-slate-100 p-3.5 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Date</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{activeSession.date}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Time</span>
                    <span className="font-bold text-slate-800 block mt-0.5">{activeSession.time}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Topic</span>
                    <span className="font-bold text-slate-800 block mt-0.5 truncate">{activeSession.topic}</span>
                  </div>
                  <div className="col-span-2 border-t border-slate-200/50 pt-2 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Mentor Connection</span>
                      <span className="font-bold text-slate-800 block mt-0.5 truncate max-w-[160px] sm:max-w-none">
                        {activeSession.mentor}
                      </span>
                    </div>
                    <span className="bg-amber-100 text-amber-800 font-black text-[9px] uppercase tracking-wide px-2 py-0.5 rounded-md border border-amber-200 shadow-sm shrink-0">
                      {activeSession.status}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Carousel Footer Trigger */}
            {(!sessionsLoading && !sessionsError && scheduledSessions.length > 0) && (
              <Button 
                fullWidth
                variant="contained" 
                onClick={handleViewSession}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 normal-case rounded-xl shadow-none"
              >
                Connect to Live Session
              </Button>
            )}
          </div>
        </div>

        {/* TRACK CARD GRID ROW: Generates grid columns fluidly across display tiers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {pathsWithProgress.map((path, index) => (
            <div 
              key={index} 
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Micro Circular Progress Ring Element Container */}
              <div className="w-[85px] h-[85px] relative mb-3">
                <Doughnut 
                  data={createDonutData(path.progress, path.color)} 
                  options={{ 
                    maintainAspectRatio: false, 
                    plugins: { legend: { display: false }, tooltip: { enabled: false } } 
                  }} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-slate-800">{path.progress}%</span>
                </div>
              </div>

              <h4 className="font-extrabold text-slate-800 text-base tracking-tight leading-tight mb-1">
                {path.name}
              </h4>
              <span 
                style={{ color: path.color }} 
                className="text-xs font-bold uppercase tracking-wider text-[10px] mb-5 block"
              >
                Track Completion
              </span>

              {/* Dynamic Interactive Link Actions Cluster Footer */}
              <div className="w-full grid grid-cols-2 gap-2 mt-auto">
                <Button 
                  variant="contained" 
                  onClick={() => handleContinue(path.id)}
                  style={{ backgroundColor: path.color }}
                  className="hover:brightness-95 text-white font-bold text-xs py-2 normal-case rounded-xl shadow-none"
                >
                  Continue
                </Button>
                <Button
                  component="a"
                  href={getNotesUrl(path.id)}
                  download
                  variant="outlined"
                  style={{ color: path.color, borderColor: `${path.color}40` }}
                  className="hover:bg-slate-50 font-bold text-xs py-2 normal-case rounded-xl"
                >
                  📚 Notes
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;