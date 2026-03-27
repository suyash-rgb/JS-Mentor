import React, { useState, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useCompilerCore } from '../hooks/useCompilerCore';
import { 
  Box, Typography, Paper, Tab, Tabs, useMediaQuery, 
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline,
  Button
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { explainErrorWithAI } from '../utils/compilerUtils';

import InteractionModal from "../components/common/InteractionModal";
import AiMentorModal from "../components/common/AiMentorModal";

// Suppress ResizeObserver error
if (typeof window !== "undefined") {
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
    }
  });
}

const Compiler = () => {
  const {
    code, setCode,
    consoleOutput,
    documentOutput,
    setIsEditorReady,
    interaction, setInteraction
  } = useCompilerCore('// Write your code here\n');

  const [activeTab, setActiveTab] = useState(1); 
  
  // AI States
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Theme State
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme({
    palette: { mode },
  }), [mode]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // AI Logic: handleExplainError
  const handleExplainError = async () => {
    setLoadingAI(true);
    setAiExplanation("");
    setIsModalOpen(true);

    try {
      const explanation = await explainErrorWithAI(code, consoleOutput);
      setAiExplanation(explanation);
    } catch (error) {
      console.error("AI API Error:", error);
      setAiExplanation("## System Error\nI hit a snag connecting to the mentor brain.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        height: isMobile ? 'auto' : '85vh',
        minHeight: isMobile ? '100vh' : 'auto',
        backgroundColor: theme.palette.background.default,
        p: isMobile ? 1 : 3, gap: 2
      }}>
        {/* Header with Title and Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
            JS Mentor Dedicated Compiler
          </Typography>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          
          {/* Editor Container */}
          <Paper elevation={4} sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', borderRadius: "12px", overflow: 'hidden' }}>
            <Box sx={{ p: 1.5, backgroundColor: mode === 'dark' ? "#2d2d2d" : "#f5f5f5", textAlign: "center", borderBottom: `1px solid ${theme.palette.divider}` }}>
               <Typography variant="overline" sx={{ fontWeight: "bold" }}>Editor</Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: isMobile ? '300px' : 'auto' }}>
              <Editor 
                height={isMobile ? "300px" : "100%"}
                language="javascript"
                theme={mode === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={() => setIsEditorReady(true)}
                options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
              />
            </Box>
          </Paper>

          {/* Output Container */}
          <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: "12px", overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                <Tab label="UI Output" />
                <Tab label="Console" />
              </Tabs>
            </Box>
            <Box sx={{
              flex: 1, p: 2, backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fafafa',
              color: theme.palette.text.primary, fontFamily: 'monospace',
              whiteSpace: 'pre-wrap', position: 'relative', overflow: 'auto'
            }}>
              {activeTab === 0 ? (
                documentOutput ? (
                  <div dangerouslySetInnerHTML={{ __html: documentOutput }} />
                ) : '// UI Output'
              ) : (consoleOutput || '// Logs')}

              {/* Explain Error Button appears only in Console Tab when an error exists */}
              {consoleOutput.includes("Error:") && activeTab === 1 && (
                <Button 
                  variant="contained" color="secondary" startIcon={<AutoFixHighIcon />}
                  onClick={handleExplainError}
                  sx={{ position: "absolute", bottom: 20, right: 20, borderRadius: "30px" }}
                >
                  Explain Error
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* REFACTORED MODALS */}
      <AiMentorModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        loading={loadingAI} 
        explanation={aiExplanation} 
        isMobile={isMobile} 
      />

      <InteractionModal 
        interaction={interaction} 
        setInteraction={setInteraction} 
        mode={mode} 
        isMobile={isMobile} 
      />

      <Footer />
    </ThemeProvider>
  );
};

export default Compiler;