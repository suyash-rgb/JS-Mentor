import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Tabs, Tab, TextField, Button, Grid,
  Card, CardContent, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Paper, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import QuizIcon from '@mui/icons-material/Quiz';
import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { 
  getLearningPathNames, getAllQuizzes, getAllExercises, 
  deleteQuiz, getTopicsForLearningPath, addQuizCsv, addQuiz, updateQuiz,
  addExercise, updateExercise, deleteExercise, getFullCurriculum
} from '../../../utils/trainerService';
import QuizFlowModal from './QuizFlowModal';
import { useNavigate } from 'react-router-dom';

const CurriculumManager = () => {
  const [tabValue, setTabValue] = useState(0);
  const [pathNames, setPathNames] = useState([]);
  const [loadingPaths, setLoadingPaths] = useState(true);
  const [errorPaths, setErrorPaths] = useState(null);

  const [fullCurriculum, setFullCurriculum] = useState(null);

  useEffect(() => {
    const fetchPaths = async () => {
      try {
        const data = await getLearningPathNames();
        setPathNames(data);
        
        const fullData = await getFullCurriculum();
        setFullCurriculum(fullData);
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
      <Toaster position="top-right" />
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
          {tabValue === 0 && <SyllabusTab pathNames={pathNames} fullCurriculum={fullCurriculum} loading={loadingPaths} error={errorPaths} />}
          {tabValue === 1 && <QuizTab pathNames={pathNames} />}
          {tabValue === 2 && <ChallengeTab pathNames={pathNames} />}
        </Box>
      </Paper>
    </Box>
  );
};

// --- Syllabus Module ---
const SyllabusTab = ({ pathNames, fullCurriculum, loading, error }) => {
  const [selectedPath, setSelectedPath] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (pathNames.length > 0 && !selectedPath) {
      setSelectedPath(pathNames[0]);
    }
  }, [pathNames, selectedPath]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const handleEditPath = () => {
    if (!selectedPath) return;
    const url = `/trainer/curriculum/editor?path=${encodeURIComponent(selectedPath)}`;
    window.open(url, '_blank');
  };

  const handleAddPath = () => {
    const url = `/trainer/curriculum/editor`;
    window.open(url, '_blank');
  };

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
        <Button variant="outlined" startIcon={<AddCircleIcon />} fullWidth sx={{ mt: 2, borderRadius: 2 }} onClick={handleAddPath}>
          Add New Path
        </Button>
      </Grid>

      <Grid item xs={12} md={8}>
        {selectedPath ? (
          <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 5, textAlign: 'center' }}>
              <MenuBookIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.8 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>{selectedPath}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
                Open the Syllabus Editor to manage the modules, topics, descriptions, code examples, and flow for this learning path.
              </Typography>
              
              <Button variant="contained" size="large" sx={{ borderRadius: 2, px: 4, py: 1.5 }} onClick={handleEditPath}>
                Launch Syllabus Editor
              </Button>
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

  // Modals state
  const [flowModalOpen, setFlowModalOpen] = useState(false);
  const [csvModalOpen, setCsvModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Create state
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [csvTitle, setCsvTitle] = useState('');

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

  useEffect(() => {
    fetchQuizzes();
  }, [filterPath]);

  useEffect(() => {
    if (selectedPath) {
      getTopicsForLearningPath(selectedPath).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedPath]);

  const handleDelete = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await deleteQuiz(quizId);
        toast.success("Quiz deleted successfully!");
        fetchQuizzes();
      } catch (e) {
        toast.error("Failed to delete quiz.");
      }
    }
  };

  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setFlowModalOpen(true);
  };

  const handleSaveFlow = async (quizData) => {
    try {
      if (editingQuiz) {
        await updateQuiz(editingQuiz.id, quizData);
        toast.success("Quiz updated successfully!");
      } else {
        await addQuiz(selectedPath, selectedTopic, quizData);
        toast.success("Quiz created successfully!");
      }
      setFlowModalOpen(false);
      fetchQuizzes();
    } catch (e) {
      toast.error("Failed to save quiz.");
    }
  };

  const handleSaveCsv = async () => {
    if (!csvFile || !csvTitle || !selectedPath || !selectedTopic) return;
    try {
      const formData = new FormData();
      formData.append('title', csvTitle);
      formData.append('file', csvFile);

      await addQuizCsv(selectedPath, selectedTopic, formData);
      toast.success("Quiz imported successfully from CSV!");
      setCsvModalOpen(false);
      setCsvFile(null);
      setCsvTitle('');
      fetchQuizzes();
    } catch (e) {
      toast.error("Failed to import CSV.");
    }
  };

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
                <Button size="small" sx={{ mr: 1 }} onClick={() => handleEdit(quiz)}>Edit</Button>
                <IconButton color="error" size="small" onClick={() => handleDelete(quiz.id)}><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          ))
        ) : (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 3, width: '100%' }}>
            <Typography color="text.secondary">No quizzes found for the selected filter.</Typography>
          </Paper>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
          <Button variant="contained" startIcon={<AddCircleIcon />} sx={{ borderRadius: 2, px: 4 }} onClick={() => { setEditingQuiz(null); setFlowModalOpen(true); }}>
            Create New Quiz
          </Button>
          <Button variant="outlined" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 2, px: 4 }} onClick={() => setCsvModalOpen(true)}>
            Import from File
          </Button>
        </Box>
      </Box>

      {/* CSV Import Modal */}
      <Dialog open={csvModalOpen} onClose={() => setCsvModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Import Quiz from CSV</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Learning Path</InputLabel>
              <Select value={selectedPath} label="Learning Path" onChange={(e) => setSelectedPath(e.target.value)}>
                {pathNames.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" disabled={!selectedPath}>
              <InputLabel>Topic / Page</InputLabel>
              <Select value={selectedTopic} label="Topic / Page" onChange={(e) => setSelectedTopic(e.target.value)}>
                {topics.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Quiz Title" fullWidth size="small" value={csvTitle} onChange={(e) => setCsvTitle(e.target.value)} />
            <Button variant="outlined" component="label" fullWidth startIcon={<CloudUploadIcon />}>
              {csvFile ? csvFile.name : "Select CSV File"}
              <input type="file" accept=".csv" hidden onChange={(e) => setCsvFile(e.target.files[0])} />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCsvModalOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSaveCsv} variant="contained" disabled={!csvFile || !csvTitle || !selectedPath || !selectedTopic}>Import</Button>
        </DialogActions>
      </Dialog>

      {/* Flow Modal */}
      {flowModalOpen && !editingQuiz && (
        <Dialog open={flowModalOpen} onClose={() => setFlowModalOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Setup New Quiz</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Learning Path</InputLabel>
                <Select value={selectedPath} label="Learning Path" onChange={(e) => setSelectedPath(e.target.value)}>
                  {pathNames.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!selectedPath}>
                <InputLabel>Topic / Page</InputLabel>
                <Select value={selectedTopic} label="Topic / Page" onChange={(e) => setSelectedTopic(e.target.value)}>
                  {topics.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setFlowModalOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={() => setEditingQuiz({})} variant="contained" disabled={!selectedPath || !selectedTopic}>Continue to Flow</Button>
          </DialogActions>
        </Dialog>
      )}

      {flowModalOpen && editingQuiz && (
        <QuizFlowModal
          open={flowModalOpen}
          onClose={() => setFlowModalOpen(false)}
          initialData={Object.keys(editingQuiz).length > 0 ? editingQuiz : null}
          onSave={handleSaveFlow}
        />
      )}

    </Box>
  );
};

// --- Challenge Module ---
const ChallengeTab = ({ pathNames }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterPath, setFilterPath] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEx, setEditingEx] = useState(null);

  // Form State
  const [selectedPath, setSelectedPath] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    tags: ''
  });

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

  useEffect(() => {
    fetchExercises();
  }, [filterPath]);

  useEffect(() => {
    if (selectedPath) {
      getTopicsForLearningPath(selectedPath).then(setTopics).catch(console.error);
    } else {
      setTopics([]);
    }
  }, [selectedPath]);

  const handleDelete = async (exId) => {
    if (window.confirm("Are you sure you want to delete this challenge?")) {
      try {
        await deleteExercise(exId);
        toast.success("Challenge deleted successfully!");
        fetchExercises();
      } catch (e) {
        toast.error("Failed to delete challenge.");
      }
    }
  };

  const openEditModal = (ex) => {
    setEditingEx(ex);
    setSelectedPath(ex.path_heading);
    setSelectedTopic(ex.page_text);
    setFormData({
      title: ex.title,
      description: ex.description,
      difficulty: ex.difficulty,
      tags: (ex.tags || []).join(', ')
    });
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEx(null);
    setSelectedPath('');
    setSelectedTopic('');
    setFormData({
      title: '',
      description: '',
      difficulty: 'Beginner',
      tags: ''
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
      const payload = {
        title: formData.title,
        description: formData.description,
        difficulty: formData.difficulty,
        tags: tagsArray
      };

      if (editingEx) {
        await updateExercise(editingEx.id, payload);
        toast.success("Challenge updated successfully!");
      } else {
        await addExercise(selectedPath, selectedTopic, payload);
        toast.success("Challenge created successfully!");
      }
      setModalOpen(false);
      fetchExercises();
    } catch (e) {
      toast.error("Failed to save challenge.");
    }
  };

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
                <Button size="small" sx={{ mr: 1 }} onClick={() => openEditModal(ex)}>Edit</Button>
                <IconButton color="error" size="small" onClick={() => handleDelete(ex.id)}><DeleteIcon /></IconButton>
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
          <Button variant="outlined" sx={{ borderRadius: 2, px: 4 }} startIcon={<AddCircleIcon />} onClick={openCreateModal}>
            Launch Challenge Creator
          </Button>
        </Box>
      </Box>

      {/* Challenge Modal */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>
          {editingEx ? 'Edit Challenge' : 'Create New Challenge'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            {!editingEx && (
              <>
                <FormControl fullWidth size="small">
                  <InputLabel>Learning Path</InputLabel>
                  <Select value={selectedPath} label="Learning Path" onChange={(e) => setSelectedPath(e.target.value)}>
                    {pathNames.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={!selectedPath}>
                  <InputLabel>Topic / Page</InputLabel>
                  <Select value={selectedTopic} label="Topic / Page" onChange={(e) => setSelectedTopic(e.target.value)}>
                    {topics.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}
            
            <TextField 
              label="Challenge Title" fullWidth size="small" 
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
            
            <TextField 
              label="Problem Description" fullWidth multiline rows={4} 
              value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} 
            />

            <FormControl fullWidth size="small">
              <InputLabel>Difficulty</InputLabel>
              <Select value={formData.difficulty} label="Difficulty" onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <TextField 
              label="Tags (comma-separated)" fullWidth size="small" 
              placeholder="e.g. basics, arrays, logic"
              value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setModalOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            disabled={!formData.title || !formData.description || (!editingEx && (!selectedPath || !selectedTopic))}
          >
            Save Challenge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurriculumManager;
