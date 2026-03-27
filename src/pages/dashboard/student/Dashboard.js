import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
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
    { id: 'Full Stack Architecture', name: 'Full Stack', color: '#2c3e50' },
    { id: 'Technologies and Trends', name: 'Tech Trends', color: '#ff4081' },
  ];

  if (loading) {
    return (
      <Box className="dashboard-wrapper">
        <Navbar />
        <Box className="dashboard-main" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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

        <Paper elevation={0} className="overall-card">
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

        <Grid container spacing={3} className="path-grid-container">
          {pathsWithProgress.map((path, index) => (
            <Grid item key={index} className="path-card">
              <Box className="donut-container">
                <Doughnut 
                  data={createDonutData(path.progress, path.color)} 
                  options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{path.name}</Typography>
              <Typography variant="body2" sx={{ color: path.color, fontWeight: 'bold', mb: 2 }}>
                {path.progress}% Complete
              </Typography>
              <Button 
                size="small" 
                variant="contained" 
                sx={{ bgcolor: path.color, borderRadius: '20px', '&:hover': { bgcolor: path.color, opacity: 0.9 } }}
                onClick={() => handleContinue(path.id)}
              >
                Continue
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>
      <Footer />
    </Box>
  );
};

export default Dashboard;