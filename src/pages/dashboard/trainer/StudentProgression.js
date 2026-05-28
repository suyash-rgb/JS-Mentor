import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Chip, Button, Avatar, Tooltip,
    Grid, Card, CircularProgress, Divider, Alert, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, IconButton, useMediaQuery, useTheme
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VideocamIcon from '@mui/icons-material/Videocam';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import CloseIcon from '@mui/icons-material/Close';
import { getCohortStats, getHighRiskStudents } from '../../../utils/trainerService';
import { useMentorshipCall } from '../../../hooks/useMentorshipCall';
import VideoContainer from '../../../components/call/VideoContainer';

const topicColors = {
    "Fundamentals": 'bg-orange-500 text-orange-500 border-orange-500',
    "JS Core": 'bg-blue-500 text-blue-500 border-blue-500',
    "Frontend": 'bg-sky-400 text-sky-400 border-sky-400',
    "Node.js": 'bg-green-500 text-green-500 border-green-500'
};

const StudentProgression = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [cohortStats, setCohortStats] = useState(null);
    const [atRiskData, setAtRiskData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Call State
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
                
                if (stats && stats.curriculum_mastery) {
                    stats.curriculum_mastery = stats.curriculum_mastery.map(topic => ({
                        ...topic,
                        tailwindColors: topicColors[topic.topic] || 'bg-slate-400 text-slate-400 border-slate-400'
                    }));
                }

                setCohortStats(stats);
                setAtRiskData(risks);
                setError(null);
            } catch (error) {
                console.error("Failed to load student progression data", error);
                setError("Failed to load progression analytics. Please ensure the backend server is operational.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const MasteryDonut = ({ title, percentage, tailwindColorClass }) => {
        const cleanColor = tailwindColorClass.split(' ')[1]; // Extract pure text color class name
        return (
            <div className="flex flex-col items-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100 min-w-[140px] flex-1 sm:flex-initial">
                <div className="relative inline-flex">
                    <CircularProgress variant="determinate" value={100} size={75} thickness={4.5} className="text-slate-100" />
                    <CircularProgress 
                        variant="determinate" 
                        value={percentage} 
                        size={75} 
                        thickness={4.5} 
                        className={`absolute left-0 ${cleanColor}`} 
                    />
                    <div className="top-0 left-0 bottom-0 right-0 absolute flex items-center justify-center">
                        <span className="text-sm font-extrabold text-slate-800">{Math.round(percentage)}%</span>
                    </div>
                </div>
                <h4 className="mt-3 text-xs font-bold text-slate-700 text-center line-clamp-1">{title}</h4>
                <span className="text-[10px] text-slate-400 mt-0.5">Avg. Completion</span>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
                <CircularProgress size={45} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-500">Compiling cohort progress records...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 bg-slate-50/30 min-h-screen">
            {/* Header Content Section */}
            <div>
                <Typography variant="h4" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Student Progression
                </Typography>
                <Typography variant="body1" className="text-slate-500 text-sm mt-1">
                    Monitor cohort-wide curriculum mastery metrics and organize structured live guidance environments.
                </Typography>
            </div>

            {error && <Alert severity="error" className="rounded-xl shadow-sm">{error}</Alert>}

            {/* Core Snapshot Analytics Row */}
            {cohortStats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Metric 1 */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <SchoolIcon fontSize="medium" />
                            </div>
                            <div>
                                <span className="text-2xl font-black text-slate-900 block leading-none">
                                    {cohortStats.evaluation_metrics.total_active_students}
                                </span>
                                <span className="text-xs font-semibold text-slate-400 mt-1 block">Total Active Students</span>
                            </div>
                        </div>

                        {/* Metric 2 */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <CheckCircleOutlineIcon fontSize="medium" />
                            </div>
                            <div>
                                <span className="text-2xl font-black text-slate-900 block leading-none">
                                    {cohortStats.evaluation_metrics.exercise_success_rate}%
                                </span>
                                <span className="text-xs font-semibold text-slate-400 mt-1 block">Exercise Success Rate</span>
                            </div>
                        </div>

                        {/* Metric 3 */}
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm sm:col-span-2 lg:col-span-1">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <QuizIcon fontSize="medium" />
                            </div>
                            <div>
                                <span className="text-2xl font-black text-slate-900 block leading-none">
                                    {cohortStats.evaluation_metrics.avg_quiz_score}%
                                </span>
                                <span className="text-xs font-semibold text-slate-400 mt-1 block">Cohort Avg Quiz Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart Block */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-800 mb-4">Curriculum Mastery (Cohort Average)</h3>
                        <div className="flex flex-wrap gap-3 justify-between sm:justify-start">
                            {cohortStats.curriculum_mastery.map((topic, index) => (
                                <MasteryDonut 
                                    key={index} 
                                    title={topic.topic} 
                                    percentage={topic.average_completion} 
                                    tailwindColorClass={topic.tailwindColors} 
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-header Controls Section */}
            <div className="flex items-center gap-2.5 pt-2">
                <Typography variant="h5" className="text-lg sm:text-xl font-bold text-slate-900">
                    Intervention Required
                </Typography>
                <Chip
                    icon={<WarningAmberIcon className="!text-[14px]" />}
                    label="AI Predicted High Risk"
                    color="error"
                    size="small"
                    className="font-bold rounded-md text-[10px] tracking-wide"
                />
            </div>

            {/* List vs Table Responsive Section */}
            {atRiskData.length > 0 ? (
                isMobile ? (
                    /* Mobile Dynamic Activity Stream Cards */
                    <div className="space-y-3">
                        {atRiskData.map((student) => (
                            <div key={student.student_id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="bg-red-50 text-red-600 font-bold w-9 h-9 text-sm">
                                            {student.name.charAt(0)}
                                        </Avatar>
                                        <div>
                                            <h4 className="font-bold text-slate-800 text-sm leading-tight">{student.name}</h4>
                                            <span className="text-[11px] text-slate-400 block mt-0.5">Last active: {student.last_active || "Unknown"}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                                        <TrendingDownIcon className="text-red-600 w-3.5 h-3.5" />
                                        <span className="text-xs font-black text-red-600">
                                            {(student.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
                                    "High risk predicted based on recent activity and performance metrics."
                                </div>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="error"
                                    startIcon={<VideocamIcon />}
                                    onClick={() => handleInterveneClick(student.name)}
                                    className="bg-red-600 hover:bg-red-700 font-semibold text-xs py-2 normal-case rounded-xl shadow-none"
                                >
                                    Join Video Session
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Desktop Clean Grid System Table */
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-red-50/50 border-b border-slate-200">
                                    <th className="p-4 font-bold text-xs text-slate-700 uppercase tracking-wider">Student</th>
                                    <th className="p-4 font-bold text-xs text-slate-700 uppercase tracking-wider text-center">Risk Probability</th>
                                    <th className="p-4 font-bold text-xs text-slate-700 uppercase tracking-wider">Key Factors for Risk</th>
                                    <th className="p-4 font-bold text-xs text-slate-700 uppercase tracking-wider">Last Activity</th>
                                    <th className="p-4 font-bold text-xs text-slate-700 uppercase tracking-wider text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {atRiskData.map((student) => (
                                    <tr key={student.student_id} className="hover:bg-slate-50/60 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="bg-red-100 text-red-600 font-extrabold w-9 h-9 text-sm">
                                                    {student.name.charAt(0)}
                                                </Avatar>
                                                <span className="font-bold text-slate-800 text-sm">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-1.5 text-red-600">
                                                <TrendingDownIcon fontSize="small" />
                                                <span className="text-base font-black">
                                                    {(student.risk_details?.probabilities?.HIGH * 100 || 0).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 max-w-xs">
                                            <p className="text-xs text-slate-600 leading-relaxed">
                                                High risk predicted based on recent activity and performance metrics.
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-500 font-medium">{student.last_active || "Unknown"}</span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <Button
                                                variant="contained"
                                                color="error"
                                                startIcon={<VideocamIcon />}
                                                size="small"
                                                onClick={() => handleInterveneClick(student.name)}
                                                className="bg-red-600 hover:bg-red-700 text-xs font-semibold normal-case shadow-none px-3 py-1.5 rounded-lg"
                                            >
                                                Join Call
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            ) : (
                /* Empty Dataset Module Layout */
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">Perfect Cohort Performance</span>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No high-risk parameters were triggered during the current curriculum assessment pass.
                    </p>
                </div>
            )}

            {/* Session Verification Drawer Overlay */}
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
                    <span className="font-extrabold text-slate-900 text-base sm:text-lg">Connect to {targetStudentName}</span>
                    {isMobile && (
                        <IconButton onClick={() => setInterveneDialogOpen(false)} size="small" className="text-slate-400">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
                </DialogTitle>
                <DialogContent className="pt-5 px-5">
                    <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
                        Input the verified validation token or <b className="text-slate-700">MentorshipSession ID</b> attached to this user's workspace profile to bridge active streams.
                    </p>
                    <TextField
                        fullWidth
                        label="Session ID"
                        type="number"
                        value={sessionIdInput}
                        onChange={e => setSessionIdInput(e.target.value)}
                        autoFocus
                        size="small"
                        placeholder="e.g. 2048"
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions className={`px-5 py-4 border-t border-slate-100 gap-2 ${isMobile ? 'flex flex-col' : ''}`}>
                    <Button 
                        onClick={() => setInterveneDialogOpen(false)}
                        className="text-slate-500 font-semibold normal-case px-4 w-full sm:w-auto"
                        variant={isMobile ? 'outlined' : 'text'}
                        color="inherit"
                    >
                        Cancel Session
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={handleStartCall} 
                        disabled={!sessionIdInput}
                        className={`font-semibold normal-case shadow-none px-5 py-2 sm:py-1 rounded-xl w-full sm:w-auto ${
                            !sessionIdInput ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                    >
                        Start Video Call
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Video Container Module Viewport */}
            {activeCallSessionId && callHook.callStatus !== callHook.CALL_STATUS.IDLE && (
                <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur flex items-center justify-center p-2 sm:p-4">
                    <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative">
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

export default StudentProgression;