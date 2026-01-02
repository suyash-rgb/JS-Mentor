import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography, Paper, Tab, Tabs, useTheme, useMediaQuery } from '@mui/material';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Compiler = () => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, world!");');
  const [consoleOutput, setConsoleOutput] = useState('');
  const [documentOutput, setDocumentOutput] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [isEditorReady, setIsEditorReady] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleEditorDidMount = () => {
    setIsEditorReady(true);
  };

  const executeCode = () => {
    try {
      let consoleResult = '';
      let documentResult = '';

      const originalConsoleLog = console.log;
      const originalDocumentWrite = document.write;

      // Capture only console.log output
      console.log = (...args) => {
        consoleResult += args.join(' ') + '\n';
        originalConsoleLog(...args);
      };

      // Capture only document.write output
      document.write = (...args) => {
        documentResult += args.join('') + '\n';
      };

      try {
        eval(code);
      } catch (err) {
        consoleResult += `Error: ${err.message}\n`;
      }

      // Restore original functions
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
      const timer = setTimeout(() => {
        executeCode();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady]);

  return (
    <>
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        {/* Editor */}
        <Paper elevation={isMobile ? 1 : 3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle1" sx={{
            p: 1,
            backgroundColor: theme.palette.grey[800],
            color: 'white',
            fontSize: isMobile ? '0.875rem' : '1rem'
          }}>
            JavaScript Editor
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Editor
              height={isMobile ? '250px' : '100%'}
              language="javascript"
              theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: !isMobile },
                fontSize: isMobile ? 12 : 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 10, bottom: 10 },
                lineNumbersMinChars: isMobile ? 3 : 5,
              }}
            />
          </Box>
        </Paper>

     
        <Paper elevation={isMobile ? 1 : 3} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              variant={isMobile ? 'fullWidth' : 'standard'}
            >
              <Tab label="Output" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
              <Tab label="Console" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
            </Tabs>
          </Box>
          <Box sx={{
            flex: 1,
            p: isMobile ? 1 : 2,
            overflow: 'auto',
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: isMobile ? '0.75rem' : '0.875rem'
          }}>
            {activeTab === 0 
              ? (documentOutput || 'Run code with document.write() to see output')
              : (consoleOutput || 'Console output will appear here')}
          </Box>
        </Paper>
      </Box>
    </Box>
      <Footer />
  </>
  );
};

export default Compiler;












