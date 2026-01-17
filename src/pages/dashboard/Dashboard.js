import React from "react";
import { Box, Typography, Grid, Paper, Button } from "@mui/material";
import { Doughnut, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import "./Dashboard.css"; // Importing the external CSS

ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = () => {
  const learningPaths = [
    { name: "Fundamentals", progress: 85, color: "#f05204" },
    { name: "Frameworks", progress: 40, color: "#61dafb" },
    { name: "Node.js", progress: 10, color: "#68a063" },
    { name: "Architecture", progress: 0, color: "#2c3e50" },
    { name: "PWAs", progress: 0, color: "#ff4081" },
  ];

  const totalProgress = Math.round(
    learningPaths.reduce((acc, path) => acc + path.progress, 0) /
      learningPaths.length,
  );

  const createDonutData = (progress, color) => ({
    datasets: [
      {
        data: [progress, 100 - progress],
        backgroundColor: [color, "#eceff1"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  });

  return (
    <Box className="dashboard-wrapper">
      <Navbar />

      <Box component="main" className="dashboard-main">
        <Typography variant="h4" className="dashboard-title">
          Learning Insights
        </Typography>
        {/* Section 1: Scaled Overall Progress */}
        <Paper elevation={0} className="overall-card">
          {/* <Typography
            variant="h5"
            className="overall-card-title"
            sx={{ mb: 4 }}
          >
            CURRICULUM MASTERY OVERVIEW
          </Typography> */}

          <Box className="overall-chart-container">
            <Pie
              data={{
                labels: learningPaths.map((p) => p.name),
                datasets: [
                  {
                    data: learningPaths.map((p) => p.progress || 1),
                    backgroundColor: learningPaths.map((p) => p.color),
                    hoverOffset: 30,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: "top",
                    labels: { font: { size: 14, weight: "600" }, padding: 20 },
                  },
                },
              }}
            />
          </Box>

          <Box className="overall-percentage-badge">
            <Typography className="overall-percentage-text">
              {totalProgress}%
            </Typography>
            <Typography
              variant="button"
              sx={{ color: "#718096", fontWeight: "bold" }}
            >
              Overall Mastery
            </Typography>
          </Box>
        </Paper>
        {/* Section 2: Larger Individual Path Donuts */}
        <Grid container spacing={4}>
          {learningPaths.map((path, index) => (
            <Grid item xs={12} sm={6} md={2.4} key={index}>
              <Paper elevation={2} className="path-card">
                <Box className="donut-container">
                  <Doughnut
                    data={createDonutData(path.progress, path.color)}
                    options={{
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                    }}
                  />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {path.name}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: path.color, fontWeight: "bold", mb: 2 }}
                >
                  {path.progress}% Complete
                </Typography>
                <Button
                  className="path-button"
                  variant="contained"
                  sx={{
                    bgcolor: path.color,
                    "&:hover": {
                      bgcolor: path.color,
                      filter: "brightness(0.9)",
                    },
                  }}
                >
                  Continue
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Footer />
    </Box>
  );
};

export default Dashboard;
