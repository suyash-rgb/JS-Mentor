import React, { useState, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Box, Typography, Paper, Tab, Tabs, useMediaQuery,
  Button, IconButton, Tooltip, createTheme, ThemeProvider, CssBaseline
} from "@mui/material";
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import { useCompilerCore } from '../hooks/useCompilerCore';
import { explainErrorWithAI } from '../utils/compilerUtils';

import InteractionModal from "../components/common/InteractionModal";
import AiMentorModal from "../components/common/AiMentorModal";

const Compiler = () => {
  const {
    code, setCode,
    consoleOutput,
    documentOutput,
    setIsEditorReady,
    interaction, setInteraction
  } = useCompilerCore("// Write your code here\n");

  const [activeTab, setActiveTab] = useState(1);
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

    try {
      const explanation = await explainErrorWithAI(code, consoleOutput);
      setAiExplanation(explanation);
    } catch (error) {
      setAiExplanation("## System Error\nI hit a snag connecting to the mentor brain.");
    } finally {
      setLoadingAI(false);
    }
  };

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

        {/* REFACTORED MODALS */}
        <AiMentorModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          loading={loadingAI} 
          explanation={aiExplanation} 
          isMobile={isMobile} 
        />

        <InteractionModal 
          interaction={interaction} 
          setInteraction={setInteraction} 
          mode={mode} 
          isMobile={isMobile} 
        />
      </Box>
    </ThemeProvider>
  );
};

export default Compiler;