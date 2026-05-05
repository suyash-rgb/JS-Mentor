import React, { useState } from 'react';
import { Box, Typography, Grid, Paper, Button, IconButton } from '@mui/material';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../../hooks/useProgress';
import { useCurriculum } from '../../../hooks/useCurriculum';
import './Dashboard.css'; 

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const { 
    computeHeadingProgress, 
    getLastVisitedPage, 
    theoryProgress, 
    exerciseProgress 
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

  const scheduledSessions = [
    {
      date: 'May 12, 2026',
      time: '3:30 PM',
      topic: 'React State Management',
      mentor: 'Priya Sharma',
      mode: 'Video Call',
      status: 'Confirmed',
    },
    {
      date: 'May 18, 2026',
      time: '11:00 AM',
      topic: 'JS Event Loop',
      mentor: 'Rahul Verma',
      mode: 'Chat Session',
      status: 'Scheduled',
    },
    {
      date: 'May 24, 2026',
      time: '5:00 PM',
      topic: 'Frontend Architecture',
      mentor: 'Ananya Gupta',
      mode: 'Video Call',
      status: 'Pending',
    },
  ];

  const [activeSessionIndex, setActiveSessionIndex] = useState(0);
  const activeSession = scheduledSessions[activeSessionIndex];

  const handlePrevSession = () => setActiveSessionIndex((prev) => Math.max(prev - 1, 0));
  const handleNextSession = () => setActiveSessionIndex((prev) => Math.min(prev + 1, scheduledSessions.length - 1));

  if (loading) {
    return (
      <Box className="dashboard-wrapper">
        <Navbar />
        <Box className="dashboard-main loading-state">
          <Typography variant="h6">Syncing Learning Insights...</Typography>
        </Box>
        <Footer />
      </Box>
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

  // Defining the Pie Chart Data
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
    <Box className="dashboard-wrapper">
      <Navbar />
      
      <Box component="main" className="dashboard-main">
        <Typography variant="h4" className="dashboard-title">Learning Insights</Typography>

        <Box className="dashboard-top-row">
          <Paper elevation={0} className="dashboard-left-pane">
            <Typography variant="h6" className="overall-card-title">Curriculum Mastery</Typography>
            
            <Box className="overall-chart-container">
              <Pie 
                data={mainChartData}
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: { boxWidth: 10, font: { size: 11, weight: '600' } }
                    }
                  }
                }}
              />
            </Box>

            <Box className="overall-percentage-badge">
              <Typography className="overall-percentage-text">{totalProgress}%</Typography>
              <Typography className="mastery-label">Mastery Achieved</Typography>
            </Box>
          </Paper>

          <Paper elevation={0} className="dashboard-right-pane">
            <Typography variant="h6" className="session-card-title">Upcoming Doubt Session</Typography>
            <Typography variant="body2" className="session-intro">See your next scheduled doubt session details here.</Typography>

            <Box className="session-navigation">
              <IconButton
                className="session-nav-icon"
                onClick={handlePrevSession}
                disabled={activeSessionIndex === 0}
                size="small"
              >
                <ArrowBackIosNewIcon fontSize="small" />
              </IconButton>
              <Typography className="session-step-label">
                {activeSessionIndex + 1} of {scheduledSessions.length}
              </Typography>
              <IconButton
                className="session-nav-icon"
                onClick={handleNextSession}
                disabled={activeSessionIndex === scheduledSessions.length - 1}
                size="small"
              >
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box className="session-details-box">
              <Box className="session-detail-row">
                <Typography className="session-label">Date</Typography>
                <Typography className="session-value">{activeSession.date}</Typography>
              </Box>
              <Box className="session-detail-row">
                <Typography className="session-label">Time</Typography>
                <Typography className="session-value">{activeSession.time}</Typography>
              </Box>
              <Box className="session-detail-row">
                <Typography className="session-label">Topic</Typography>
                <Typography className="session-value">{activeSession.topic}</Typography>
              </Box>
              <Box className="session-detail-row">
                <Typography className="session-label">Mentor</Typography>
                <Typography className="session-value">{activeSession.mentor}</Typography>
              </Box>
              <Box className="session-detail-row">
                <Typography className="session-label">Mode</Typography>
                <Typography className="session-value">{activeSession.mode}</Typography>
              </Box>

              <Box className="session-status-row">
                <span className="session-status-badge">{activeSession.status}</span>
              </Box>
              <Button size="small" variant="contained" className="session-action-button small-button">View Session</Button>
            </Box>
          </Paper>
        </Box>

        <Grid container spacing={3} className="path-grid-container">
          {pathsWithProgress.map((path, index) => (
            <Grid item key={index} className="path-card">
              <Box className="donut-container">
                <Doughnut 
                  data={createDonutData(path.progress, path.color)} 
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </Box>
              <Typography variant="subtitle1" className="path-name">{path.name}</Typography>
              <Typography variant="body2" className="path-progress" style={{ '--path-progress-color': path.color }}>
                {path.progress}% Complete
              </Typography>
              <Box className="path-card-actions">
                <Button 
                  size="small" 
                  variant="contained" 
                  className="continue-button"
                  style={{ '--button-bg': path.color }}
                  onClick={() => handleContinue(path.id)}
                >
                  Continue
                </Button>
                <Button
                  component="a"
                  href={getNotesUrl(path.id)}
                  download
                  size="small"
                  variant="outlined"
                  className="notes-button"
                  style={{ '--button-color': path.color }}
                >
                  📚 Notes
                </Button>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;