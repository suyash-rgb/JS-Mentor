import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Chip, Button, TextField, Dialog, 
  DialogTitle, DialogContent, DialogActions, Rating, CircularProgress, Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import { getSubmissions, gradeSubmission } from '../../../utils/trainerService';

const GradingHub = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissions();
      setSubmissions(data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("Failed to load grading data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpen = (sub) => {
    setSelectedSubmission(sub);
    setScore(sub.grade || 0);
    setFeedback(sub.feedback || '');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;
    
    try {
      setSubmittingGrade(true);
      await gradeSubmission(selectedSubmission.id, score, feedback);
      
      // Update local state to reflect graded status immediately
      setSubmissions((prevSubmissions) => 
        prevSubmissions.map((s) => 
          s.id === selectedSubmission.id 
            ? { ...s, grade: score, feedback: feedback, status: 'GRADED' } 
            : s
        )
      );
      
      handleClose();
    } catch (err) {
      console.error("Failed to submit grade:", err);
      alert("Failed to submit grade. Please try again.");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const renderStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    if (status === 'NEW' || status === 'PENDING_REVIEW') {
      color = 'warning';
      label = 'Pending';
    } else if (status === 'GRADED') {
      color = 'success';
      label = 'Graded';
    }

    return (
      <Chip 
        label={label} 
        color={color} 
        size="small" 
        sx={{ fontWeight: 'bold' }}
      />
    );
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Grading Hub</Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
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
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No submissions found.
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>{sub.student_name}</TableCell>
                    <TableCell>{sub.exercise_title}</TableCell>
                    <TableCell>{timeAgo(sub.submitted_at)}</TableCell>
                    <TableCell>
                      {renderStatusChip(sub.status)}
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
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Detail Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Reviewing Submission: {selectedSubmission?.student_name}
          </Typography>
          <Chip label={selectedSubmission?.exercise_title} color="primary" variant="outlined" />
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {selectedSubmission?.exercise_question && (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Exercise Question:</Typography>
                <Typography variant="body2" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0', whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission.exercise_question}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Student's Code Solution:</Typography>
              <Box sx={{ 
                bgcolor: '#1e1e1e', color: '#d4d4d4', p: 2, 
                borderRadius: 2, fontFamily: 'monospace', fontSize: 13,
                maxHeight: '400px', overflowY: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission?.code_submitted || "// No code submitted"}
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
          <Button onClick={handleClose} disabled={submittingGrade}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmitGrade} 
            color="primary" 
            sx={{ borderRadius: 2 }}
            disabled={submittingGrade}
          >
            {submittingGrade ? <CircularProgress size={24} color="inherit" /> : 'Submit Grade'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GradingHub;

