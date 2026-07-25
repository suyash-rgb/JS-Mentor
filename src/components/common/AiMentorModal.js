import React from 'react';
import { 
  Modal, Fade, Backdrop, Box, Typography, Button, CircularProgress 
} from '@mui/material';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import '../../pages/Ai.css';

const AiMentorModal = ({ isOpen, onClose, loading, explanation, isMobile }) => {
  return (
    <Modal 
      open={Boolean(isOpen)} 
      onClose={onClose} 
      closeAfterTransition 
      slots={{ backdrop: Backdrop }} 
      slotProps={{ backdrop: { timeout: 500 } }}
      sx={{ zIndex: 13000 }}
    >
      <Fade in={Boolean(isOpen)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: isMobile ? "95%" : 650, bgcolor: "background.paper", borderRadius: "16px",
          boxShadow: 24, p: 4, maxHeight: "85vh", overflowY: "auto", outline: 'none'
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <AutoFixHighIcon color="secondary" />
            <Typography variant="h5" color="secondary" sx={{ fontWeight: "bold" }}>AI Mentor Feedback</Typography>
          </Box>
          {loading ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
              <CircularProgress color="secondary" />
              <Typography variant="body2">Analyzing your code...</Typography>
            </Box>
          ) : (
            <Box className="markdown-content" sx={{ color: 'text.primary' }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation || 'No explanation returned.'}</ReactMarkdown>
              <Button onClick={onClose} sx={{ mt: 4 }} variant="contained" fullWidth color="primary">
                Understood
              </Button>
            </Box>
          )}
        </Box>
      </Fade>
    </Modal>
  );
};

export default AiMentorModal;
