import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, List, ListItem, ListItemText, Button,
    CircularProgress, Alert, Chip, Divider, IconButton, Collapse
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import GroupIcon from '@mui/icons-material/Group';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import api from '../../../services/api';

const CohortsManager = () => {
    const navigate = useNavigate();
    const [cohorts, setCohorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCohort, setExpandedCohort] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/v1/trainer/cohorts');
            setCohorts(res.data);
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

    const toggleCohortExpand = (cohortId) => {
        setExpandedCohort(expandedCohort === cohortId ? null : cohortId);
    };

    const getSlotText = (index) => {
        const slots = [
            '4:00 PM – 5:00 PM IST',
            '5:00 PM – 6:00 PM IST',
            '6:00 PM – 7:00 PM IST'
        ];
        return slots[Math.min(index, slots.length - 1)];
    };

    if (loading) {
        return (
            <Box className="flex flex-col items-center justify-center p-12 gap-3">
                <CircularProgress color="primary" />
                <Typography className="text-sm text-slate-500 font-medium">Synchronizing cohorts and daily evening classes...</Typography>
            </Box>
        );
    }

    return (
        <Box className="space-y-8 p-1 sm:p-3">
            {/* Header section */}
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Box>
                    <Typography variant="h5" className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Today's Cohort Classes
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mt-0.5">
                        Your cohorts are automatically assigned and scheduled for evening Q&A sessions.
                    </Typography>
                </Box>
                <Box className="flex items-center gap-2 bg-blue-50 text-blue-700 font-semibold px-4 py-2 rounded-2xl border border-blue-100 text-xs">
                    <AccessTimeIcon className="w-4 h-4" />
                    <span>Doubt Hours: 10 AM – 4 PM | Classes: 4 PM – 7 PM IST</span>
                </Box>
            </Box>

            {error && <Alert severity="error" className="rounded-2xl shadow-sm">{error}</Alert>}

            {/* Split Screen Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cohorts Column */}
                <Box className="lg:col-span-1 space-y-4">
                    <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <GroupIcon className="w-4 h-4" /> My Cohorts
                    </Typography>
                    {cohorts.length === 0 ? (
                        <Paper className="p-8 text-center border border-slate-100 rounded-2xl bg-slate-50/50">
                            <Typography className="text-sm text-slate-400 font-medium">No students or cohorts assigned yet.</Typography>
                        </Paper>
                    ) : (
                        <div className="space-y-3">
                            {cohorts.map((cohort, index) => {
                                const isExpanded = expandedCohort === cohort.id;
                                return (
                                    <Paper key={cohort.id} className="border border-slate-150 rounded-2xl shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow">
                                        <Box 
                                            onClick={() => toggleCohortExpand(cohort.id)}
                                            className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50 transition-colors"
                                        >
                                            <Box>
                                                <Typography className="font-bold text-slate-800 text-sm">{cohort.name}</Typography>
                                                <Typography className="text-xs text-slate-400 mt-0.5 font-medium">{cohort.student_count} students assigned</Typography>
                                            </Box>
                                            <Box className="flex items-center gap-1.5">
                                                <Chip 
                                                    label={`Slot #${index + 1}`} 
                                                    size="small" 
                                                    className="bg-slate-100 text-slate-600 font-bold text-[10px] rounded-md" 
                                                />
                                                <IconButton size="small">
                                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Divider className="border-slate-100" />
                                            <Box className="p-3 bg-slate-50/30">
                                                <Typography className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Assigned Students</Typography>
                                                <List className="p-0 space-y-1">
                                                    {cohorts.find(c => c.id === cohort.id)?.students?.map((student) => (
                                                        <ListItem key={student.id} className="py-1 px-2 hover:bg-slate-100/50 rounded-lg">
                                                            <ListItemText 
                                                                primary={student.name}
                                                                primaryTypographyProps={{ className: 'text-xs font-bold text-slate-700' }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Box>
                                        </Collapse>
                                    </Paper>
                                );
                            })}
                        </div>
                    )}
                </Box>

                {/* Scheduled Classes Column */}
                <Box className="lg:col-span-2 space-y-4">
                    <Typography className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <EventIcon className="w-4 h-4" /> Today's Scheduled Lectures
                    </Typography>
                    
                    {cohorts.length === 0 ? (
                        <Paper className="p-10 text-center border border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50/50">
                            <EventIcon className="w-10 h-10 text-slate-300" />
                            <Typography className="text-sm text-slate-400 font-medium">No live lectures active.</Typography>
                        </Paper>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cohorts.map((cohort, index) => {
                                const cClass = cohort.today_class;
                                if (!cClass) return null;
                                
                                const isActive = cClass.status === 'ACTIVE';
                                const isCompleted = cClass.status === 'COMPLETED';
                                
                                return (
                                    <Paper 
                                        key={cClass.id} 
                                        className={`p-5 border rounded-2xl shadow-sm transition-all flex flex-col justify-between space-y-4 bg-white relative overflow-hidden ${
                                            isActive ? 'border-red-200 ring-2 ring-red-50' : 'border-slate-150'
                                        }`}
                                    >
                                        {/* Status header */}
                                        <Box className="space-y-1.5">
                                            <Box className="flex items-center justify-between gap-2">
                                                <Chip 
                                                    label={getSlotText(index)} 
                                                    size="small" 
                                                    className="bg-blue-50 text-blue-700 font-black text-[10px] rounded-md px-1.5" 
                                                />
                                                <Chip 
                                                    label={cClass.status} 
                                                    size="small" 
                                                    className={`text-[9px] font-black rounded-md ${
                                                        isActive ? 'bg-red-50 text-red-600' :
                                                        cClass.status === 'SCHEDULED' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-slate-100 text-slate-500'
                                                    }`} 
                                                />
                                            </Box>
                                            <Typography className="font-black text-slate-800 text-base tracking-tight pt-1">
                                                {cClass.title}
                                            </Typography>
                                            <Typography className="text-xs text-slate-400 font-semibold">
                                                Cohort: {cohort.name}
                                            </Typography>
                                            <Typography className="text-xs text-slate-500 font-bold bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100 w-fit mt-1 flex items-center gap-1.5">
                                                <AccessTimeIcon className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{cClass.duration_minutes} Mins • 1 Hour duration</span>
                                            </Typography>
                                        </Box>
                                        
                                        {/* Actions */}
                                        {isCompleted ? (
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                disabled
                                                startIcon={<CheckCircleIcon />}
                                                className="border-slate-200 text-slate-400 font-bold capitalize text-xs rounded-xl py-2.5"
                                            >
                                                Session Completed
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={() => navigate(`/classroom/${cClass.id}`)}
                                                startIcon={<PlayArrowIcon />}
                                                className={`text-white font-bold capitalize text-xs rounded-xl py-2.5 shadow-none transition-transform active:scale-95 ${
                                                    isActive ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'
                                                }`}
                                            >
                                                {isActive ? 'Resume Lecture' : 'Start Live Lecture'}
                                            </Button>
                                        )}
                                    </Paper>
                                );
                            })}
                        </div>
                    )}
                </Box>
            </div>
        </Box>
    );
};

export default CohortsManager;
