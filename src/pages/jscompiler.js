import React, { useState, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Box, Typography, Paper, Tab, Tabs, useMediaQuery, 
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline 
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Compiler = () => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, world!");');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [documentOutput, setDocumentOutput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);
  
  // Theme State
  const [mode, setMode] = useState('dark');

  // Create a dynamic theme based on the mode state
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
    },
  }), [mode]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const executeCode = () => {
    try {
      let consoleResult = '';
      let documentResult = '';
      const originalConsoleLog = console.log;
      const originalDocumentWrite = document.write;

      console.log = (...args) => {
        consoleResult += args.join(' ') + '\n';
        originalConsoleLog(...args);
      };

      document.write = (...args) => {
        documentResult += args.join('') + '\n';
      };

      try {
        eval(code);
      } catch (err) {
        consoleResult += `Error: ${err.message}\n`;
      }

      console.log = originalConsoleLog;
      document.write = originalDocumentWrite;
      setConsoleOutput(consoleResult);
      setDocumentOutput(documentResult);
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => executeCode(), 500);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? 'auto' : '80vh',
        minHeight: isMobile ? '100vh' : 'auto',
        backgroundColor: theme.palette.background.default,
        p: isMobile ? 1 : 2,
        gap: isMobile ? 1 : 2
      }}>
        {/* Header with Theme Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>JS Mentor Compiler</Typography>
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
          {/* Editor Container */}
          <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Typography variant="subtitle2" sx={{ p: 1, backgroundColor: mode === 'dark' ? '#333' : '#eee' }}>
              JavaScript Editor
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Editor
                height={isMobile ? '250px' : '100%'}
                language="javascript"
                theme={mode === 'dark' ? 'vs-dark' : 'light'}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={() => setIsEditorReady(true)}
                options={{
                  minimap: { enabled: !isMobile },
                  fontSize: isMobile ? 12 : 14,
                  automaticLayout: true,
                }}
              />
            </Box>
          </Paper>

          {/* Output Container */}
          <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth">
                <Tab label="UI Output" />
                <Tab label="Console" />
              </Tabs>
            </Box>
            <Box sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              backgroundColor: mode === 'dark' ? '#1e1e1e' : '#fafafa',
              color: theme.palette.text.primary,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}>
              {activeTab === 0 ? (documentOutput || 'Run code...') : (consoleOutput || 'Logs...')}
            </Box>
          </Paper>
        </Box>
      </Box>
      <Footer />
    </ThemeProvider>
  );
};

export default Compiler;