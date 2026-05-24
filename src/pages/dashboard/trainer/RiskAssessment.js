import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Button, Avatar, Tooltip,
    Grid, Card, CircularProgress, Divider, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, LinearProgress
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import { getHighRiskStudents } from '../../../utils/trainerService';
import { useMentorshipCall } from '../../../hooks/useMentorshipCall';
import VideoContainer from '../../../components/call/VideoContainer';

const RiskAssessment = () => {
    const [atRiskData, setAtRiskData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Call State
    const trainerName = localStorage.getItem('trainerName') || 'Trainer';
    const [activeCallSessionId, setActiveCallSessionId] = useState(null);
    const [interveneDialogOpen, setInterveneDialogOpen] = useState(false);
    const [sessionIdInput, setSessionIdInput] = useState('');
    const [targetStudent, setTargetStudent] = useState(null);

    const callHook = useMentorshipCall(activeCallSessionId, 'TRAINER', trainerName);

    const fetchData = async () => {
        try {
            setLoading(true);
            const risks = await getHighRiskStudents();
            setAtRiskData(risks);
            setError(null);
        } catch (err) {
            console.error("Failed to load risk assessment data", err);
            setError("Failed to fetch risk predictions. Please ensure the ML service and backend are online.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleInterveneClick = (student) => {
        setTargetStudent(student);
        setInterveneDialogOpen(true);
    };

    const handleStartCall = () => {
        const sid = parseInt(sessionIdInput);
        if (!sid) return;
        setActiveCallSessionId(sid);
        setInterveneDialogOpen(false);
        setSessionIdInput('');
        setTimeout(() => callHook.initiateCall(), 500);
    };

    const filteredData = atRiskData.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
                <CircularProgress size={60} thickness={4} />
                <Typography variant="h6" color="text.secondary">Analyzing cohort risk patterns...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1a202c' }}>
                    Risk Assessment Engine
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    ML-driven batch analysis for students who have completed the first two learning paths.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#fff5f5', borderLeft: '6px solid #e53e3e' }}>
                        <Typography variant="overline" color="error.main" fontWeight="bold">Critical Attention</Typography>
                        <Typography variant="h3" fontWeight="bold">{atRiskData.length}</Typography>
                        <Typography variant="body2" color="text.secondary">High-risk students identified</Typography>
                    </Card>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <SearchIcon color="action" />
                        <TextField 
                            fullWidth 
                            variant="standard" 
                            placeholder="Filter by student name..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{ disableUnderline: true }}
                        />
                    </Paper>
                </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Risk Level</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Confidence</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Primary Factors</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Intervention</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item) => (
                                <TableRow key={item.student_id} hover>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Avatar sx={{ bgcolor: '#fee2e2', color: '#ef4444', fontWeight: 'bold' }}>
                                                {item.name.charAt(0)}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">{item.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">ID: #{item.student_id}</Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label="HIGH RISK" 
                                            color="error" 
                                            size="small" 
                                            sx={{ fontWeight: 'bold', borderRadius: 1 }} 
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {(item.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={item.risk_details?.probabilities?.HIGH * 100 || 0} 
                                                color="error"
                                                sx={{ height: 6, borderRadius: 3 }}
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                            {item.risk_details?.factors || "Multiple performance metrics below threshold (avg quiz score < 60%)"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<VideocamIcon />}
                                            onClick={() => handleInterveneClick(item)}
                                            sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}
                                        >
                                            Intervene
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                                    <SecurityIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                                    <Typography variant="h6" color="text.secondary">No students matching "high risk" criteria</Typography>
                                    <Typography variant="body2" color="text.secondary">The cohort is performing within expected safety margins.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Session ID Dialog */}
            <Dialog open={interveneDialogOpen} onClose={() => setInterveneDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Start Immediate Intervention</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Initiate a 1-on-1 mentorship call with <b>{targetStudent?.name}</b>. 
                        Please ensure you have an active session ID for this interaction.
                    </Typography>
                    <TextField
                        fullWidth
                        label="Mentorship Session ID"
                        type="number"
                        value={sessionIdInput}
                        onChange={e => setSessionIdInput(e.target.value)}
                        autoFocus
                        placeholder="e.g. 1024"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setInterveneDialogOpen(false)} sx={{ color: 'text.secondary' }}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={handleStartCall} disabled={!sessionIdInput}>
                        Launch Call
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Window */}
            {activeCallSessionId && (
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

export default RiskAssessment;
