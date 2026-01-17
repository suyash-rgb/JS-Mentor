import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Box, Typography, Paper, Tab, Tabs, useTheme, useMediaQuery } from '@mui/material';

const Compiler = () => {
  const [code, setCode] = useState('// Write your code here\nconsole.log("Hello, world!");\ndocument.write("Hello from the Hub!");');
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

      // 1. Save original global functions
      const originalConsoleLog = console.log;
      const originalDocumentWrite = document.write;

      // 2. Mock console.log to capture output
      console.log = (...args) => {
        consoleResult += args.join(' ') + '\n';
        originalConsoleLog(...args);
      };

      // 3. Mock document.write to prevent DOM destruction (The FIX)
      document.write = (...args) => {
        documentResult += args.join('') + '\n';
      };

      try {
        // Run user code
        eval(code);
      } catch (err) {
        consoleResult += `Error: ${err.message}\n`;
      }

      // 4. Restore original functions immediately after execution
      console.log = originalConsoleLog;
      document.write = originalDocumentWrite;
      
      setConsoleOutput(consoleResult);
      setDocumentOutput(documentResult);
    } catch (error) {
      setConsoleOutput(`Error: ${error.message}`);
    }
  };

  // Auto-run logic when code changes
  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => {
        executeCode();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady]);

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? 'auto' : '70vh',
      backgroundColor: 'transparent', // Let parent handle background
      gap: 2,
      mt: 2
    }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
        {/* Code Editor Pane */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
          <Typography variant="subtitle2" sx={{ p: 1, backgroundColor: '#333', color: '#fff', textAlign: 'center' }}>
            JavaScript Editor
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Editor
              height={isMobile ? '300px' : '100%'}
              language="javascript"
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                alwaysConsumeMouseWheel: false, 
              }}
            />
          </Box>
        </Paper>

        {/* Output/Console Pane */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: '#f5f5f5' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, v) => setActiveTab(v)} 
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Page Output" />
              <Tab label="Console" />
            </Tabs>
          </Box>
          <Box sx={{
            flex: 1,
            p: 2,
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: '"Fira Code", monospace',
            whiteSpace: 'pre-wrap',
            overflow: 'auto',
            fontSize: '0.9rem'
          }}>
            {activeTab === 0 
              ? (documentOutput || 'Use document.write() to see content here...') 
              : (consoleOutput || 'Console logs will appear here...')}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Compiler;