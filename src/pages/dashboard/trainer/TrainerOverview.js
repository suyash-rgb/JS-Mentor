import React, { useState, useEffect } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Divider, CircularProgress, Alert,
  Switch, FormControlLabel
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getDashboardOverview, updateAvailability } from '../../../utils/trainerService';
import './TrainerOverview.css';

const TrainerOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [trainerName, setTrainerName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getDashboardOverview();
        setData(result);
        setIsAvailable(result.is_available ?? false);
        setTrainerName(result.trainer_name || 'Trainer');
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

  const handleToggleAvailability = async (event) => {
    const newVal = event.target.checked;
    setIsUpdating(true);
    try {
      await updateAvailability(newVal);
      setIsAvailable(newVal);
    } catch (err) {
      console.error("Failed to update availability:", err);
    } finally {
      setIsUpdating(false);
    }
  };

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
    { title: 'Active Students', value: stats?.active_students || 0, icon: <PeopleAltIcon fontSize="large" sx={{ color: '#3182ce' }} />, cssClass: 'stat-card-blue' },
    { title: 'Pending Reviews', value: stats?.pending_reviews || 0, icon: <AssignmentIcon fontSize="large" sx={{ color: '#e53e3e' }} />, cssClass: 'stat-card-red' },
    { title: 'New Doubts', value: stats?.new_doubts || 0, icon: <MessageIcon fontSize="large" sx={{ color: '#805ad5' }} />, cssClass: 'stat-card-purple' },
    { title: 'Avg. Score', value: `${stats?.average_score_percentage || 0}%`, icon: <TrendingUpIcon fontSize="large" sx={{ color: '#3182ce' }} />, cssClass: 'stat-card-blue' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ mb: 1 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold', letterSpacing: 1 }}>
          TRAINER DASHBOARD
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Welcome back, {trainerName}
        </Typography>
        <Paper elevation={0} sx={{ px: 2, py: 0.5, borderRadius: 10, border: '1px solid #eee', bgcolor: isAvailable ? '#f0fff4' : '#fff5f5' }}>
          <FormControlLabel
            control={
              <Switch
                checked={isAvailable}
                onChange={handleToggleAvailability}
                disabled={isUpdating}
                color="success"
              />
            }
            label={
              <Typography sx={{ fontWeight: 600, color: isAvailable ? '#2f855a' : '#c53030' }}>
                {isUpdating ? 'Updating...' : (isAvailable ? 'Online' : 'Offline')}
              </Typography>
            }
          />
        </Paper>
      </Box>

      {/* Stat Cards Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {statCards.map((stat, index) => (
          <Box 
            key={index}
            sx={{
              flex: '1 1 0',
              minWidth: '160px',
              p: 3,
              bgcolor: stat.cssClass === 'stat-card-blue' ? '#ebf8ff' : stat.cssClass === 'stat-card-red' ? '#fff5f5' : '#faf5ff',
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.05)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 },
              '@media (max-width: 960px)': {
                flex: '1 1 calc(50% - 12px)',
              },
              '@media (max-width: 600px)': {
                flex: '1 1 100%',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {stat.icon}
              <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary', fontWeight: 500 }}>
                {stat.title}
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{stat.value}</Typography>
          </Box>
        ))}
      </Box>

      {/* Bottom Cards Row - Equal Width */}
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Recent Submissions */}
        <Card elevation={2} sx={{ 
          flex: '1 1 calc(50% - 12px)',
          minWidth: '300px',
          borderRadius: 3,
          '@media (max-width: 960px)': {
            flex: '1 1 100%',
          },
        }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Recent Submissions</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recent_submissions && recent_submissions.length > 0 ? (
                recent_submissions.map((sub, i) => (
                  <Box key={sub.submission_id} sx={{ p: 2, borderRadius: 2, border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
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

        {/* Active Sessions */}
        <Card elevation={2} sx={{ 
          flex: '1 1 calc(50% - 12px)',
          minWidth: '300px',
          borderRadius: 3,
          bgcolor: '#2c3e50',
          color: 'white',
          '@media (max-width: 960px)': {
            flex: '1 1 100%',
          },
        }}>
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
      </Box>
    </Box>
  );
};

export default TrainerOverview;
