import React, { useEffect, useState } from 'react';
import { getStudentRisk } from '../../../../services/adminService';
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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function StudentRisk() {
  const [loading, setLoading] = useState(true);
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    getStudentRisk()
      .then(res => {
        setRiskData(res);
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

  return (
    <Box className="space-y-6">
      <Typography variant="h5" className="font-extrabold text-slate-100 mb-6">
        Student Academic Health & ML Risk Insights
      </Typography>

      {/* At-Risk Roster Table */}
      <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
        <Typography className="font-bold text-slate-200 text-sm mb-4 flex items-center gap-2">
          <WarningAmberIcon className="text-amber-500" /> High-Friction At-Risk Student Roster
        </Typography>

        <TableContainer component={Paper} className="bg-transparent shadow-none border border-slate-800 rounded-xl overflow-hidden">
          <Table size="small">
            <TableHead className="bg-slate-950">
              <TableRow>
                <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Student Name</TableCell>
                <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Email</TableCell>
                <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Risk Level</TableCell>
                <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Compiler Runs</TableCell>
                <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Theory Read</TableCell>
                <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Primary Friction Metric</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {riskData.atRiskStudents.map((student) => {
                let badgeColor = "bg-slate-800 text-slate-400 border-slate-700";
                if (student.riskScore === "HIGH") badgeColor = "bg-red-950/40 text-red-400 border border-red-900 animate-pulse";
                if (student.riskScore === "MEDIUM") badgeColor = "bg-amber-950/40 text-amber-400 border border-amber-900";
                if (student.riskScore === "LOW") badgeColor = "bg-blue-950/40 text-blue-400 border border-blue-900";

                return (
                  <TableRow key={student.id} className="hover:bg-slate-850/40 transition-colors">
                    <TableCell className="text-slate-300 border-b border-slate-850 font-bold text-xs py-3.5">{student.name}</TableCell>
                    <TableCell className="text-slate-400 border-b border-slate-850 text-xs py-3.5">{student.email}</TableCell>
                    <TableCell align="center" className="border-b border-slate-850 py-3.5 text-[10px]">
                      <span className={`px-2 py-0.5 rounded-full font-black ${badgeColor}`}>
                        {student.riskScore}
                      </span>
                    </TableCell>
                    <TableCell align="center" className="text-red-400 font-bold border-b border-slate-850 text-xs py-3.5">{student.failedAttempts} fails</TableCell>
                    <TableCell align="center" className="text-slate-300 border-b border-slate-850 text-xs py-3.5">{student.notesProgress}</TableCell>
                    <TableCell className="text-slate-400 border-b border-slate-850 text-xs py-3.5 max-w-sm truncate" title={student.reasons}>
                      {student.reasons}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Bottlenecks Hotspot */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Card className="bg-slate-900 border border-slate-800 p-5 rounded-2xl text-white">
            <Typography className="font-bold text-slate-200 text-sm mb-4">
              Curriculum Bottleneck Heatmap & Doubt Spikes
            </Typography>

            <TableContainer component={Paper} className="bg-transparent shadow-none border border-slate-800 rounded-xl overflow-hidden">
              <Table size="small">
                <TableHead className="bg-slate-950">
                  <TableRow>
                    <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Learning Path</TableCell>
                    <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Topic Area</TableCell>
                    <TableCell className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Exercise Name</TableCell>
                    <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Fail Ratio</TableCell>
                    <TableCell align="center" className="text-slate-300 font-bold border-b border-slate-800 py-3 text-xs">Academic Doubts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {riskData.curriculumBottlenecks.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-850/40 transition-colors">
                      <TableCell className="text-slate-300 border-b border-slate-850 text-xs py-3">{item.path}</TableCell>
                      <TableCell className="text-slate-300 border-b border-slate-850 text-xs py-3">{item.topic}</TableCell>
                      <TableCell className="text-slate-300 border-b border-slate-850 font-bold text-xs py-3 text-amber-500">{item.exercise}</TableCell>
                      <TableCell align="center" className="border-b border-slate-850 py-3 text-xs">
                        <span className="bg-red-950/60 border border-red-900 text-red-400 font-bold px-2 py-0.5 rounded text-[10px]">
                          {item.failureRate}
                        </span>
                      </TableCell>
                      <TableCell align="center" className="text-slate-300 border-b border-slate-850 text-xs py-3 font-semibold">{item.doubtsCount} tickets</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
