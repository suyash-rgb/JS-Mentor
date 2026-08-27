import React, { useEffect, useState } from 'react';
import { getTrainerSupervision } from '../../../../services/adminService';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Box,
  Card,
  Grid,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TrainerSupervision() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    getTrainerSupervision()
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box className="flex justify-center items-center h-96">
        <CircularProgress color="amber" />
      </Box>
    );
  }

  // Doughnut configuration: Auto grade efficiency ratio
  const autoGradeData = {
    labels: ['Auto-Reviewed (KNN Vector Engine)', 'Manual-Reviewed (Trainers)'],
    datasets: [
      {
        data: [data.autoGradeStats.autoGraded, data.autoGradeStats.manualGraded],
        backgroundColor: ['#d97706', '#475569'],
        borderColor: ['#f59e0b', '#64748b'],
        borderWidth: 1,
      }
    ]
  };

  return (
    <Box className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-slate-100 mb-6">
        Trainer Operations & SLA Supervision
      </Typography>

      {/* SLA Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Pending Evaluation Backlog
            </Typography>
            <Typography variant="h3" className="font-black text-amber-500 mt-2">
              {data.pendingReviewCount}
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              Submissions in PENDING_REVIEW queue
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Mean Time to Evaluate (MTTE)
            </Typography>
            <Typography variant="h3" className="font-black text-emerald-500 mt-2">
              {data.meanTimeToEvaluate}h
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              Average response time for human grading
            </Typography>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Auto-Grading Efficiency
            </Typography>
            <Typography variant="h3" className="font-black text-blue-400 mt-2">
              {((data.autoGradeStats.autoGraded / data.autoGradeStats.total) * 100).toFixed(1)}%
            </Typography>
            <Typography className="text-[10px] text-slate-500 mt-1">
              Ratio of submissions processed via KNN
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Main Grid: efficiency chart and trainer list */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white h-full flex flex-col justify-between">
            <div>
              <Typography className="font-bold text-slate-200 text-sm mb-4">
                Auto-Review Efficiency Ratio
              </Typography>
              <Box style={{ height: '220px' }} className="flex justify-center items-center">
                <Doughnut 
                  data={autoGradeData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }
                  }} 
                />
              </Box>
            </div>
            <Typography className="text-[11px] text-slate-400 text-center mt-4">
              KNN Vector matching successfully solved <strong>{data.autoGradeStats.autoGraded}</strong> submissions automatically, saving trainers approximately <strong>{(data.autoGradeStats.autoGraded * 0.15).toFixed(0)} hours</strong> of manual compilation review.
            </Typography>
          </Card>
        </Grid>

        {/* Trainer Audit List Table */}
        <Grid item xs={12} md={7}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Trainer SLA & Action Audit List
            </Typography>

            <TableContainer component={Paper} className="bg-transparent shadow-none border border-slate-800 rounded-xl overflow-hidden">
              <Table size="small">
                <TableHead className="bg-slate-950">
                  <TableRow>
                    <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Trainer</TableCell>
                    <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Completed</TableCell>
                    <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">MTTE SLA</TableCell>
                    <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Status</TableCell>
                    <TableCell align="right" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Accuracy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.activeTrainers.map((row) => {
                    let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
                    if (row.slaStatus === "EXCELLENT") badgeColor = "bg-emerald-950/40 text-emerald-400 border border-emerald-900";
                    if (row.slaStatus === "GOOD") badgeColor = "bg-blue-950/40 text-blue-400 border border-blue-900";
                    if (row.slaStatus === "AT_RISK") badgeColor = "bg-red-950/40 text-red-400 border border-red-900";
                    
                    return (
                      <TableRow key={row.id} className="hover:bg-slate-850/40 transition-colors">
                        <TableCell className="text-slate-300 border-b border-slate-850 font-bold text-xs py-3">{row.name}</TableCell>
                        <TableCell align="center" className="text-slate-300 border-b border-slate-850 text-xs py-3">{row.evaluationsCompleted}</TableCell>
                        <TableCell align="center" className="text-slate-300 border-b border-slate-850 text-xs py-3">{row.mtte}</TableCell>
                        <TableCell align="center" className="border-b border-slate-850 py-3 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-full font-black ${badgeColor}`}>
                            {row.slaStatus.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell align="right" className="text-slate-300 border-b border-slate-850 text-xs py-3 font-semibold text-emerald-400">{row.accuracyRating}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
