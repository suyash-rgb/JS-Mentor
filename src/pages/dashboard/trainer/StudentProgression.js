import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Button, Avatar, Tooltip,
    Grid, Card, CircularProgress, Divider, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { getCohortStats, getHighRiskStudents } from '../../../utils/trainerService';
import { useMentorshipCall } from '../../../hooks/useMentorshipCall';
import VideoContainer from '../../../components/call/VideoContainer';

const topicColors = {
    "Fundamentals": '#ff6d00',
    "JS Core": '#2196f3',
    "Frontend": '#4fc3f7',
    "Node.js": '#4caf50'
};

const StudentProgression = () => {
    const [cohortStats, setCohortStats] = useState(null);
    const [atRiskData, setAtRiskData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ── Call State ──────────────────────────────────────────────────────
    const trainerName = localStorage.getItem('trainerName') || 'Trainer';
    const [activeCallSessionId, setActiveCallSessionId] = useState(null);
    const [interveneDialogOpen, setInterveneDialogOpen] = useState(false);
    const [sessionIdInput, setSessionIdInput] = useState('');
    const [targetStudentName, setTargetStudentName] = useState('');

    const callHook = useMentorshipCall(activeCallSessionId, 'TRAINER', trainerName);

    const handleInterveneClick = (studentName) => {
        setTargetStudentName(studentName);
        setInterveneDialogOpen(true);
    };

    const handleStartCall = () => {
        const sid = parseInt(sessionIdInput);
        if (!sid) return;
        setActiveCallSessionId(sid);
        setInterveneDialogOpen(false);
        setSessionIdInput('');
        // Give the hook time to set up, then initiate
        setTimeout(() => callHook.initiateCall(), 500);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [stats, risks] = await Promise.all([
                    getCohortStats(),
                    getHighRiskStudents()
                ]);
                
                // Add colors to cohort stats
                if (stats && stats.curriculum_mastery) {
                    stats.curriculum_mastery = stats.curriculum_mastery.map(topic => ({
                        ...topic,
                        color: topicColors[topic.topic] || '#9e9e9e'
                    }));
                }

                setCohortStats(stats);
                setAtRiskData(risks);
                setError(null);
            } catch (error) {
                console.error("Failed to load student progression data", error);
                setError("Failed to load progression analytics. Please ensure the backend is running.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [topicColors]);

    const MasteryDonut = ({ title, percentage, color }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                <CircularProgress variant="determinate" value={100} size={90} thickness={5} sx={{ color: '#f0f4f8' }} />
                <CircularProgress variant="determinate" value={percentage} size={90} thickness={5} sx={{ color: color, position: 'absolute', left: 0 }} />
                <Box sx={{ top: 0, left: 0, bottom: 0, right: 0, position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" component="div" color="text.secondary" fontWeight="bold">
                        {Math.round(percentage)}%
                    </Typography>
                </Box>
            </Box>
            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>{title}</Typography>
            <Typography variant="caption" color="text.secondary">Avg. Complete</Typography>
        </Box>
    );

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ p: 2 }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>Student Progression</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Monitor cohort-wide curriculum mastery and identify students requiring immediate intervention.
            </Typography>

            {cohortStats && (
                <Box sx={{ mb: 6 }}>
                    <Grid container spacing={4} sx={{ mb: 4, width: '100%', ml: 0 }}>
                        <Grid item xs={12} md={4} sx={{ pl: '0 !important' }}>
                            <Card elevation={3} sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 4, minHeight: 140, width: '100%' }}>
                                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1976d2', mr: 3, width: 70, height: 70 }}>
                                    <SchoolIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                                        {cohortStats.evaluation_metrics.total_active_students}
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.secondary">
                                        Total Active Students
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card elevation={3} sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 4, minHeight: 140, width: '100%' }}>
                                <Avatar sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', mr: 3, width: 70, height: 70 }}>
                                    <CheckCircleOutlineIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                                        {cohortStats.evaluation_metrics.exercise_success_rate}%
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.secondary">
                                        Exercise Success Rate
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card elevation={3} sx={{ borderRadius: 4, display: 'flex', alignItems: 'center', p: 4, minHeight: 140, width: '100%' }}>
                                <Avatar sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', mr: 3, width: 70, height: 70 }}>
                                    <QuizIcon fontSize="large" />
                                </Avatar>
                                <Box>
                                    <Typography variant="h3" fontWeight="800" sx={{ color: '#1e293b' }}>
                                        {cohortStats.evaluation_metrics.avg_quiz_score}%
                                    </Typography>
                                    <Typography variant="subtitle1" fontWeight="600" color="text.secondary">
                                        Cohort Avg Quiz Score
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                    <Paper elevation={3} sx={{ borderRadius: 4, p: 4 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Curriculum Mastery (Cohort Average)</Typography>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={2} justifyContent="space-around">
                            {cohortStats.curriculum_mastery.map((topic, index) => (
                                <Grid item key={index}>
                                    <MasteryDonut title={topic.topic} percentage={topic.average_completion} color={topic.color} />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
            )}

            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Intervention Required
                </Typography>
                <Chip
                    icon={<WarningAmberIcon />}
                    label="AI Predicted High Risk"
                    color="error"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 4 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#fff5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Risk Probability</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Key Factors for Risk</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Activity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {atRiskData.length > 0 ? (
                            atRiskData.map((student) => (
                                <TableRow key={student.student_id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: 'error.light', color: 'error.main' }}>
                                                {student.name.charAt(0)}
                                            </Avatar>
                                            <Typography variant="subtitle1" fontWeight={600}>{student.name}</Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <TrendingDownIcon color="error" />
                                            <Typography variant="h6" color="error.main" fontWeight="bold">
                                                {(student.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2">
                                            High risk predicted based on recent activity and performance metrics.
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{student.last_active || "Unknown"}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Tooltip title="Start 1-on-1 Video Call">
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<VideocamIcon />}
                                                size="small"
                                                onClick={() => handleInterveneClick(student.name)}
                                                sx={{ borderRadius: 2, textTransform: 'none' }}
                                            >
                                                Join Call
                                            </Button>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">No students currently at high risk.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

            {/* Session ID Dialog */}
            <Dialog open={interveneDialogOpen} onClose={() => setInterveneDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Start Call with {targetStudentName}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Enter the MentorshipSession ID linked to this student's current doubt session.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Session ID"
                        type="number"
                        value={sessionIdInput}
                        onChange={e => setSessionIdInput(e.target.value)}
                        autoFocus
                        size="small"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setInterveneDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleStartCall} disabled={!sessionIdInput}>Start Call</Button>
                </DialogActions>
            </Dialog>

            {/* Floating Video Window */}
            {activeCallSessionId && callHook.callStatus !== callHook.CALL_STATUS.IDLE && (
                <VideoContainer
                    callStatus={callHook.callStatus}
                    CALL_STATUS={callHook.CALL_STATUS}
                    localStream={callHook.localStream}
                    remoteStream={callHook.remoteStream}
                    isAudioMuted={callHook.isAudioMuted}
                    isVideoOff={callHook.isVideoOff}
                    isScreenSharing={callHook.isScreenSharing}
                    mediaStatePartner={callHook.mediaStatePartner}
                    onToggleAudio={callHook.toggleAudio}
                    onToggleVideo={callHook.toggleVideo}
                    onToggleScreenShare={callHook.toggleScreenShare}
                    onEndCall={() => { callHook.endCall(); setActiveCallSessionId(null); }}
                    userRole="TRAINER"
                />
            )}
        </Box>
    );
};

export default StudentProgression;
