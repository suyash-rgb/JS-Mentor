import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Divider, CircularProgress, Alert
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getDashboardOverview } from '../../../utils/trainerService';

const TrainerOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardOverview();
        setData(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching trainer dashboard:", err);
        setError("Failed to load dashboard data. Please ensure you are logged in as a trainer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const { stats, recent_submissions, active_sessions } = data || {};

  const statCards = [
    { title: 'Active Students', value: stats?.active_students || 0, icon: <PeopleAltIcon fontSize="large" sx={{ color: '#3182ce' }} />, bgColor: '#ebf8ff' },
    { title: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: <AssignmentIcon fontSize="large" sx={{ color: '#e53e3e' }} />, bgColor: '#fff5f5' },
    { title: 'New Doubts', value: stats?.new_doubts || 0, icon: <MessageIcon fontSize="large" sx={{ color: '#805ad5' }} />, bgColor: '#faf5ff' },
    { title: 'Avg. Score', value: `${stats?.average_score_percentage || 0}%`, icon: <TrendingUpIcon fontSize="large" sx={{ color: '#3182ce' }} />, bgColor: '#ebf8ff' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Overview</Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Paper elevation={0} sx={{
              p: 3,
              bgcolor: stat.bgColor,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {stat.icon}
                <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary', fontWeight: 500 }}>
                  {stat.title}
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Submissions</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {recent_submissions && recent_submissions.length > 0 ? (
                  recent_submissions.map((sub, i) => (
                    <Box key={sub.submission_id} sx={{ p: 2, borderRadius: 2, border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{sub.exercise_title}</Typography>
                        <Typography variant="body2" color="text.secondary">Submitted by: {sub.student_name}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold', display: 'block' }}>{sub.status}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(sub.submitted_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No recent submissions found.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ borderRadius: 3, bgcolor: '#2c3e50', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Active Mentorship Sessions</Typography>
              <Divider sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {active_sessions && active_sessions.length > 0 ? (
                  active_sessions.map((sess) => (
                    <Box key={sess.session_id} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.05)' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{sess.topic}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Student: {sess.student_name}</Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Duration: {sess.time_remaining_minutes}m</Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', py: 4 }}>No active sessions.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainerOverview;
