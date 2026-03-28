import React from 'react';
import { 
  Grid, Paper, Typography, Box, Card, CardContent, Divider 
} from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const TrainerOverview = () => {
  const stats = [
    { title: 'Active Students', value: '124', icon: <PeopleAltIcon fontSize="large" sx={{ color: '#3182ce' }} />, bgColor: '#ebf8ff' },
    { title: 'Pending Reviews', value: '18', icon: <AssignmentIcon fontSize="large" sx={{ color: '#e53e3e' }} />, bgColor: '#fff5f5' },
    { title: 'New Doubts', value: '7', icon: <MessageIcon fontSize="large" sx={{ color: '#805ad5' }} />, bgColor: '#faf5ff' },
    { title: 'Avg. Score', value: '84%', icon: <TrendingUpIcon fontSize="large" sx={{ color: '#3182ce' }} />, bgColor: '#ebf8ff' },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Dashboard Overview</Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
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
                {[1, 2, 3].map((_, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Exercise: Loop Fundamentals</Typography>
                      <Typography variant="body2" color="text.secondary">Submitted by: Student #{100 + i}</Typography>
                    </Box>
                    <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 'bold' }}>New</Typography>
                  </Box>
                ))}
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
                {[1, 2].map((_, i) => (
                  <Box key={i} sx={{ p: 2, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(255,255,255,0.05)' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Current Doubt: Async/Await confusion</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Time Remaining: 12m</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default TrainerOverview;
