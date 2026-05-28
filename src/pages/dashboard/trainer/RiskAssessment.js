import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Button, Avatar, Tooltip,
    Grid, Card, CircularProgress, Divider, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, LinearProgress, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { getHighRiskStudents } from '../../../utils/trainerService';
import { useMentorshipCall } from '../../../hooks/useMentorshipCall';
import VideoContainer from '../../../components/call/VideoContainer';

const RiskAssessment = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4 px-4 text-center">
                <CircularProgress size={55} thickness={4} className="text-red-500" />
                <Typography variant="h6" className="text-slate-600 font-medium text-base sm:text-lg">
                    Analyzing cohort risk patterns...
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-6 max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                    <Typography variant="h4" className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Risk Assessment Engine
                    </Typography>
                    <Typography variant="body2" className="text-slate-500 mt-1 max-w-2xl">
                        ML-driven batch analysis for students who have completed the first two learning paths.
                    </Typography>
                </div>
            </div>

            {/* Metrics & Search Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-4 bg-red-50/60 border-l-4 border-red-500 rounded-xl p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <span className="text-xs uppercase font-bold tracking-wider text-red-600 block">Critical Attention</span>
                        <span className="text-3xl font-black text-slate-900 mt-0.5 block">{atRiskData.length}</span>
                        <span className="text-xs text-slate-500 mt-0.5 block">High-risk profiles flagged</span>
                    </div>
                    <div className="p-2.5 bg-red-100/80 rounded-lg text-red-600">
                        <WarningAmberIcon className="w-6 h-6" />
                    </div>
                </div>

                <div className="md:col-span-8 bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-sm focus-within:border-blue-500 transition-colors">
                    <SearchIcon className="text-slate-400 w-5 h-5 ml-1" />
                    <input 
                        type="text"
                        className="w-full bg-transparent text-slate-800 text-sm placeholder-slate-400 focus:outline-none"
                        placeholder="Search student directories by name..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {error && <Alert severity="error" className="rounded-xl shadow-sm">{error}</Alert>}

            {/* Interactive Data List Layout */}
            {filteredData.length > 0 ? (
                isMobile ? (
                    /* Mobile Card Feed View */
                    <div className="space-y-4">
                        {filteredData.map((item) => (
                            <div key={item.student_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="bg-red-100 text-red-600 font-bold w-10 h-10 text-sm">
                                            {item.name.charAt(0)}
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">{item.name}</h3>
                                            <span className="text-xs text-slate-400 block">ID: #{item.student_id}</span>
                                        </div>
                                    </div>
                                    <Chip 
                                        label="HIGH RISK" 
                                        color="error" 
                                        size="small" 
                                        className="font-bold rounded-md text-[10px]" 
                                    />
                                </div>

                                <Divider className="border-slate-100" />

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-400 font-medium">Model Confidence:</span>
                                        <span className="text-red-600 font-bold">{(item.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%</span>
                                    </div>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={item.risk_details?.probabilities?.HIGH * 100 || 0} 
                                        color="error"
                                        className="h-2 rounded-full bg-slate-100"
                                    />
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Primary Risk Drivers</span>
                                    <p className="text-xs text-slate-600 italic leading-relaxed">
                                        "{item.risk_details?.factors || "Multiple performance metrics below threshold (avg quiz score < 60%)"}"
                                    </p>
                                </div>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    startIcon={<VideocamIcon />}
                                    onClick={() => handleInterveneClick(item)}
                                    className="bg-red-600 hover:bg-red-700 shadow-none normal-case py-2.5 font-semibold text-sm rounded-xl"
                                >
                                    Launch Intervention
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Desktop Clean Structured Grid Layout */
                    <TableContainer component={Paper} className="rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <Table>
                            <TableHead className="bg-slate-50/70 border-b border-slate-200">
                                <TableRow>
                                    <TableCell className="font-bold text-slate-700 py-4">Student</TableCell>
                                    <TableCell className="font-bold text-slate-700 py-4">Risk Level</TableCell>
                                    <TableCell className="font-bold text-slate-700 py-4">Confidence</TableCell>
                                    <TableCell className="font-bold text-slate-700 py-4">Primary Factors</TableCell>
                                    <TableCell className="font-bold text-slate-700 py-4" align="center">Intervention</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredData.map((item) => (
                                    <TableRow key={item.student_id} hover className="transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="bg-red-100 text-red-600 font-bold w-10 h-10">
                                                    {item.name.charAt(0)}
                                                </Avatar>
                                                <div>
                                                    <Typography className="font-bold text-slate-900 text-sm">{item.name}</Typography>
                                                    <Typography className="text-xs text-slate-400">ID: #{item.student_id}</Typography>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label="HIGH RISK" 
                                                color="error" 
                                                size="small" 
                                                className="font-bold rounded-md" 
                                            />
                                        </TableCell>
                                        <TableCell className="w-[180px]">
                                            <div className="flex items-center justify-between mb-1">
                                                <Typography className="text-xs font-semibold text-slate-700">
                                                    {(item.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%
                                                </Typography>
                                            </div>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={item.risk_details?.probabilities?.HIGH * 100 || 0} 
                                                color="error"
                                                className="h-1.5 rounded-full"
                                            />
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <Typography className="text-xs text-slate-600 italic line-clamp-2">
                                                {item.risk_details?.factors || "Multiple performance metrics below threshold (avg quiz score < 60%)"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<VideocamIcon />}
                                                onClick={() => handleInterveneClick(item)}
                                                className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg text-xs font-semibold normal-case shadow-none"
                                            >
                                                Intervene
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )
            ) : (
                /* Empty Fallback Screen */
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center shadow-sm">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full mb-3">
                        <SecurityIcon className="w-10 h-10" />
                    </div>
                    <h3 className="font-bold text-slate-800 text-base sm:h6">No students flagged as high risk</h3>
                    <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                        The current workspace cohort performs inside safe historical margins. No immediate actions are needed.
                    </p>
                </div>
            )}

            {/* Session ID Overlay Sheet */}
            <Dialog 
                open={interveneDialogOpen} 
                onClose={() => setInterveneDialogOpen(false)} 
                maxWidth="xs" 
                fullWidth
                fullScreen={isMobile}
                PaperProps={{
                    className: isMobile ? 'm-0 h-full max-h-none rounded-none' : 'rounded-2xl p-1'
                }}
            >
                <DialogTitle className="flex justify-between items-center border-b border-slate-100 px-5 py-4">
                    <span className="font-extrabold text-slate-900 text-lg">Start Immediate Call</span>
                    {isMobile && (
                        <IconButton onClick={() => setInterveneDialogOpen(false)} size="small" className="text-slate-400">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent className="pt-5 px-5">
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                        Initiate an instant visual 1-on-1 mentorship call with <b className="text-slate-800 font-bold">{targetStudent?.name}</b>. 
                        Please secure an active session verification ID before triggering.
                    </p>
                    <TextField
                        fullWidth
                        label="Mentorship Session ID"
                        type="number"
                        value={sessionIdInput}
                        onChange={e => setSessionIdInput(e.target.value)}
                        autoFocus
                        placeholder="e.g. 1024"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ className: 'py-3' }}
                    />
                </DialogContent>
                <DialogActions className={`px-5 py-4 border-t border-slate-100 ${isMobile ? 'flex flex-col gap-2' : ''}`}>
                    <Button 
                        onClick={() => setInterveneDialogOpen(false)} 
                        className="text-slate-500 font-semibold normal-case px-4 w-full sm:w-auto"
                        variant={isMobile ? 'outlined' : 'text'}
                        color="inherit"
                    >
                        Cancel Connection
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        onClick={handleStartCall} 
                        disabled={!sessionIdInput}
                        className={`font-semibold normal-case shadow-none px-6 w-full sm:w-auto py-2.5 sm:py-1.5 rounded-xl ${
                            !sessionIdInput ? 'bg-slate-100 text-slate-400' : 'bg-red-600 hover:bg-red-700'
                        }`}
                    >
                        Launch Call
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Floating Video Stream Matrix Container */}
            {activeCallSessionId && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
                    <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden relative shadow-2xl">
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiskAssessment;