import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, TextField, MenuItem, Dialog, DialogTitle,
    DialogContent, DialogActions, Paper, List, ListItem, ListItemText,
    Checkbox, FormControlLabel, CircularProgress, Alert, Chip, Divider
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../../../services/api';

const CohortsManager = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [cohorts, setCohorts] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dialog state
    const [cohortDialogOpen, setCohortDialogOpen] = useState(false);
    const [classDialogOpen, setClassDialogOpen] = useState(false);

    // Form inputs
    const [cohortName, setCohortName] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const [classTitle, setClassTitle] = useState('');
    const [classTopic, setClassTopic] = useState('');
    const [selectedCohortId, setSelectedCohortId] = useState('');
    const [classDate, setClassDate] = useState('');
    const [classDuration, setClassDuration] = useState(60);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cohortsRes, classesRes, studentsRes] = await Promise.all([
                api.get('/api/v1/trainer/cohorts'),
                api.get('/api/v1/trainer/classes'),
                api.get('/api/v1/trainer/students')
            ]);
            setCohorts(cohortsRes.data);
            setClasses(classesRes.data);
            setStudents(studentsRes.data);
            setError(null);
        } catch (err) {
            console.error('Failed to load cohorts/classes:', err);
            setError('Failed to fetch data from the server. Ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Create Cohort Handler
    const handleCreateCohort = async () => {
        if (!cohortName.trim() || selectedStudentIds.length === 0) return;
        try {
            await api.post('/api/v1/trainer/cohorts', {
                name: cohortName,
                student_ids: selectedStudentIds
            });
            setCohortDialogOpen(false);
            setCohortName('');
            setSelectedStudentIds([]);
            fetchData();
        } catch (err) {
            console.error('Failed to create cohort:', err);
            alert('Failed to create cohort. Try again.');
        }
    };

    // Schedule Class Handler
    const handleScheduleClass = async () => {
        if (!classTitle.trim() || !classTopic.trim() || !selectedCohortId || !classDate) return;
        try {
            await api.post('/api/v1/trainer/schedule-class', {
                cohort_id: parseInt(selectedCohortId),
                title: classTitle,
                topic: classTopic,
                scheduled_for: new Date(classDate).toISOString(),
                duration_minutes: parseInt(classDuration)
            });
            setClassDialogOpen(false);
            setClassTitle('');
            setClassTopic('');
            setSelectedCohortId('');
            setClassDate('');
            setClassDuration(60);
            fetchData();
        } catch (err) {
            console.error('Failed to schedule class:', err);
            alert('Failed to schedule class. Try again.');
        }
    };

    const handleStudentCheckboxToggle = (studentId) => {
        setSelectedStudentIds(prev => 
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const formatClassDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <Box className="flex flex-col items-center justify-center p-12 gap-3">
                <CircularProgress />
                <Typography className="text-sm text-slate-500 font-medium">Loading Cohorts & Class records...</Typography>
            </Box>
        );
    }

    return (
        <Box className="space-y-8 p-1 sm:p-3">
            {/* Header section */}
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Box>
                    <Typography variant="h5" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Cohorts & Online Classes
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mt-0.5">
                        Organize student groups, assign mentors, and schedule cohort-specific real-time lectures.
                    </Typography>
                </Box>
                <Box className="flex gap-2.5">
                    <Button
                        variant="outlined"
                        onClick={() => setCohortDialogOpen(true)}
                        startIcon={<GroupAddIcon />}
                        className="font-bold normal-case text-xs px-4 py-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl"
                    >
                        Create Cohort
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setClassDialogOpen(true)}
                        startIcon={<EventIcon />}
                        className="bg-blue-600 hover:bg-blue-700 text-xs font-bold capitalize px-4 py-2 rounded-xl shadow-none"
                    >
                        Schedule Class
                    </Button>
                </Box>
            </Box>

            {error && <Alert severity="error" className="rounded-xl shadow-sm">{error}</Alert>}

            {/* Split Screen Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cohort List Column */}
                <Box className="lg:col-span-1 space-y-4">
                    <Typography className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Cohorts</Typography>
                    {cohorts.length === 0 ? (
                        <Paper className="p-6 text-center border border-slate-200 rounded-2xl">
                            <Typography className="text-sm text-slate-400">No cohorts established yet.</Typography>
                        </Paper>
                    ) : (
                        <div className="space-y-3">
                            {cohorts.map((cohort) => (
                                <Paper key={cohort.id} className="p-4 border border-slate-200 rounded-2xl shadow-sm flex items-center justify-between">
                                    <Box>
                                        <Typography className="font-bold text-slate-800 text-sm">{cohort.name}</Typography>
                                        <Typography className="text-xs text-slate-400 mt-0.5">{cohort.student_count} students assigned</Typography>
                                    </Box>
                                    <Chip label="Cohort Assigned" size="small" className="bg-slate-50 text-slate-500 border border-slate-100 font-semibold" />
                                </Paper>
                            ))}
                        </div>
                    )}
                </Box>

                {/* Scheduled Classes Column */}
                <Box className="lg:col-span-2 space-y-4">
                    <Typography className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Group Classes</Typography>
                    {classes.length === 0 ? (
                        <Paper className="p-10 text-center border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                            <EventIcon className="w-10 h-10 text-slate-300" />
                            <Typography className="text-sm text-slate-400 font-medium">No online classes scheduled.</Typography>
                        </Paper>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {classes.map((c) => (
                                <Paper key={c.id} className="p-5 border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4">
                                    <Box className="space-y-1.5">
                                        <Box className="flex items-center justify-between gap-2">
                                            <Chip label={c.topic} size="small" className="bg-blue-50 text-blue-700 font-bold text-[10px] rounded-md" />
                                            <Chip 
                                                label={c.status} 
                                                size="small" 
                                                className={`text-[9px] font-black rounded-md ${
                                                    c.status === 'ACTIVE' ? 'bg-red-50 text-red-600' :
                                                    c.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-slate-50 text-slate-500'
                                                }`} 
                                            />
                                        </Box>
                                        <Typography className="font-bold text-slate-800 text-base tracking-tight">{c.title}</Typography>
                                        <Typography className="text-xs text-slate-400 font-medium">Target: {c.cohort_name}</Typography>
                                        <Typography className="text-xs text-slate-500 font-bold">{formatClassDate(c.scheduled_for)} ({c.duration_minutes} mins)</Typography>
                                    </Box>
                                    
                                    {(c.status === 'SCHEDULED' || c.status === 'ACTIVE') && (
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            onClick={() => navigate(`/classroom/${c.id}`)}
                                            startIcon={<PlayArrowIcon />}
                                            className="bg-red-600 hover:bg-red-700 text-white font-bold capitalize text-xs rounded-xl shadow-none py-2"
                                        >
                                            Start Live Stream
                                        </Button>
                                    )}
                                </Paper>
                            ))}
                        </div>
                    )}
                </Box>
            </div>

            {/* CREATE COHORT DIALOG */}
            <Dialog open={cohortDialogOpen} onClose={() => setCohortDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle className="font-black text-slate-900 border-b border-slate-100 py-4">Create Student Cohort</DialogTitle>
                <DialogContent className="pt-4 space-y-4">
                    <TextField
                        label="Cohort Name"
                        placeholder="e.g. JS Fullstack Summer 2026"
                        fullWidth
                        value={cohortName}
                        onChange={(e) => setCohortName(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <Divider className="my-2 border-slate-100" />
                    <Typography className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Students to Assign</Typography>
                    
                    <Box className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl p-2 bg-slate-50/50">
                        {students.length === 0 ? (
                            <Typography className="text-xs text-slate-400 p-4 text-center">No students registered.</Typography>
                        ) : (
                            students.map((student) => (
                                <FormControlLabel
                                    key={student.id}
                                    control={
                                        <Checkbox
                                            checked={selectedStudentIds.includes(student.id)}
                                            onChange={() => handleStudentCheckboxToggle(student.id)}
                                            size="small"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-800">{student.name}</span>
                                            {student.cohort_id && <span className="text-[10px] text-slate-400">Currently in cohort #{student.cohort_id}</span>}
                                        </Box>
                                    }
                                    className="w-full m-0 p-1 border-b border-slate-100 last:border-b-0 hover:bg-slate-100/50 rounded-lg transition-colors"
                                />
                            ))
                        )}
                    </Box>
                </DialogContent>
                <DialogActions className="p-4 border-t border-slate-100">
                    <Button onClick={() => setCohortDialogOpen(false)} className="text-slate-500 font-bold capitalize">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateCohort}
                        disabled={!cohortName.trim() || selectedStudentIds.length === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold capitalize rounded-lg shadow-none px-5"
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SCHEDULE CLASS DIALOG */}
            <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle className="font-black text-slate-900 border-b border-slate-100 py-4">Schedule Online Class</DialogTitle>
                <DialogContent className="pt-5 space-y-4">
                    <TextField
                        select
                        label="Target Cohort"
                        fullWidth
                        size="small"
                        value={selectedCohortId}
                        onChange={(e) => setSelectedCohortId(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    >
                        {cohorts.map((cohort) => (
                            <MenuItem key={cohort.id} value={cohort.id}>{cohort.name}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Class Title"
                        placeholder="e.g. Asynchronous Javascript Masterclass"
                        fullWidth
                        size="small"
                        value={classTitle}
                        onChange={(e) => setClassTitle(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        label="Core Topic"
                        placeholder="e.g. JS Core, Node.js"
                        fullWidth
                        size="small"
                        value={classTopic}
                        onChange={(e) => setClassTopic(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        type="datetime-local"
                        label="Date & Time"
                        fullWidth
                        size="small"
                        value={classDate}
                        onChange={(e) => setClassDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />

                    <TextField
                        type="number"
                        label="Duration (minutes)"
                        fullWidth
                        size="small"
                        value={classDuration}
                        onChange={(e) => setClassDuration(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions className="p-4 border-t border-slate-100">
                    <Button onClick={() => setClassDialogOpen(false)} className="text-slate-500 font-bold capitalize">Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleScheduleClass}
                        disabled={!classTitle.trim() || !classTopic.trim() || !selectedCohortId || !classDate}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold capitalize rounded-lg shadow-none px-5"
                    >
                        Schedule
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CohortsManager;
