import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Button, Avatar, Tooltip,
    Grid, Card, CardContent, CircularProgress, Divider
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventIcon from '@mui/icons-material/Event';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import QuizIcon from '@mui/icons-material/Quiz';

const StudentProgression = () => {
    // --- State for Cohort Analytics API ---
    const [cohortStats, setCohortStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- Dummy Data for At-Risk API ---
    const [atRiskData] = useState([
        {
            student_id: 101,
            name: "Suyash Baoney",
            risk_probability: 0.92,
            key_factors: "Low quiz scores (avg 45%), high exercise attempts (7.8 avg)",
            last_active: "2 hours ago"
        },
        {
            student_id: 105,
            name: "Amit Sharma",
            risk_probability: 0.84,
            key_factors: "Decreasing exercise correctness ratio, long inactivity (4 days)",
            last_active: "4 days ago"
        },
        {
            student_id: 112,
            name: "John Doe",
            risk_probability: 0.78,
            key_factors: "Multiple failed attempts on 'Closures' topic",
            last_active: "1 day ago"
        }
    ]);

    // Simulated API Fetch for Cohort Stats
    useEffect(() => {
        const fetchCohortStats = async () => {
            try {
                const mockResponse = {
                    curriculum_mastery: [
                        { topic: "Fundamentals", average_completion: 65.5, color: '#ff6d00' },
                        { topic: "JS Core", average_completion: 42.0, color: '#2196f3' },
                        { topic: "Frontend", average_completion: 15.8, color: '#4fc3f7' },
                        { topic: "Node.js", average_completion: 5.2, color: '#4caf50' }
                    ],
                    evaluation_metrics: {
                        avg_quiz_score: 78.4,
                        exercise_success_rate: 82.1,
                        total_active_students: 150
                    }
                };

                setTimeout(() => {
                    setCohortStats(mockResponse);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error("Failed to load cohort stats", error);
                setLoading(false);
            }
        };

        fetchCohortStats();
    }, []);

    // Helper component to render the Donut Charts
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

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>Student Progression</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Monitor cohort-wide curriculum mastery and identify students requiring immediate intervention.
            </Typography>

            {/* --- SECTION 1: COHORT HEALTH ANALYTICS --- */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
            ) : cohortStats && (
                <Box sx={{ mb: 6 }}>
                    {/* Increased spacing to 4 for clear gaps and ensured md={4} for equal width */}
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

                    {/* Donut Charts / Curriculum Mastery Card */}
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

            {/* --- SECTION 2: AT-RISK STUDENTS --- */}
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
                        {atRiskData.map((student) => (
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
                                            {(student.risk_probability * 100).toFixed(0)}%
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ maxWidth: 300 }}>
                                    <Typography variant="body2">{student.key_factors}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">{student.last_active}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Schedule a 1-on-1 session">
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<EventIcon />}
                                            size="small"
                                            sx={{ borderRadius: 2, textTransform: 'none' }}
                                        >
                                            Intervene
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentProgression;