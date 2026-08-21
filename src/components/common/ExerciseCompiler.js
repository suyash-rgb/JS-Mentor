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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { useCompilerCore } from '../../hooks/useCompilerCore';
import InteractionModal from './InteractionModal';

const ExerciseCompiler = ({ exercise, onClose, onSubmit }) => {
  const {
    code, setCode,
    autoCompile, setAutoCompile,
    consoleOutput, setConsoleOutput,
    documentOutput,
    setIsEditorReady,
    interaction, setInteraction,
    testResults,
    executeCode
  } = useCompilerCore('// Write your solution here\n');

  const [activeTab, setActiveTab] = useState(1); 
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSidebarBlocked, setIsSidebarBlocked] = useState(false);

  const handleSubmit = () => {
    if (onSubmit) {
      let passed = 0;
      let total = 0;
      if (exercise.testCases && exercise.testCases.length > 0) {
        total = exercise.testCases.length;
        if (testResults) {
          passed = testResults.filter(t => t.passed).length;
        }
      }
      onSubmit(exercise.id, code, warningCount, 'completed', 100, passed, total);
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

    // Multi-monitor Check
    if (window.screen && typeof window.screen.isExtended !== 'undefined') {
      if (window.screen.isExtended) {
        handleSecurityEvent('Multiple monitors detected');
      }
    }

    // DevTools Detached Check (Debugger Loop) - Clean of console.log to avoid extension false positives
    let debuggerInterval;
    if (process.env.NODE_ENV === 'production' || process.env.REACT_APP_ENABLE_DEVTOOLS_BLOCK === 'true') {
      debuggerInterval = setInterval(() => {
        const start = performance.now();
        debugger;
        if (performance.now() - start > 100) {
          handleSecurityEvent('DevTools active (detached)');
        }
      }, 1000);
    }

    // Intercept Console execution to detect code executed directly in Chrome Console
    const originalConsole = {
      log: window.console.log,
      info: window.console.info,
      warn: window.console.warn,
      error: window.console.error,
      dir: window.console.dir,
      debug: window.console.debug
    };

    const interceptConsole = (methodName) => {
      window.console[methodName] = function(...args) {
        const err = new Error();
        const stack = err.stack || '';
        
        // Detect if executed from DevTools console or eval (bypassing normal page scripts)
        const isConsoleEval = 
          stack.includes('<anonymous>') || 
          stack.includes('eval') || 
          stack.includes('at VM') ||
          (stack && !stack.includes('.js') && !stack.includes('bundle') && !stack.includes('node_modules'));
          
        if (isConsoleEval) {
          handleSecurityEvent('Console execution');
        }
        
        // Call original method
        if (originalConsole[methodName]) {
          originalConsole[methodName].apply(window.console, args);
        }
      };
    };

    Object.keys(originalConsole).forEach(interceptConsole);

    const baseWidthDiff = window.outerWidth - window.innerWidth;
    const baseHeightDiff = window.outerHeight - window.innerHeight;

    const checkSidebarOpen = () => {
      const widthRatio = window.innerWidth / window.outerWidth;
      const heightRatio = window.innerHeight / window.outerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      const widthDelta = widthDiff - baseWidthDiff;
      const heightDelta = heightDiff - baseHeightDiff;

      // Thresholds:
      // Docked to the side: widthRatio < 0.85 and absolute width difference > 150px
      // Docked to the bottom: heightRatio < 0.70 and absolute height difference > 250px
      const isSideDocked = widthRatio < 0.85 && widthDelta > 150;
      const isBottomDocked = heightRatio < 0.70 && heightDelta > 250;

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

    const handlePageHide = () => {
      handleSecurityEvent('Session hibernated or backgrounded');
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

    const handleKeyDown = (e) => {
      // Block F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        handleSecurityEvent('DevTools shortcut (F12)');
      }
      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C', 'K', 'i', 'j', 'c', 'k'].includes(e.key)) {
        e.preventDefault();
        handleSecurityEvent('DevTools shortcut');
      }
      // Block Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && ['U', 'u'].includes(e.key)) {
        e.preventDefault();
        handleSecurityEvent('View Source shortcut');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      if (debuggerInterval) clearInterval(debuggerInterval);
      
      // Restore original console methods
      Object.keys(originalConsole).forEach((methodName) => {
        window.console[methodName] = originalConsole[methodName];
      });
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

    // Keystroke Dynamics (Simulated Paste)
    let lastKeyTime = Date.now();
    let rapidCount = 0;
    
    editor.onDidChangeModelContent((e) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTime;
      
      // If content was added (not just deleted)
      if (e.changes.some(change => change.text.length > 0)) {
         // Check if this was a bulk insert or unnaturally fast
         // e.g. someone using a macro that types character-by-character with < 25ms delay
         if (timeDiff < 25) {
           rapidCount++;
           if (rapidCount > 10) {
              setConsoleOutput(prev => prev + "[Security]: Unnatural typing speed detected. Simulated paste blocked.\n");
              // Revert the change
              editor.trigger('keyboard', 'undo', null);
              rapidCount = 0; // reset to avoid infinite loop
           }
         } else {
           rapidCount = 0;
         }
      }
      lastKeyTime = now;
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
            <FormControlLabel
              control={
                <Switch 
                  checked={autoCompile} 
                  onChange={(e) => setAutoCompile(e.target.checked)} 
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2">Auto-Run</Typography>}
            />
            
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<PlayArrowIcon />}
              onClick={() => executeCode(exercise.testCases || [])}
              disabled={autoCompile}
              sx={{ borderRadius: "20px" }}
            >
              Run Code & Tests
            </Button>

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
                <Tab label="Test Results" />
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
              ) : activeTab === 1 ? (
                consoleOutput || '// Logs'
              ) : (
                <Box>
                  {testResults && testResults.length > 0 ? testResults.map((t, i) => (
                    <Box key={i} sx={{ color: t.passed ? 'success.main' : 'error.main', mb: 1, fontFamily: 'monospace' }}>
                      {t.passed ? '✅' : '❌'} Expected: {t.expected}
                    </Box>
                  )) : '// No tests run yet'}
                </Box>
              )}
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
