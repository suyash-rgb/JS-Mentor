import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Chip, CircularProgress, Alert, useMediaQuery, useTheme
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';
import { getCohortStats } from '../../../services/trainerService';

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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const stats = await getCohortStats();
                
                if (stats && stats.curriculum_mastery) {
                    stats.curriculum_mastery = stats.curriculum_mastery.map(topic => ({
                        ...topic,
                        tailwindColors: topicColors[topic.topic] || 'bg-slate-400 text-slate-400 border-slate-400'
                    }));
                }

                setCohortStats(stats);
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

        </div>
    );
};

export default StudentProgression;