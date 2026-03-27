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
  const [interaction, setInteraction] = useState({ open: false, type: '', message: '', value: '', resolve: null });

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

    console.log("compiler DEBUG - API URL:", API_URL);
    console.log("compiler DEBUG - API Key exists:", !!API_KEY);
    if (API_KEY) {
      console.log("compiler DEBUG - API Key prefix:", API_KEY.substring(0, 7) + "...");
    }

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

  const executeCode = async () => {
    let consoleResult = "";
    let documentResult = "";
    const originalConsoleLog = console.log;
    const originalDocumentWrite = document.write;
    const originalWindowPrint = window.print;

    window.print = () => {
      consoleResult += "[System]: browser print dialog blocked.\n";
    };

    console.log = (...args) => {
      consoleResult += args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" ") + "\n";
      originalConsoleLog(...args);
    };

    document.write = (...args) => { documentResult += args.join("") + "\n"; };

    try {
      const transpiledCode = code.replace(/\b(prompt|confirm|alert)\s*\(/g, 'await $1(');

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
      
      new Function('setInteraction', 'setConsoleOutput', 'setDocumentOutput', 'consoleResult', 'documentResult', 'originalConsoleLog', 'originalDocumentWrite', safeCode)(
        setInteraction, setConsoleOutput, setDocumentOutput, consoleResult, documentResult, originalConsoleLog, originalDocumentWrite
      );

    } catch (err) {
      consoleResult += `Error: ${err.message}\n`;
      setConsoleOutput(consoleResult);
    }
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
                {activeTab === 0 ? (
                  documentOutput ? (
                    <div dangerouslySetInnerHTML={{ __html: documentOutput }} />
                  ) : "// UI Output"
                ) : (consoleOutput || "// Logs")}

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

        {/* INTERACTION MODAL */}
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
                    type="text" value={interaction.value}
                    onChange={(e) => setInteraction({ ...interaction, value: e.target.value })}
                    style={{
                      width: '100%', padding: '12px', borderRadius: '8px', 
                      border: '1px solid #ccc', backgroundColor: mode === 'dark' ? '#333' : '#fff',
                      color: mode === 'dark' ? '#fff' : '#000', fontSize: '1rem'
                    }}
                    autoFocus
                    onKeyDown={(e) => { if (e.key === 'Enter') interaction.resolve(interaction.value); }}
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
      </Box>
    </ThemeProvider>
  );
};

export default Compiler;