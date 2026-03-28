import React, { useState } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, Rating
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';

const GradingHub = () => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const submissions = [
    { id: 1, student: 'Alice Johnson', exercise: 'Loop Fundamentals', status: 'Pending', time: '2h ago' },
    { id: 2, student: 'Bob Smith', exercise: 'Async/Await', status: 'Graded', time: '5h ago', score: 85 },
    { id: 3, student: 'Charlie Davis', exercise: 'Array Methods', status: 'Pending', time: '1d ago' },
  ];

  const handleOpen = (sub) => {
    setSelectedSubmission(sub);
    setScore(sub.score || 0);
    setFeedback('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Grading Hub</Typography>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Exercise</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Time Submitted</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((sub) => (
              <TableRow key={sub.id} hover>
                <TableCell>{sub.student}</TableCell>
                <TableCell>{sub.exercise}</TableCell>
                <TableCell>{sub.time}</TableCell>
                <TableCell>
                  <Chip 
                    label={sub.status} 
                    color={sub.status === 'Pending' ? 'warning' : 'success'} 
                    size="small" 
                    sx={{ fontWeight: 'bold' }}
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    startIcon={<VisibilityIcon />} 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleOpen(sub)}
                    sx={{ borderRadius: 2 }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Reviewing Submission: {selectedSubmission?.student}
          </Typography>
          <Chip label={selectedSubmission?.exercise} color="primary" variant="outlined" />
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Student's Code Solution:</Typography>
              <Box sx={{ 
                bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, 
                borderRadius: 2, fontFamily: 'monospace', fontSize: 13 
              }}>
                <pre style={{ margin: 0 }}>
                  {`// Student's Code Submission\nfunction solve(n) {\n  for(let i=0; i<n; i++) {\n    console.log(i);\n  }\n}`}
                </pre>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assign Score:</Typography>
              <Rating 
                name="score-stars" 
                value={score / 20} 
                onChange={(event, newValue) => setScore(newValue * 20)}
                precision={0.5} 
                size="large"
                emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>Score: {score}/100</Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Feedback for Student:</Typography>
              <TextField
                fullWidth multiline rows={4}
                placeholder="Write specific feedback here..."
                variant="outlined"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleClose} color="primary" sx={{ borderRadius: 2 }}>
            Submit Grade
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradingHub;
