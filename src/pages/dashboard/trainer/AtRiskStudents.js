import React, { useState } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Chip, Button, Avatar, Tooltip
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EventIcon from '@mui/icons-material/Event';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const AtRiskStudents = () => {
    // Dummy data representing the output of your ML high_risk_students API
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

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    At-Risk Students
                </Typography>
                <Chip
                    icon={<WarningAmberIcon />}
                    label="AI Predicted High Risk"
                    color="error"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                The following students have been flagged by the <b>ML Prediction Engine</b> as requiring
                immediate trainer intervention based on their behavioral patterns and scores.
            </Typography>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#fff5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Risk Probability</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Key Factors for Risk</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Activity</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align="center">Intervention</TableCell>
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

export default AtRiskStudents;