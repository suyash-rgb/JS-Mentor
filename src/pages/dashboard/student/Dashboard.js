import React, { useState, useEffect } from 'react';
import { Typography, Button, IconButton, Alert } from '@mui/material';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import LockIcon from '@mui/icons-material/Lock';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../../hooks/useProgress';
import { useCurriculum } from '../../../hooks/useCurriculum';
import { getMyDoubts } from '../../../services/studentService';
import { loadRazorpayScript } from '../../../utils/payment';
import { createOrder, verifySignature, getSubscriptionStatus } from '../../../services/paymentService';
import api from '../../../services/api';


ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {

  const { 
    computeHeadingProgress, 
    getLastVisitedPage 
  } = useProgress();
  const { loading } = useCurriculum();
  const navigate = useNavigate();

  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState('inactive');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const statusData = await getSubscriptionStatus();
        setIsPremium(statusData.is_premium);
        setSubscriptionStatus(statusData.subscription_status);
      } catch (err) {
        console.error('Failed to fetch subscription status', err);
      }
    };
    fetchSubscription();
  }, []);

  const handleUpgrade = async () => {
    setPaymentLoading(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        alert("Failed to load Razorpay Checkout SDK. Please check your internet connection.");
        setPaymentLoading(false);
        return;
      }

      const orderData = await createOrder();
      if (orderData.already_active) {
        setIsPremium(true);
        setSubscriptionStatus('active');
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JS-Mentor Premium",
        description: "Unlock advanced tracks, videos, and live mentor calls.",
        order_id: orderData.order_id,
        handler: async function (response) {
          try {
            setPaymentLoading(true);
            const verifyRes = await verifySignature({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });
            if (verifyRes.status === "success") {
              setIsPremium(true);
              setSubscriptionStatus('active');
              alert("Congratulations! You are now a Premium Member.");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.error("Signature verification error:", err);
            alert("Error verifying payment signature. Please contact support.");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: window.Clerk?.user?.fullName || "",
          email: window.Clerk?.user?.primaryEmailAddress?.emailAddress || ""
        },
        theme: {
          color: "#0f172a"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment flow initialization error:", err);
      alert("Could not start payment checkout. Please try again later.");
    } finally {
      setPaymentLoading(false);
    }
  };

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
  const [groupClasses, setGroupClasses] = useState([]);

  const loadGroupClasses = async () => {
    try {
      const res = await api.get('/api/v1/student/classes');
      setGroupClasses(res.data);
    } catch (err) {
      console.error('Failed to load group classes:', err);
    }
  };

  const loadSessions = React.useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadSessions();
    loadGroupClasses();

    // Auto-refresh every 30s so newly assigned sessions appear without reload
    const interval = setInterval(() => {
      loadSessions();
      loadGroupClasses();
    }, 30000);

    // Also refresh immediately when the trainer initiates a session (socket event)
    const handleSessionUpdate = () => {
      loadSessions();
      loadGroupClasses();
    };
    window.addEventListener('open-mentorship-chat', handleSessionUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('open-mentorship-chat', handleSessionUpdate);
    };
  }, [loadSessions]);

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

  const isFirstTwoCompleted = pathsWithProgress[0]?.progress === 100 && pathsWithProgress[1]?.progress === 100;

  const isPathDisabled = (idx) => {
    if (idx < 2) return false;
    return !isFirstTwoCompleted || !isPremium;
  };

  const totalProgress = Math.round(
    pathsWithProgress.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length
  );

  const allCleared = pathsWithProgress.every(p => p.progress === 100);

  const handleContinue = (headingId) => {
    const lastUrl = getLastVisitedPage(headingId);
    if (lastUrl) {
      navigate(`/${lastUrl.replace(/^\//, '')}`);
    }
  };



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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Typography variant="h4" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Learning Insights
          </Typography>

        </div>




        {(() => {
          const todayClass = groupClasses.find(c => {
            const classDateStr = new Date(c.scheduled_for).toDateString();
            const todayStr = new Date().toDateString();
            return classDateStr === todayStr;
          });
          if (!todayClass) return null;
          return (
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-blue-500/20">
              <div className="flex-1 space-y-1">
                <span className="text-[10px] font-black uppercase bg-blue-800/85 text-blue-100 px-3 py-1 rounded-full tracking-wider">
                  Active Cohort Class Scheduled Today
                </span>
                <h3 className="text-lg font-black tracking-tight pt-1">{todayClass.title}</h3>
                <p className="text-xs text-blue-100 font-medium">
                  Topic: {todayClass.topic} | Mentor: {todayClass.trainer_name} | Status: <span className="font-bold">{todayClass.status}</span>
                </p>
                <p className="text-xs text-blue-200 font-bold">
                  Time: {new Date(todayClass.scheduled_for).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({todayClass.duration_minutes} Mins)
                </p>
              </div>
              {todayClass.status !== 'COMPLETED' ? (
                <Button
                  variant="contained"
                  onClick={() => navigate(`/classroom/${todayClass.id}`)}
                  className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold px-6 py-2.5 rounded-xl capitalize shadow-md transition-transform active:scale-95 self-stretch md:self-auto text-center"
                >
                  Join Live Lecture Room
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  disabled
                  className="border-white/30 text-white/50 font-bold px-6 py-2.5 rounded-xl capitalize self-stretch md:self-auto text-center"
                >
                  Lecture Completed
                </Button>
              )}
            </div>
          );
        })()}

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
                  <p className="text-xs font-bold text-slate-700">No doubts yet</p>
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
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow relative"
            >
              {index >= 2 && !isPremium && (
                <span className="absolute top-3 right-3 bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1">
                  <LockIcon className="!w-3 !h-3" /> Premium
                </span>
              )}

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
                  style={isPathDisabled(index) ? {} : { backgroundColor: path.color }}
                  disabled={isPathDisabled(index)}
                  className={`font-bold text-xs py-2 normal-case rounded-xl shadow-none ${isPathDisabled(index) ? 'bg-slate-200 text-slate-400' : 'hover:brightness-95 text-white'}`}
                >
                  {isPathDisabled(index) ? (index >= 2 && !isPremium ? "Premium" : "Locked") : "Continue"}
                </Button>
                <Button
                  component={isPathDisabled(index) ? "button" : "a"}
                  href={isPathDisabled(index) ? undefined : `/notes/${encodeURIComponent(path.id)}`}
                  target={isPathDisabled(index) ? undefined : "_blank"}
                  rel={isPathDisabled(index) ? undefined : "noopener noreferrer"}
                  variant="outlined"
                  disabled={isPathDisabled(index)}
                  style={isPathDisabled(index) ? {} : { color: path.color, borderColor: `${path.color}40` }}
                  className={`font-bold text-xs py-2 normal-case rounded-xl ${isPathDisabled(index) ? 'border-slate-200 text-slate-400' : 'hover:bg-slate-50'}`}
                >
                  📚 Notes
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* FINAL EXAM ENDGAME MODULE */}
        <div className="mt-8">
          {allCleared ? (
            <div className="bg-gradient-to-r from-amber-500/10 via-purple-600/10 to-indigo-600/10 border-2 border-amber-500/60 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-500/5 transition-all hover:scale-[1.01]">
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className="p-4 bg-amber-100/80 rounded-2xl text-amber-600 shadow-md">
                  <EmojiEventsIcon className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                    Final Endgame Examination <span className="bg-amber-100 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200">UNLOCKED</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    You have successfully cleared all 6 learning paths! The trainers can now review your insights. Take the final endgame examination to complete your JS-Mentor journey.
                  </p>
                </div>
              </div>
              <Button
                variant="contained"
                onClick={() => navigate('/final-exam')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-8 py-3.5 normal-case rounded-xl shadow-none shrink-0"
              >
                Start Final Examination
              </Button>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm opacity-90">
              <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
                <div className="p-4 bg-slate-100 rounded-2xl text-slate-400">
                  <LockIcon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center justify-center md:justify-start gap-2">
                    Final Endgame Examination <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200">LOCKED</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    Complete all 6 preceding learning paths to 100% to unlock the final assessment. Keep practicing and clearing challenges!
                  </p>
                </div>
              </div>
              <Button
                disabled
                variant="contained"
                className="bg-slate-100 text-slate-400 border border-slate-250 font-bold text-xs px-8 py-3.5 normal-case rounded-xl shadow-none shrink-0"
              >
                Locked Assessment
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;