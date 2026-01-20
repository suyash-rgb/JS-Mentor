import React, { useState, useEffect, useMemo } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Box, Typography, Paper, Tab, Tabs, useTheme, useMediaQuery,
  Button, CircularProgress, Modal, Fade, Backdrop,
  IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline
} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

// Suppress ResizeObserver error
if (typeof window !== "undefined") {
  window.addEventListener('error', (e) => {
    if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
      e.stopImmediatePropagation();
    }
  });
}

const Compiler = () => {
  const [code, setCode] = useState("// Write your code here\n");
  const [consoleOutput, setConsoleOutput] = useState("");
  const [documentOutput, setDocumentOutput] = useState("");
  const [activeTab, setActiveTab] = useState(1);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Theme & UI States
  const [mode, setMode] = useState('dark');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiExplanation, setAiExplanation] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamic Theme Generation
  const customTheme = useMemo(() => createTheme({
    palette: { mode },
  }), [mode]);

  const isMobile = useMediaQuery(customTheme.breakpoints.down("sm"));

  const toggleTheme = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleExplainError = async () => {
    setLoadingAI(true);
    setAiExplanation("");
    setIsModalOpen(true);

    const API_URL = process.env.REACT_APP_GROK_API_URL || "https://api.groq.com/openai/v1/responses";
    const API_KEY = process.env.REACT_APP_GROK_API_KEY;

    const prompt = `You are a JavaScript expert. Explain this error briefly to a beginner. 
    Do NOT use tables. Provide a short explanation and the corrected code snippet only.
    
    CODE: ${code}
    ERROR: ${consoleOutput}`;

    try {
      const response = await axios.post(
        API_URL,
        {
          model: process.env.REACT_APP_GROK_MODEL || "openai/gpt-oss-20b",
          input: prompt,
        },
        { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" } }
      );

      let generatedText = "I couldn't generate an explanation.";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(item => item.type === "message");
        if (messageObj?.content) {
          const textObj = messageObj.content.find(c => c.type === "output_text");
          if (textObj?.text) generatedText = textObj.text;
        }
      }
      setAiExplanation(generatedText);
    } catch (error) {
      setAiExplanation("## System Error\nI hit a snag connecting to the mentor brain.");
    } finally {
      setLoadingAI(false);
    }
  };

  const executeCode = () => {
    let consoleResult = "";
    let documentResult = "";
    const originalConsoleLog = console.log;
    const originalDocumentWrite = document.write;

    console.log = (...args) => {
      consoleResult += args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ") + "\n";
      originalConsoleLog(...args);
    };
    document.write = (...args) => { documentResult += args.join("") + "\n"; };

    try {
      new Function(code)();
    } catch (err) {
      consoleResult += `Error: ${err.message}\n`;
    }

    console.log = originalConsoleLog;
    document.write = originalDocumentWrite;
    setConsoleOutput(consoleResult);
    setDocumentOutput(documentResult);
  };

  useEffect(() => {
    if (isEditorReady) {
      const timer = setTimeout(() => executeCode(), 600);
      return () => clearTimeout(timer);
    }
  }, [code, isEditorReady]);

  return (
    <ThemeProvider theme={customTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2, height: "75vh" }}>
          
          {/* Editor Section with Toggle */}
          <Paper elevation={4} sx={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" }}>
            <Box sx={{ 
              p: 1, 
              backgroundColor: mode === 'dark' ? "#2d2d2d" : "#f5f5f5", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              px: 2
            }}>
              <Typography variant="overline" sx={{ fontWeight: "bold" }}>JS Mentor Editor</Typography>
              <Tooltip title="Toggle Light/Dark Theme">
                <IconButton size="small" onClick={toggleTheme} color="inherit">
                  {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            <Editor
              height="100%"
              language="javascript"
              theme={mode === 'dark' ? 'vs-dark' : 'light'}
              value={code}
              onChange={(val) => setCode(val || "")}
              onMount={() => setIsEditorReady(true)}
              options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
            />
          </Paper>

          {/* Console Section */}
          <Paper elevation={4} sx={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: "12px", overflow: "hidden" }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="fullWidth" sx={{ bgcolor: mode === 'dark' ? "transparent" : "#f8f9fa" }}>
              <Tab label="UI Output" />
              <Tab label="Console" />
            </Tabs>
            <Box sx={{ 
              flex: 1, p: 2, 
              backgroundColor: mode === 'dark' ? "#1e1e1e" : "#fafafa", 
              position: "relative", overflow: "auto" 
            }}>
              <Typography sx={{ color: mode === 'dark' ? "#d4d4d4" : "#333", fontFamily: 'monospace', whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
                {activeTab === 0 ? documentOutput || "// UI Output" : consoleOutput || "// Logs"}
              </Typography>

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

        {/* AI Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <Fade in={isModalOpen}>
            <Box sx={{
              position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              width: isMobile ? "95%" : 650, bgcolor: "background.paper", borderRadius: "16px",
              boxShadow: 24, p: 4, maxHeight: "85vh", overflowY: "auto",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <AutoFixHighIcon color="secondary" />
                <Typography variant="h5" color="secondary" sx={{ fontWeight: "bold" }}>AI Mentor</Typography>
              </Box>
              {loadingAI ? (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 8, gap: 2 }}>
                  <CircularProgress color="secondary" />
                  <Typography variant="body2">Consulting mentor brain...</Typography>
                </Box>
              ) : (
                <Box className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiExplanation}</ReactMarkdown>
                  <Button onClick={() => setIsModalOpen(false)} sx={{ mt: 4 }} variant="contained" fullWidth color="primary">Got it!</Button>
                </Box>
              )}
            </Box>
          </Fade>
        </Modal>
      </Box>
    </ThemeProvider>
  );
};

export default Compiler;