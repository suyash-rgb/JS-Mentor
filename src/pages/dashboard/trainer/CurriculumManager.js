import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Tabs, Tab, TextField, Button, Grid, 
  Card, CardContent, IconButton, List, ListItem, 
  ListItemIcon, ListItemText, Paper, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getLearningPathNames, getAllQuizzes, getAllExercises } from '../../../utils/trainerService';

const CurriculumManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pathNames, setPathNames] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [errorPaths, setErrorPaths] = useState(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const data = await getLearningPathNames();
        setPathNames(data);
        setLoadingPaths(false);
      } catch (err) {
        setErrorPaths("Failed to load learning paths.");
        setLoadingPaths(false);
      }
    };
    fetchPaths();
  }, []);

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
          {tabValue === 0 && <SyllabusTab pathNames={pathNames} loading={loadingPaths} error={errorPaths} />}
          {tabValue === 1 && <QuizTab pathNames={pathNames} />}
          {tabValue === 2 && <ChallengeTab pathNames={pathNames} />}
        </Box>
      </Paper>
    </Box>
  );
};

// --- Syllabus Module ---
const SyllabusTab = ({ pathNames, loading, error }) => {
  const [selectedPath, setSelectedPath] = useState(null);

  useEffect(() => {
    if (pathNames.length > 0 && !selectedPath) {
      setSelectedPath(pathNames[0]);
    }
  }, [pathNames, selectedPath]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Typography variant="h6" fontWeight="bold">Syllabus Structure</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manage topic descriptions and learning paths.</Typography>
        <List>
          {pathNames.map((text, i) => (
            <ListItem 
              key={i} 
              button 
              selected={selectedPath === text}
              onClick={() => setSelectedPath(text)}
              sx={{ 
                borderRadius: 2, 
                mb: 1, 
                '&:hover': { bgcolor: '#f1f5f9' },
                '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main' }
              }}
            >
              <ListItemIcon><MenuBookIcon color={selectedPath === text ? "primary" : "inherit"} /></ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
        <Button variant="outlined" startIcon={<AddCircleIcon />} fullWidth sx={{ mt: 2, borderRadius: 2 }}>
          Add New Path
        </Button>
      </Grid>

      <Grid item xs={12} md={8}>
        {selectedPath ? (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Edit Path: {selectedPath}</Typography>
              <TextField fullWidth label="Path Title" value={selectedPath} variant="outlined" sx={{ mb: 3 }} />
              <TextField 
                fullWidth multiline rows={4} 
                label="Overview Description" 
                placeholder="Enter path overview..."
                variant="outlined" 
                sx={{ mb: 3 }} 
              />
              <Button variant="contained" sx={{ borderRadius: 2 }}>Save Path Updates</Button>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', border: '1px dashed #cbd5e1', borderRadius: 3 }}>
             <Typography color="text.secondary">Select a path to view details</Typography>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

// --- Quiz Module ---
const QuizTab = ({ pathNames }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPath, setFilterPath] = useState('All');

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const pathParam = filterPath === 'All' ? null : filterPath;
        const data = await getAllQuizzes(pathParam);
        setQuizzes(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load quizzes.");
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [filterPath]);

  if (loading && quizzes.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Active Quizzes (MCQs)</Typography>
          <Typography variant="body2" color="text.secondary">Manage assessment questions across all learning paths.</Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="path-filter-label">Filter by Path</InputLabel>
          <Select
            labelId="path-filter-label"
            value={filterPath}
            label="Filter by Path"
            onChange={(e) => setFilterPath(e.target.value)}
            startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="All">All Paths</MenuItem>
            {pathNames.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {quizzes.length > 0 ? (
          quizzes.map((quiz, i) => (
            <Paper 
              key={quiz.id || i}
              elevation={0} 
              sx={{ 
                p: 3, 
                border: '1px solid #e2e8f0', 
                borderRadius: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <QuizIcon sx={{ mr: 2, color: 'text.secondary' }} />
                 <Box>
                   <Typography variant="subtitle1" fontWeight="bold">{quiz.title}</Typography>
                   <Typography variant="body2" color="text.secondary">
                      Path: {quiz.path_heading} | Page: {quiz.page_text} | Questions: {quiz.questions?.length || 0}
                   </Typography>
                 </Box>
              </Box>
              <Box>
                <Button size="small" sx={{ mr: 1 }}>Edit</Button>
                <IconButton color="error" size="small"><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 3, width: '100%' }}>
            <Typography color="text.secondary">No quizzes found for the selected filter.</Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="contained" startIcon={<AddCircleIcon />} sx={{ borderRadius: 2, px: 4 }}>
            Create New Quiz
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

// --- Challenge Module ---
const ChallengeTab = ({ pathNames }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPath, setFilterPath] = useState('All');

  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const pathParam = filterPath === 'All' ? null : filterPath;
        const data = await getAllExercises(pathParam);
        setExercises(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load challenges.");
        setLoading(false);
      }
    };
    fetchExercises();
  }, [filterPath]);

  if (loading && exercises.length === 0) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">Coding Challenges</Typography>
          <Typography variant="body2" color="text.secondary">Manage interactive coding problems across all learning paths.</Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="exercise-filter-label">Filter by Path</InputLabel>
          <Select
            labelId="exercise-filter-label"
            value={filterPath}
            label="Filter by Path"
            onChange={(e) => setFilterPath(e.target.value)}
            startAdornment={<FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="All">All Paths</MenuItem>
            {pathNames.map((name) => (
              <MenuItem key={name} value={name}>{name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {exercises.length > 0 ? (
          exercises.map((ex, i) => (
            <Paper 
              key={ex.id || i}
              elevation={0} 
              sx={{ 
                p: 3, 
                border: '1px solid #e2e8f0', 
                borderRadius: 3, 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <CodeIcon sx={{ mr: 2, color: '#3182ce' }} />
                 <Box>
                   <Typography variant="subtitle1" fontWeight="bold">{ex.title}</Typography>
                   <Typography variant="body2" color="text.secondary">
                      Path: {ex.path_heading} | Page: {ex.page_text} | Difficulty: {ex.difficulty || 'N/A'}
                   </Typography>
                 </Box>
              </Box>
              <Box>
                <Button size="small" sx={{ mr: 1 }}>Edit</Button>
                <IconButton color="error" size="small"><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          ))
        ) : (
          <Card elevation={0} sx={{ border: '1px dashed #3182ce', borderRadius: 3, p: 4, textAlign: 'center', width: '100%' }}>
            <CodeIcon sx={{ fontSize: 50, mb: 2, color: '#3182ce', opacity: 0.5 }} />
            <Typography variant="h6">No Challenges Found</Typography>
            <Typography variant="body2" color="text.secondary">Create real-world coding problems for students to solve in the compiler.</Typography>
          </Card>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button variant="outlined" sx={{ borderRadius: 2, px: 4 }}>
            Launch Challenge Creator
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CurriculumManager;
