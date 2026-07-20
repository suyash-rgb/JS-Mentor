import React, { useMemo, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAuth } from '@clerk/clerk-react';
import { useCompilerCore } from '../hooks/useCompilerCore';
import {
  Box, Typography, Paper, Tab, Tabs, useMediaQuery,
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline,
  Button, Chip, Stack, CircularProgress, Badge
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CodeIcon from "@mui/icons-material/Code";
import SecurityIcon from "@mui/icons-material/Security";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TimerOutlinedIcon from "@mui/icons-material/TimerOutlined";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCompilerAi } from '../hooks/useCompilerAi';

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
  const initialSnippet = '// Write your JS code here\nconsole.log("Welcome to JS Mentor IDE!");\ndocument.write("<h3>Hello World</h3>");\n';

  const {
    code, setCode,
    autoCompile, setAutoCompile,
    consoleOutput,
    documentOutput,
    setIsEditorReady,
    executionStatus, executionTimeMs,
    interaction, setInteraction,
    executeCode, clearOutput, resetCode
  } = useCompilerCore(initialSnippet);

  const [activeTab, setActiveTab] = useState(1);
  const [copied, setCopied] = useState(false);
  const editorRef = useRef(null);

  // Auth State
  const { isSignedIn } = useAuth();

  // AI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { explanation, isLoading: loadingAI, explainError } = useCompilerAi();

  // Theme State
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#3b82f6' },
      secondary: { main: '#a855f7' },
      success: { main: '#10b981' },
      warning: { main: '#f59e0b' },
      error: { main: '#ef4444' },
      background: {
        default: mode === 'dark' ? '#0f172a' : '#f8fafc',
        paper: mode === 'dark' ? '#1e293b' : '#ffffff',
      }
    },
    shape: { borderRadius: 12 }
  }), [mode]);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    setIsEditorReady(true);

    // Bind Ctrl+Enter or Cmd+Enter to execute code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      executeCode();
    });
  };

  const handleExplainError = async () => {
    setIsModalOpen(true);
    await explainError(code, consoleOutput);
  };

  // Render Status Badge
  const renderStatusBadge = () => {
    if (executionStatus === 'running') {
      return (
        <Chip
          icon={<CircularProgress size={14} color="inherit" />}
          label="Running..."
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }
    if (executionStatus === 'success') {
      return (
        <Chip
          icon={<CheckCircleOutlineIcon fontSize="small" />}
          label={executionTimeMs !== null ? `Ready (${executionTimeMs}ms)` : 'Ready'}
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }
    if (executionStatus === 'error') {
      return (
        <Chip
          icon={<ErrorOutlineIcon fontSize="small" />}
          label="Runtime Error"
          size="small"
          color="error"
          variant="outlined"
        />
      );
    }
    if (executionStatus === 'timeout') {
      return (
        <Chip
          icon={<TimerOutlinedIcon fontSize="small" />}
          label="Execution Timed Out"
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        label="Idle"
        size="small"
        variant="outlined"
        sx={{ opacity: 0.7 }}
      />
    );
  };

  // Structured Log Lines Renderer
  const renderConsoleLogs = () => {
    if (!consoleOutput) {
      return (
        <Box sx={{ opacity: 0.5, fontStyle: 'italic', p: 1 }}>
          {'// Execution output and console.log statements will appear here...'}
        </Box>
      );
    }

    const lines = consoleOutput.split('\n');
    return lines.map((line, idx) => {
      if (!line.trim()) return null;

      let badge = null;
      let textColor = theme.palette.text.primary;
      let bgColor = 'transparent';

      if (line.includes('Error:')) {
        badge = <Chip label="ERROR" size="small" color="error" sx={{ height: 18, fontSize: '0.65rem', mr: 1, fontWeight: 'bold' }} />;
        textColor = '#f87171';
        bgColor = 'rgba(239, 68, 68, 0.08)';
      } else if (line.includes('Warning:')) {
        badge = <Chip label="WARN" size="small" color="warning" sx={{ height: 18, fontSize: '0.65rem', mr: 1, fontWeight: 'bold' }} />;
        textColor = '#fbbf24';
        bgColor = 'rgba(245, 158, 11, 0.08)';
      } else if (line.includes('[System Error]')) {
        badge = <Chip label="SYSTEM" size="small" color="secondary" sx={{ height: 18, fontSize: '0.65rem', mr: 1, fontWeight: 'bold' }} />;
        textColor = '#c084fc';
        bgColor = 'rgba(168, 85, 247, 0.08)';
      }

      return (
        <Box
          key={idx}
          sx={{
            display: 'flex', alignItems: 'flex-start', py: 0.5, px: 1,
            borderRadius: '4px', mb: 0.5, backgroundColor: bgColor,
            fontFamily: '"Fira Code", monospace, "Courier New"', fontSize: '0.875rem'
          }}
        >
          {badge}
          <Typography
            component="span"
            sx={{
              color: textColor, fontFamily: 'inherit', fontSize: 'inherit',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word'
            }}
          >
            {line}
          </Typography>
        </Box>
      );
    });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />

      <Box sx={{
        display: 'flex', flexDirection: 'column',
        height: isMobile ? 'auto' : 'calc(100vh - 120px)',
        minHeight: isMobile ? '100vh' : '650px',
        backgroundColor: theme.palette.background.default,
        p: isMobile ? 1.5 : 3, gap: 2
      }}>

        {/* IDE Top Bar Header */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            background: mode === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : '#ffffff',
            border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          {/* Title & Badges */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{
              width: 38, height: 38, borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <CodeIcon />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                  JS Mentor IDE
                </Typography>
                <Chip
                  icon={<SecurityIcon style={{ fontSize: 13 }} />}
                  label="Sandboxed v2"
                  size="small"
                  sx={{
                    height: 20, fontSize: '0.65rem', fontWeight: 700,
                    backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : '#e0f2fe',
                    color: mode === 'dark' ? '#60a5fa' : '#0369a1'
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Secure execution engine
              </Typography>
            </Box>
          </Stack>

          {/* Controls & Action Toolbar */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {renderStatusBadge()}

            <FormControlLabel
              control={
                <Switch
                  checked={autoCompile}
                  onChange={(e) => setAutoCompile(e.target.checked)}
                  color="primary"
                  size="small"
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Auto-Run</Typography>}
            />

            <Tooltip title={autoCompile ? "Auto-Run is enabled" : "Run Code (Ctrl + Enter)"}>
              <span>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PlayArrowIcon />}
                  onClick={() => executeCode()}
                  disabled={autoCompile || executionStatus === 'running'}
                  sx={{
                    borderRadius: '24px', px: 3, fontWeight: 'bold', textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Run Code
                </Button>
              </span>
            </Tooltip>

            <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton onClick={toggleTheme} color="inherit" size="small">
                {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>

        {/* Main Editor & Output Split View */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, minHeight: 0 }}>

          {/* Editor Container */}
          <Paper
            elevation={3}
            sx={{
              flex: 1.4, display: 'flex', flexDirection: 'column',
              borderRadius: '16px', overflow: 'hidden',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            }}
          >
            {/* Tab File Header */}
            <Box sx={{
              px: 2, py: 1,
              backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{
                  px: 1.5, py: 0.5, borderRadius: '8px 8px 0 0',
                  backgroundColor: mode === 'dark' ? '#1e293b' : '#ffffff',
                  display: 'flex', alignItems: 'center', gap: 1,
                  borderTop: '2px solid #f59e0b'
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'monospace', color: '#f59e0b' }}>
                    JS
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    main.js
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={0.5}>
                <Tooltip title="Copy Code">
                  <IconButton size="small" onClick={handleCopy}>
                    <ContentCopyIcon fontSize="small" color={copied ? 'success' : 'inherit'} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Code Snippet">
                  <IconButton size="small" onClick={resetCode}>
                    <RestartAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>

            {/* Monaco Editor */}
            <Box sx={{ flex: 1, position: 'relative' }}>
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
                  fontFamily: '"Fira Code", monospace, "Courier New"',
                  padding: { top: 12, bottom: 12 },
                  scrollBeyondLastLine: false
                }}
              />
            </Box>
          </Paper>

          {/* Output Container */}
          <Paper
            elevation={3}
            sx={{
              flex: 1, display: 'flex', flexDirection: 'column',
              borderRadius: '16px', overflow: 'hidden',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
            }}
          >
            {/* Tabs Header */}
            <Box sx={{
              px: 1, borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: mode === 'dark' ? '#0f172a' : '#f1f5f9',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 44 }}
              >
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>UI Output</span>
                      {documentOutput && <Badge variant="dot" color="primary" />}
                    </Stack>
                  }
                  sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
                />
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Console</span>
                      {executionStatus === 'error' && <Badge variant="dot" color="error" />}
                    </Stack>
                  }
                  sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }}
                />
              </Tabs>

              <Tooltip title="Clear Console & UI Output">
                <IconButton size="small" onClick={clearOutput} sx={{ mr: 1 }}>
                  <DeleteSweepIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Console / UI Content Container */}
            <Box sx={{
              flex: 1, p: 2,
              backgroundColor: mode === 'dark' ? '#0b0f19' : '#fafafa',
              color: theme.palette.text.primary,
              position: 'relative', overflow: 'auto'
            }}>
              {activeTab === 0 ? (
                documentOutput ? (
                  <Box
                    sx={{ p: 1, color: theme.palette.text.primary }}
                    dangerouslySetInnerHTML={{ __html: documentOutput }}
                  />
                ) : (
                  <Box sx={{ opacity: 0.5, fontStyle: 'italic', p: 1 }}>
                    {'// UI output generated via document.write() will render here...'}
                  </Box>
                )
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  {renderConsoleLogs()}
                </Box>
              )}

              {/* Floating Explain Error AI Action Button */}
              {consoleOutput.includes("Error:") && activeTab === 1 && (
                <Tooltip title={!isSignedIn ? "Sign in to unlock AI Error Explanation" : "AI Assist: Explain Error"}>
                  <Box sx={{ position: "absolute", bottom: 20, right: 20 }}>
                    <Button
                      variant="contained" color="secondary" startIcon={<AutoFixHighIcon />}
                      onClick={handleExplainError}
                      disabled={!isSignedIn}
                      sx={{
                        borderRadius: "30px", px: 2.5, fontWeight: 'bold',
                        boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                        background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                      }}
                    >
                      Explain Error
                    </Button>
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Modals */}
      <AiMentorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        loading={loadingAI}
        explanation={explanation}
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