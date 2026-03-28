import React, { useState } from 'react';
import { 
  Box, Typography, Tabs, Tab, TextField, Button, Grid, 
  Card, CardContent, IconButton, List, ListItem, 
  ListItemIcon, ListItemText, Paper 
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const CurriculumManager = () => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Curriculum Manager</Typography>

      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: 0, borderRadius: 3, overflow: 'hidden' }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, v) => setTabValue(v)} 
          sx={{ bgcolor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}
        >
          <Tab icon={<MenuBookIcon sx={{ mr: 1 }} />} label="Syllabus" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<QuizIcon sx={{ mr: 1 }} />} label="Quizzes (MCQs)" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab icon={<CodeIcon sx={{ mr: 1 }} />} label="Challenges" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ p: 4, bgcolor: '#fff' }}>
          {tabValue === 0 && <SyllabusTab />}
          {tabValue === 1 && <QuizTab />}
          {tabValue === 2 && <ChallengeTab />}
        </Box>
      </Paper>
    </Box>
  );
};

// --- Syllabus Module ---
const SyllabusTab = () => (
  <Grid container spacing={4}>
    <Grid item xs={12} md={4}>
      <Typography variant="h6" fontWeight="bold">Syllabus Structure</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage topic descriptions and learning paths.</Typography>
      <List>
        {['Fundamentals', 'JS Core', 'Frontend', 'Node.js'].map((text, i) => (
          <ListItem key={i} button sx={{ borderRadius: 2, mb: 1, '&:hover': { bgcolor: '#f1f5f9' } }}>
            <ListItemIcon><MenuBookIcon color="primary" /></ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Button variant="outlined" startIcon={<AddCircleIcon />} fullWidth sx={{ mt: 2, borderRadius: 2 }}>
        Add New Path
      </Button>
    </Grid>

    <Grid item xs={12} md={8}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>Edit Path: Fundamentals</Typography>
          <TextField fullWidth label="Path Title" defaultValue="Fundamentals" variant="outlined" sx={{ mb: 3 }} />
          <TextField 
            fullWidth multiline rows={4} 
            label="Overview Description" 
            defaultValue="Learn core JavaScript concepts like variables, functions, and scope." 
            variant="outlined" 
            sx={{ mb: 3 }} 
          />
          <Button variant="contained" sx={{ borderRadius: 2 }}>Save Path Updates</Button>
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

// --- Quiz Module ---
const QuizTab = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h6" fontWeight="bold">Active Quizzes (MCQs)</Typography>
      <Button variant="contained" startIcon={<AddCircleIcon />} sx={{ borderRadius: 2 }}>Create Quiz</Button>
    </Box>
    <Grid container spacing={3}>
      {[1, 2].map((_, i) => (
        <Grid item xs={12} key={i}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid #e2e8f0', borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
               <QuizIcon sx={{ mr: 2, color: 'text.secondary' }} />
               <Box>
                 <Typography variant="subtitle1" fontWeight="bold">Quiz #{i + 1}: Variables & Datatypes</Typography>
                 <Typography variant="body2" color="text.secondary">Total Questions: 10 | Created 2 days ago</Typography>
               </Box>
            </Box>
            <Box>
              <Button size="small" sx={{ mr: 1 }}>Edit</Button>
              <IconButton color="error" size="small"><DeleteIcon /></IconButton>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// --- Challenge Module ---
const ChallengeTab = () => (
  <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
      <Typography variant="h6" fontWeight="bold">Coding Challenges</Typography>
      <Button variant="contained" startIcon={<AddCircleIcon />} color="secondary" sx={{ borderRadius: 2 }}>Add Challenge</Button>
    </Box>
    <Card elevation={0} sx={{ border: '1px dashed #3182ce', borderRadius: 3, p: 4, textAlign: 'center' }}>
       <CodeIcon sx={{ fontSize: 50, mb: 2, color: '#3182ce', opacity: 0.5 }} />
       <Typography variant="h6">No Challenges Added Yet</Typography>
       <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Create real-world coding problems for students to solve in the compiler.</Typography>
       <Button variant="outlined" sx={{ borderRadius: 2 }}>Launch Challenge Creator</Button>
    </Card>
  </Box>
);

export default CurriculumManager;
