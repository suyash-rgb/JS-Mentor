import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Box, Typography, Paper, Tab, Tabs, useMediaQuery, 
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline,
  Button, Modal, Fade, Backdrop, Alert, AlertTitle
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';

const ExerciseCompiler = ({ exercise, onClose, onSubmit }) => {
  const [code, setCode] = useState('// Write your solution here\n');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [documentOutput, setDocumentOutput] = useState('');
  const [activeTab, setActiveTab] = useState(1); 
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [warningCount, setWarningCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

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
  }, [exercise.id, code, onSubmit, onClose]);

  const [interaction, setInteraction] = useState({ open: false, type: '', message: '', value: '', resolve: null });
  const [executionId, setExecutionId] = useState(0);

  // Compiler logic
  const executeCode = async (currentExecutionId) => {
    try {
      let consoleResult = '';
      let documentResult = '';
      const originalConsoleLog = console.log;
      const originalDocumentWrite = document.write;

      console.log = (...args) => {
        consoleResult += args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(' ') + '\n';
        originalConsoleLog(...args);
      };

      document.write = (...args) => {
        documentResult += args.join('') + '\n';
      };

      try {
        // Transpile code to add await before prompt/confirm/alert
        // and wrap in async IIFE
        const transpiledCode = code
          .replace(/\b(prompt|confirm|alert)\s*\(/g, 'await $1(');

        const safeCode = `
          (async () => {
            const alert = async (msg) => {
              document.write('<div style="background: rgba(52, 152, 219, 0.1); border-left: 4px solid #3498db; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;"><strong>🔔 Alert:</strong> ' + msg + '</div>');
              return new Promise(resolve => {
                setInteraction({ open: true, type: 'alert', message: msg, value: '', resolve: () => {
                  setInteraction(prev => ({ ...prev, open: false }));
                  resolve();
                }});
              });
            };
            const confirm = async (msg) => {
              document.write('<div style="background: rgba(46, 204, 113, 0.1); border-left: 4px solid #2ecc71; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;"><strong>❓ Confirm:</strong> ' + msg + '</div>');
              return new Promise(resolve => {
                setInteraction({ open: true, type: 'confirm', message: msg, value: '', resolve: (val) => {
                  setInteraction(prev => ({ ...prev, open: false }));
                  resolve(val);
                }});
              });
            };
            const prompt = async (msg, def) => {
              document.write('<div style="background: rgba(155, 89, 182, 0.1); border-left: 4px solid #9b59b6; padding: 10px; margin: 8px 0; border-radius: 4px; color: inherit;"><strong>💬 Prompt:</strong> ' + msg + (def ? ' <br/><small>(Default: ' + def + ')</small>' : '') + '</div>');
              return new Promise(resolve => {
                setInteraction({ open: true, type: 'prompt', message: msg, value: def || '', resolve: (val) => {
                  setInteraction(prev => ({ ...prev, open: false }));
                  resolve(val);
                }});
              });
            };
            const print = undefined;
            
            try {
              ${transpiledCode}
              setConsoleOutput(consoleResult);
              setDocumentOutput(documentResult);
            } catch (err) {
              setConsoleOutput(consoleResult + \`Error: \${err.message}\\n\`);
            } finally {
              console.log = originalConsoleLog;
              document.write = originalDocumentWrite;
            }
          })()
        `;
        
        // Execute the async IIFE
        new Function('setInteraction', 'setConsoleOutput', 'setDocumentOutput', 'consoleResult', 'documentResult', 'originalConsoleLog', 'originalDocumentWrite', safeCode)(
          setInteraction, setConsoleOutput, setDocumentOutput, consoleResult, documentResult, originalConsoleLog, originalDocumentWrite
        );

      } catch (err) {
        consoleResult += `Error: ${err.message}\n`;
        setConsoleOutput(consoleResult);
      }
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isEditorReady) {
      const nextId = executionId + 1;
      setExecutionId(nextId);
      const timer = setTimeout(() => executeCode(nextId), 1000);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(exercise.id, code, warningCount, 'completed', 100);
    }
  };

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

      {/* Interaction Modal (Async Prompts/Confirms) */}
      <Modal 
        open={interaction.open} 
        closeAfterTransition 
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={interaction.open}>
          <Paper sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: isMobile ? '90%' : 450, bgcolor: 'background.paper', borderRadius: '16px',
            boxShadow: 24, p: 4, textAlign: 'center'
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {interaction.type === 'alert' ? '🔔 Alert' : interaction.type === 'confirm' ? '❓ Confirm' : '💬 Prompt'}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>{interaction.message}</Typography>
            
            {interaction.type === 'prompt' && (
              <Box sx={{ mb: 3 }}>
                <input 
                  type="text" 
                  value={interaction.value}
                  onChange={(e) => setInteraction({ ...interaction, value: e.target.value })}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', 
                    border: '1px solid #ccc', backgroundColor: mode === 'dark' ? '#333' : '#fff',
                    color: mode === 'dark' ? '#fff' : '#000', fontSize: '1rem'
                  }}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') interaction.resolve(interaction.value);
                  }}
                />
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              {interaction.type === 'confirm' ? (
                <>
                  <Button variant="outlined" color="error" onClick={() => interaction.resolve(false)}>Cancel</Button>
                  <Button variant="contained" color="success" onClick={() => interaction.resolve(true)}>OK</Button>
                </>
              ) : interaction.type === 'prompt' ? (
                <>
                  <Button variant="outlined" color="inherit" onClick={() => interaction.resolve(null)}>Cancel</Button>
                  <Button variant="contained" color="primary" onClick={() => interaction.resolve(interaction.value)}>Submit</Button>
                </>
              ) : (
                <Button variant="contained" onClick={() => interaction.resolve()}>OK</Button>
              )}
            </Box>
          </Paper>
        </Fade>
      </Modal>
    </ThemeProvider>
  );
};

export default ExerciseCompiler;
