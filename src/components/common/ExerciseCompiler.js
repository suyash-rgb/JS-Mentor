import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Box, Typography, Paper, Tab, Tabs, useMediaQuery, 
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline,
  Button, Fade, Alert, AlertTitle
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

import { useCompilerCore } from '../../hooks/useCompilerCore';
import InteractionModal from './InteractionModal';

const ExerciseCompiler = ({ exercise, onClose, onSubmit }) => {
  const {
    code, setCode,
    consoleOutput, setConsoleOutput,
    documentOutput,
    setIsEditorReady,
    interaction, setInteraction
  } = useCompilerCore('// Write your solution here\n');

  const [activeTab, setActiveTab] = useState(1); 
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSidebarBlocked, setIsSidebarBlocked] = useState(false);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(exercise.id, code, warningCount, 'completed', 100);
    }
  };

  // Theme State
  const [mode, setMode] = useState('dark');
  const theme = useMemo(() => createTheme({
    palette: { mode },
  }), [mode]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const codeRef = useRef(code);

  // Keep codeRef updated with the latest code state to avoid listener churn
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Visibility & Sidebar/DevTools Tracking (Anti-Cheating)
  useEffect(() => {
    let lastHandled = 0;
    const COOLDOWN = 1000; // 1 second cooldown to prevent double increments

    const handleSecurityEvent = (type) => {
      const now = Date.now();
      if (now - lastHandled < COOLDOWN) return;
      
      lastHandled = now;
      setWarningCount(prev => {
        const newCount = prev + 1;
        if (newCount > 3) {
          // Automatic rejection
          setConsoleOutput(c => c + "[System]: Security threshold exceeded. Attempt failed.\n");
          // Use a small delay before closing to let user see the log
          setTimeout(() => {
            onSubmit(exercise.id, codeRef.current, newCount, 'failed', 0);
            onClose();
          }, 1500);
        }
        return newCount;
      });
      setShowWarning(true);
      setConsoleOutput(prev => prev + `[Security Warning]: ${type} detected at ${new Date().toLocaleTimeString()}\n`);
    };

    const checkSidebarOpen = () => {
      const widthRatio = window.innerWidth / window.outerWidth;
      const heightRatio = window.innerHeight / window.outerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      // Thresholds:
      // Docked to the side: widthRatio < 0.85 and absolute width difference > 150px
      // Docked to the bottom: heightRatio < 0.70 and absolute height difference > 250px
      const isSideDocked = widthRatio < 0.85 && widthDiff > 150;
      const isBottomDocked = heightRatio < 0.70 && heightDiff > 250;

      return isSideDocked || isBottomDocked;
    };

    // Initial check
    const initialCheck = checkSidebarOpen();
    if (initialCheck) {
      setIsSidebarBlocked(true);
      setConsoleOutput(prev => prev + `[Security Warning]: External panel/DevTools detected. Please close it to proceed.\n`);
    }

    let sidebarCurrentlyBlocked = initialCheck;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSecurityEvent('Tab switch');
      }
    };

    const handleBlur = () => {
      handleSecurityEvent('Window focus lost');
    };

    const handleResize = () => {
      const isOpen = checkSidebarOpen();
      setIsSidebarBlocked(isOpen);
      
      if (isOpen && !sidebarCurrentlyBlocked) {
        sidebarCurrentlyBlocked = true;
        handleSecurityEvent('External panel/DevTools detected');
      } else if (!isOpen && sidebarCurrentlyBlocked) {
        sidebarCurrentlyBlocked = false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', handleResize);
    };
  }, [exercise.id, onSubmit, onClose, setConsoleOutput]);

  const handleEditorMount = (editor, monaco) => {
    setIsEditorReady(true);
    
    // Strict Paste Prevention
    editor.onKeyDown((e) => {
      const { keyCode, ctrlKey, metaKey } = e;
      if ((ctrlKey || metaKey) && keyCode === monaco.KeyCode.KeyV) {
        e.preventDefault();
        e.stopPropagation();
        setConsoleOutput(prev => prev + "[Security]: Paste functionality is disabled for exercises.\n");
      }
    });

    // Block standard DOM paste (for right-click menu or other shortcuts)
    const domNode = editor.getDomNode();
    if (domNode) {
      domNode.addEventListener('paste', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setConsoleOutput(prev => prev + "[Security]: External text injection blocked.\n");
      }, true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        zIndex: 9999, backgroundColor: theme.palette.background.default,
        display: 'flex', flexDirection: 'column'
      }}>
        
        {/* Strict Header */}
        <Box sx={{ 
          p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: mode === 'dark' ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 10000
        }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Challenge: {exercise.title}</Typography>
            <Typography variant="caption" color="text.secondary">Warning Level: {warningCount}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Switch Theme">
              <IconButton onClick={toggleTheme} color="inherit">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Button 
                variant="contained" 
                color="success" 
                startIcon={<SendIcon />} 
                onClick={handleSubmit}
                sx={{ borderRadius: '20px' }}
            >
              Submit Solution
            </Button>
            <IconButton onClick={onClose} color="error">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Security Alert Overlay */}
        {isSidebarBlocked && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(15, 15, 15, 0.85)' : 'rgba(240, 240, 240, 0.85)',
            backdropFilter: 'blur(15px)',
            zIndex: 9998,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            pt: '100px',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <Box sx={{
              maxWidth: '500px',
              p: 4,
              borderRadius: '16px',
              backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}>
              <Box 
                component="span"
                sx={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(239, 83, 80, 0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#ef5350',
                  fontSize: '32px',
                  mb: 1
                }}
              >
                ⚠️
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ef5350' }}>
                Workspace Blocked
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                External sidebar, split screen, or developer tools detected. 
                To ensure a fair proctoring environment, please close the side panel or maximize your browser window to resume the challenge.
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mt: 1,
                px: 2,
                py: 1,
                borderRadius: '20px',
                backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
              }}>
                <Box sx={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ef5350',
                  animation: 'pulse 1.5s infinite ease-in-out',
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                    '50%': { transform: 'scale(1.2)', opacity: 1 },
                    '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                  }
                }} />
                <Typography variant="caption" sx={{ fontWeight: 'medium', letterSpacing: '0.5px' }}>
                  AWAITING RESOLUTION
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Security Alert Overlay */}
        <Fade in={showWarning}>
            <Alert 
                severity="warning" 
                onClose={() => setShowWarning(false)}
                sx={{ position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, minWidth: '300px' }}
            >
                <AlertTitle>Security Warning</AlertTitle>
                Switching tabs or windows is recorded. Stay on this page to ensure your progress counts.
            </Alert>
        </Fade>

        {/* Workspace */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, p: 2, overflow: 'hidden' }}>
          
          {/* Exercise Info & Editor */}
          <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, maxHeight: '200px', overflowY: 'auto', borderRadius: '12px' }}>
                <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>Task Description:</Typography>
                <Typography variant="body2">{exercise.description}</Typography>
            </Paper>
            
            <Paper elevation={4} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: "12px", overflow: 'hidden' }}>
              <Box sx={{ flex: 1 }}>
                <Editor 
                  height="100%"
                  language="javascript"
                  theme={mode === 'dark' ? 'vs-dark' : 'light'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorMount}
                  options={{ 
                    minimap: { enabled: false }, 
                    fontSize: 14, 
                    automaticLayout: true,
                    contextmenu: false, // Extra strict: disable Monaco context menu
                  }}
                />
              </Box>
            </Paper>
          </Box>

          {/* Output Container */}
          <Paper elevation={4} sx={{ flex: 0.8, display: 'flex', flexDirection: 'column', borderRadius: "12px", overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                <Tab label="UI Output" />
                <Tab label="Console" />
              </Tabs>
            </Box>
            <Box sx={{
              flex: 1, p: 2, backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fafafa',
              color: theme.palette.text.primary, fontFamily: 'monospace',
              whiteSpace: 'pre-wrap', overflow: 'auto'
            }}>
              {activeTab === 0 ? (
                documentOutput ? (
                  <div dangerouslySetInnerHTML={{ __html: documentOutput }} />
                ) : '// UI Output'
              ) : (consoleOutput || '// Logs')}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* INTERACTION MODAL */}
      <InteractionModal 
        interaction={interaction} 
        setInteraction={setInteraction} 
        mode={mode} 
        isMobile={isMobile} 
      />
    </ThemeProvider>
  );
};

export default ExerciseCompiler;
