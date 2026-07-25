import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, CircularProgress, Alert, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, TextField, 
  InputAdornment, Chip, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CodeIcon from '@mui/icons-material/Code';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { getPracticeEngagement } from '../../../services/trainerService';

const PracticeEngagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getPracticeEngagement();
        setData(res);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch practice and challenge engagement data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter(student => 
    student.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (isoString) => {
    if (!isoString || isoString === "Never") return "Never";
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box className="flex items-center justify-center min-h-[400px]">
        <CircularProgress className="text-amber-500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Typography variant="h5" className="font-extrabold text-slate-800 tracking-tight">
            Practice & Challenges Analytics
          </Typography>
          <Typography variant="body2" className="text-slate-500">
            Monitor student engagement in self-paced practice problems and weekly leaderboard challenges.
          </Typography>
        </div>

        <TextField
          size="small"
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ maxWidth: 300, width: '100%' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-slate-400 w-5 h-5" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Overview Cards */}
      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Paper className="p-5 border border-slate-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
            <CodeIcon className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="body2" className="text-slate-500 font-medium">Total Solved Problems</Typography>
            <Typography variant="h4" className="font-black text-slate-800">
              {data.reduce((acc, curr) => acc + curr.problems_solved, 0)}
            </Typography>
          </div>
        </Paper>

        <Paper className="p-5 border border-slate-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <EmojiEventsIcon className="w-6 h-6" />
          </div>
          <div>
            <Typography variant="body2" className="text-slate-500 font-medium">Weekly Participations</Typography>
            <Typography variant="h4" className="font-black text-slate-800">
              {data.reduce((acc, curr) => acc + curr.challenges_participated, 0)}
            </Typography>
          </div>
        </Paper>

        <Paper className="p-5 border border-slate-100 shadow-sm rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Avatar className="w-8 h-8 bg-emerald-500 text-white text-xs font-bold">
              {data.filter(s => s.problems_solved > 0 || s.challenges_participated > 0).length}
            </Avatar>
          </div>
          <div>
            <Typography variant="body2" className="text-slate-500 font-medium">Active Participants</Typography>
            <Typography variant="h4" className="font-black text-slate-800">
              {data.filter(s => s.problems_solved > 0 || s.challenges_participated > 0).length}
              <span className="text-sm font-medium text-slate-400 ml-1">/ {data.length}</span>
            </Typography>
          </div>
        </Paper>
      </Box>

      {/* Engagement Table */}
      <TableContainer component={Paper} className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
        <Table>
          <TableHead className="bg-slate-50">
            <TableRow>
              <TableCell className="font-bold text-slate-600 px-6 py-4">Student</TableCell>
              <TableCell className="font-bold text-slate-600 px-6 py-4">Email</TableCell>
              <TableCell className="font-bold text-slate-600 px-6 py-4 text-center">Practice Solved</TableCell>
              <TableCell className="font-bold text-slate-600 px-6 py-4 text-center">Weekly Challenges</TableCell>
              <TableCell className="font-bold text-slate-600 px-6 py-4">Last Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-slate-500">
                  No student engagement records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((student) => (
                <TableRow key={student.student_id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-slate-800">
                    <Box className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 bg-blue-100 text-blue-700 text-sm font-black">
                        {student.student_name.charAt(0)}
                      </Avatar>
                      {student.student_name}
                    </Box>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{student.email}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
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
                  <TableCell className="px-6 py-4 text-center">
                    <Chip 
                      label={`${student.challenges_participated} challenges`}
                      size="small"
                      className={`font-semibold ${
                        student.challenges_participated > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        'bg-slate-50 text-slate-500 border border-slate-200'
                      }`}
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 font-medium">
                    {formatDate(student.last_active)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PracticeEngagement;
