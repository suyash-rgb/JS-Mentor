import React from 'react';
import { 
  Modal, Fade, Backdrop, Box, Typography, Button, CircularProgress 
} from '@mui/material';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AiMentorModal = ({ isOpen, onClose, loading, explanation, isMobile }) => {
  return (
    <Modal open={isOpen} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
      <Fade in={isOpen}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: isMobile ? "95%" : 650, bgcolor: "background.paper", borderRadius: "16px",
          boxShadow: 24, p: 4, maxHeight: "85vh", overflowY: "auto",
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
            <Box className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{explanation}</ReactMarkdown>
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
