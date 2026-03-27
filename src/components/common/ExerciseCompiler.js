import React, { useState, useEffect, useMemo } from 'react';
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

  // Visibility Tracking (Anti-Cheating)
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
            onSubmit(exercise.id, code, newCount, 'failed', 0);
            onClose();
          }, 1500);
        }
        return newCount;
      });
      setShowWarning(true);
      setConsoleOutput(prev => prev + `[Security Warning]: ${type} detected at ${new Date().toLocaleTimeString()}\n`);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSecurityEvent('Tab switch');
      }
    };

    const handleBlur = () => {
      handleSecurityEvent('Window focus lost');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [exercise.id, code, onSubmit, onClose, setConsoleOutput]);

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
          backdropFilter: 'blur(10px)'
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
