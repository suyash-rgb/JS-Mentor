import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, CircularProgress, Alert, useMediaQuery, useTheme,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    TextField, InputAdornment, Avatar, Divider
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getCohortStats, getPracticeEngagement } from '../../../services/trainerService';

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
    const [practiceData, setPracticeData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [stats, practice] = await Promise.all([
                    getCohortStats(),
                    getPracticeEngagement()
                ]);
                
                if (stats && stats.curriculum_mastery) {
                    stats.curriculum_mastery = stats.curriculum_mastery.map(topic => ({
                        ...topic,
                        tailwindColors: topicColors[topic.topic] || 'bg-slate-400 text-slate-400 border-slate-400'
                    }));
                }

                setCohortStats(stats);
                setPracticeData(practice);
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

    const formatDate = (isoString) => {
        if (!isoString || isoString === "Never") return "Never";
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const filteredPracticeData = practiceData.filter(student => 
        student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-3">
                <CircularProgress size={45} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-500">Compiling cohort progress records...</span>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 bg-slate-50/30 min-h-screen">
            {/* Section 1: Curriculum Progression */}
            <div className="space-y-6">
                <div>
                    <Typography variant="h4" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                        Student Progression
                    </Typography>
                    <Typography variant="body1" className="text-slate-500 text-sm mt-1">
                        Monitor cohort-wide curriculum mastery metrics and organize structured live guidance environments.
                    </Typography>
                </div>

                {error && <Alert severity="error" className="rounded-xl shadow-sm">{error}</Alert>}

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
            </div>

            <Divider className="my-8 border-slate-200" />

            {/* Section 2: Self-Paced Practice & Challenges */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Typography variant="h5" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                            Practice & Challenges Analytics
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 mt-0.5">
                            Monitor student engagement in self-paced practice problems and weekly leaderboard challenges.
                        </Typography>
                    </div>

                    <TextField
                        size="small"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ maxWidth: 300, width: '100%', bg: 'white', borderRadius: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon className="text-slate-400 w-5 h-5" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </div>

                {/* Practice Analytics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Paper className="p-5 border border-slate-200 shadow-sm rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                            <CodeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="body2" className="text-slate-500 font-medium">Total Solved Problems</Typography>
                            <Typography variant="h4" className="font-black text-slate-800 leading-tight">
                                {practiceData.reduce((acc, curr) => acc + curr.problems_solved, 0)}
                            </Typography>
                        </div>
                    </Paper>

                    <Paper className="p-5 border border-slate-200 shadow-sm rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                            <EmojiEventsIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <Typography variant="body2" className="text-slate-500 font-medium">Weekly Participations</Typography>
                            <Typography variant="h4" className="font-black text-slate-800 leading-tight">
                                {practiceData.reduce((acc, curr) => acc + curr.challenges_participated, 0)}
                            </Typography>
                        </div>
                    </Paper>

                    <Paper className="p-5 border border-slate-200 shadow-sm rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                            <Avatar className="w-8 h-8 bg-emerald-500 text-white text-xs font-bold">
                                {practiceData.filter(s => s.problems_solved > 0 || s.challenges_participated > 0).length}
                            </Avatar>
                        </div>
                        <div>
                            <Typography variant="body2" className="text-slate-500 font-medium">Active Participants</Typography>
                            <Typography variant="h4" className="font-black text-slate-800 leading-tight">
                                {practiceData.filter(s => s.problems_solved > 0 || s.challenges_participated > 0).length}
                                <span className="text-sm font-medium text-slate-400 ml-1">/ {practiceData.length}</span>
                            </Typography>
                        </div>
                    </Paper>
                </div>

                {/* Practice & Challenges Engagement Table */}
                <TableContainer component={Paper} className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                    <Table>
                        <TableHead className="bg-slate-50/70 border-b border-slate-200">
                            <TableRow>
                                <TableCell className="font-bold text-slate-700 py-4">Student</TableCell>
                                <TableCell className="font-bold text-slate-700 py-4">Email</TableCell>
                                <TableCell className="font-bold text-slate-700 py-4 text-center">Practice Questions</TableCell>
                                <TableCell className="font-bold text-slate-700 py-4 text-center">Weekly Challenges</TableCell>
                                <TableCell className="font-bold text-slate-700 py-4">Last Active</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPracticeData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                                        No student engagement records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPracticeData.map((student) => (
                                    <TableRow key={student.student_id} className="hover:bg-slate-50/60 transition-colors">
                                        <TableCell className="py-4 font-bold text-slate-800">
                                            <Box className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8 bg-blue-100 text-blue-700 text-sm font-black">
                                                    {student.student_name.charAt(0)}
                                                </Avatar>
                                                {student.student_name}
                                            </Box>
                                        </TableCell>
                                        <TableCell className="py-4 text-slate-600">{student.email}</TableCell>
                                        <TableCell className="py-4 text-center">
                                            <Chip 
                                                label={`${student.problems_solved} solved`}
                                                size="small"
                                                className={`font-semibold ${
                                                    student.problems_solved > 10 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                    student.problems_solved > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                    'bg-slate-50 text-slate-500 border border-slate-200'
                                                }`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4 text-center">
                                            <Chip 
                                                label={`${student.challenges_participated} challenges`}
                                                size="small"
                                                className={`font-semibold ${
                                                    student.challenges_participated > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                                    'bg-slate-50 text-slate-500 border border-slate-200'
                                                }`}
                                            />
                                        </TableCell>
                                        <TableCell className="py-4 text-slate-600 font-medium">
                                            {formatDate(student.last_active)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        </div>
    );
};

export default StudentProgression;