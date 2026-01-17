import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';
import { Doughnut, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import './Dashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const learningPaths = [
    { name: 'Fundamentals', progress: 85, color: '#f05204' },
    { name: 'Frameworks', progress: 40, color: '#61dafb' },
    { name: 'Node.js', progress: 10, color: '#68a063' },
    { name: 'Architecture', progress: 0, color: '#2c3e50' },
    { name: 'PWAs', progress: 0, color: '#ff4081' },
  ];

  const totalProgress = Math.round(
    learningPaths.reduce((acc, path) => acc + path.progress, 0) / learningPaths.length
  );

  // Defining the Pie Chart Data
  const mainChartData = {
    labels: learningPaths.map(p => p.name),
    datasets: [{
      data: learningPaths.map(p => p.progress || 1),
      backgroundColor: learningPaths.map(p => p.color),
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
                maintainAspectRatio: false, // Required for vh units to work
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
          {learningPaths.map((path, index) => (
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
              <Button size="small" variant="contained" sx={{ bgcolor: path.color, borderRadius: '20px' }}>
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