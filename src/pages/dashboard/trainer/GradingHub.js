import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Button, TextField, Dialog,
  DialogTitle, DialogContent, DialogActions, Rating, CircularProgress, Alert,
  Card, CardContent, useMediaQuery, useTheme, IconButton, Divider
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';
import { getSubmissions, gradeSubmission } from '../../../services/trainerService';

const GradingHub = () => {
  const theme = useTheme();
  // Media query to detect if screen is mobile size (sm is usually 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Helper to sort submissions: pending first, then graded, newest first
  const sortSubmissions = (arr) => {
    const priority = { NEW: 1, PENDING_REVIEW: 1, GRADED: 2 };
    return [...arr].sort((a, b) => {
      const pA = priority[a.status] || 3;
      const pB = priority[b.status] || 3;
      if (pA !== pB) return pA - pB;
      return new Date(b.submitted_at) - new Date(a.submitted_at);
    });
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const data = await getSubmissions();
      setSubmissions(sortSubmissions(data));
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

      setSubmissions(prevSubmissions => {
        const updated = prevSubmissions.map(s =>
          s.id === selectedSubmission.id
            ? { ...s, grade: score, feedback: feedback, status: 'GRADED' }
            : s
        );
        return sortSubmissions(updated);
      });

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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        sx={{ mb: { xs: 2, sm: 4 }, fontWeight: 'bold' }}
      >
        Grading Hub
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : submissions.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">No submissions found.</Typography>
        </Paper>
      ) : isMobile ? (
        /* Mobile Layout: Stacked Cards instead of a wide table */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {submissions.map((sub) => (
            <Card key={sub.id} elevation={2} sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                      {sub.student_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {sub.exercise_title}
                    </Typography>
                  </Box>
                  {renderStatusChip(sub.status)}
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {timeAgo(sub.submitted_at)}
                  </Typography>
                  <Button
                    startIcon={<VisibilityIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => handleOpen(sub)}
                    sx={{ borderRadius: 2, px: 2 }}
                  >
                    Review
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop Layout: Standard Structured Table */
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
                  <TableCell>{sub.student_name}</TableCell>
                  <TableCell>{sub.exercise_title}</TableCell>
                  <TableCell>{timeAgo(sub.submitted_at)}</TableCell>
                  <TableCell>{renderStatusChip(sub.status)}</TableCell>
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
      )}

      {/* Detail Dialog - Becomes full screen on Mobile (`fullScreen={isMobile}`) */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pr: isMobile ? 1 : 3 
        }}>
          <Box sx={{ maxWidth: '80%' }}>
            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', mb: 0.5 }}>
              {selectedSubmission?.exercise_title}
            </Typography>
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
              Reviewing: {selectedSubmission?.student_name}
            </Typography>
          </Box>
          {isMobile ? (
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          ) : (
            <Chip label={selectedSubmission?.status === 'GRADED' ? 'Graded' : 'Pending'} color={selectedSubmission?.status === 'GRADED' ? 'success' : 'warning'} variant="outlined" />
          )}
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
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
                borderRadius: 2, fontFamily: 'monospace', fontSize: { xs: 11, sm: 13 },
                maxHeight: isMobile ? '250px' : '400px', overflowY: 'auto'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {selectedSubmission?.code_submitted || "// No code submitted"}
                </pre>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Assign Score:</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Rating
                  name="score-stars"
                  value={score / 20}
                  onChange={(event, newValue) => setScore(newValue * 20)}
                  precision={0.5}
                  size={isMobile ? "medium" : "large"}
                  emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
                />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Score: {score}/100</Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Feedback for Student:</Typography>
              <TextField
                fullWidth multiline rows={isMobile ? 3 : 4}
                placeholder="Write specific feedback here..."
                variant="outlined"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          px: 3, 
          py: 2, 
          position: isMobile ? 'sticky' : 'static', 
          bottom: 0, 
          bgcolor: 'background.paper',
          borderTop: isMobile ? '1px solid #e0e0e0' : 'none',
          justifyContent: isMobile ? 'space-between' : 'flex-end'
        }}>
          <Button onClick={handleClose} disabled={submittingGrade} variant={isMobile ? "outlined" : "text"} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitGrade}
            color="primary"
            sx={{ borderRadius: 2, px: isMobile ? 3 : 2 }}
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