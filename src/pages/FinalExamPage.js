import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Grid, Button, useTheme, 
  Card, Divider, Alert,
  CircularProgress, Fade, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CodeIcon from '@mui/icons-material/Code';
import SendIcon from '@mui/icons-material/Send';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCurriculum } from '../hooks/useCurriculum';
import { useProgress } from '../hooks/useProgress';
import { logQuiz, logProgress } from '../services/studentService';
import ExerciseCompiler from '../components/common/ExerciseCompiler';
import { useNavigate } from 'react-router-dom';

import './FinalExamPage.css';

const FinalExamPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const { curriculum, loading: curriculumLoading } = useCurriculum();
  const { computeHeadingProgress, exerciseProgress, submitExerciseResult } = useProgress();

  const learningPaths = [
    { id: 'Fundamentals', name: 'Fundamentals', color: '#f05204' },
    { id: 'JavaScript Core', name: 'JS Core', color: '#3498db' },
    { id: 'Frontend Frameworks', name: 'Frontend', color: '#61dafb' },
    { id: 'Node.js', name: 'Node.js', color: '#68a063' },
    { id: 'Full-Stack Architecture', name: 'Full Stack', color: '#2c3e50' },
    { id: 'Technologies and Trends', name: 'Tech Trends', color: '#ff4081' },
  ];

  // Calculate learning path progress
  const pathsWithProgress = learningPaths.map(p => ({
    ...p,
    progress: computeHeadingProgress(p.id)
  }));

  const allPathsCompleted = pathsWithProgress.every(p => p.progress === 100);

  // States
  const [examStarted, setExamStarted] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [solvingExercise, setSolvingExercise] = useState(null);
  const [warnings, setWarnings] = useState(0);
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [isSidebarBlocked, setIsSidebarBlocked] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [examScore, setExamScore] = useState(null);

  // Extract MCQ Questions and Exercises from curriculum
  const finalExamData = curriculum?.finalExam?.links?.[0]?.pageContent;
  const mcqs = finalExamData?.quizzes?.[0]?.questions || [];
  const exercises = finalExamData?.exercises || [];

  // Count solved exercises based on exerciseProgress in context
  const solvedCount = exercises.filter(ex => 
    exerciseProgress[ex.id]?.status === 'completed'
  ).length;

  // Anti-Cheat Proctoring Core Logic
  useEffect(() => {
    if (!examStarted || examSubmitted) return;

    let lastHandled = 0;
    const COOLDOWN = 1000;

    const handleSecurityEvent = (type) => {
      const now = Date.now();
      if (now - lastHandled < COOLDOWN) return;
      lastHandled = now;

      setWarnings(prev => {
        const nextWarnings = prev + 1;
        if (nextWarnings > 3) {
          // Automatic exam failure due to cheating
          setExamSubmitted(true);
          setExamScore({
            objective: 0,
            subjective: 0,
            total: 0,
            cheated: true
          });
          logQuiz("final-exam-quiz", 0, 15);
          logProgress("final-exam", "FAILED", 0);
        }
        return nextWarnings;
      });
      setShowWarningAlert(true);
    };

    // Tab switch/Hidden window detection
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleSecurityEvent('Tab switch');
      }
    };

    // Window focus loss detection
    const handleBlur = () => {
      handleSecurityEvent('Window focus lost');
    };

    // Sidebar/Devtools detection logic (Viewport ratio signatures)
    const detectSidebar = () => {
      const widthRatio = window.innerWidth / window.outerWidth;
      const heightRatio = window.innerHeight / window.outerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      // Violation 1: Sideways Panel Docked (e.g. Gemini, Copilot, DevTools-Right)
      const sidebarViolation = (widthRatio < 0.85) && (widthDiff > 150);
      // Violation 2: Bottom Panel Docked (e.g. DevTools-Bottom)
      const bottomPanelViolation = (heightRatio < 0.70) && (heightDiff > 250);

      if (sidebarViolation || bottomPanelViolation) {
        setIsSidebarBlocked(true);
        handleSecurityEvent('External panel/DevTools docking detected');
      } else {
        setIsSidebarBlocked(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('resize', detectSidebar);

    // Initial check
    detectSidebar();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('resize', detectSidebar);
    };
  }, [examStarted, examSubmitted]);

  // Handle MCQ Answer selection
  const handleMcqSelect = (questionId, option) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  // Exercise submission handler
  const handleExerciseSubmit = (exId, code, warningCount, status = 'completed', score = 100) => {
    submitExerciseResult(exId, status, score, code, warningCount);
    setSolvingExercise(null);
  };

  // Submit full exam
  const handleFinalSubmit = async () => {
    setSubmitDialogOpen(false);

    // Calculate score
    let objScore = 0;
    mcqs.forEach(q => {
      if (mcqAnswers[q.id] === q.correct_answer) {
        objScore += 1;
      }
    });

    const subjScore = solvedCount * 5; // 5 marks per solved challenge
    const totalScore = objScore + subjScore;

    setExamScore({
      objective: objScore,
      subjective: subjScore,
      total: totalScore,
      cheated: false
    });
    setExamSubmitted(true);

    try {
      // Log final exam elements to DB
      await logQuiz("final-exam-quiz", objScore, 15);
      await logProgress("final-exam", "COMPLETED", 1800); // 30 minutes active
    } catch (err) {
      console.error("Failed to commit final exam results:", err);
    }
  };

  if (curriculumLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
          <CircularProgress color="primary" size={60} />
          <Typography variant="h6" className="mt-4 animate-pulse text-slate-300">
            Syncing Final Examination Curriculums...
          </Typography>
        </div>
        <Footer />
      </div>
    );
  }

  // LAYER 1: STRICT LOCKED SCREEN
  if (!allPathsCompleted) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center items-center my-8">
          <div className="locked-container text-center max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="locked-badge-pulse flex items-center justify-center mx-auto mb-6">
              <LockIcon className="text-amber-500 !w-16 !h-16" />
            </div>
            
            <Typography variant="h4" className="font-extrabold text-slate-100 tracking-tight mb-2">
              Endgame Examination Locked
            </Typography>
            <Typography variant="body2" className="text-slate-400 mb-8 max-w-lg mx-auto">
              This comprehensive test is only open to students who have successfully cleared all 6 learning paths of the JS-Mentor curriculum.
            </Typography>

            <Divider className="border-slate-800 my-6" />

            <div className="w-full space-y-4 mb-8">
              <Typography variant="subtitle2" className="text-left font-bold text-slate-300 uppercase tracking-wider text-xs">
                Learning Paths Progress Checklist:
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {pathsWithProgress.map((path, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block">{path.name}</span>
                      <span className="text-sm font-black mt-0.5 block" style={{ color: path.color }}>
                        {path.progress}% Complete
                      </span>
                    </div>
                    {path.progress === 100 ? (
                      <CheckCircleIcon className="text-emerald-500 w-5 h-5" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-700 bg-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                        !
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              startIcon={<ArrowBackIcon />}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 normal-case rounded-xl shadow-none border border-slate-700"
            >
              Return to Insights Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // LAYER 2: RESULTS SUMMARY SCREEN
  if (examSubmitted && examScore) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center items-center my-8">
          <div className="results-container text-center max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            {examScore.cheated ? (
              <>
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-red-950/50 border border-red-500 rounded-full text-red-500">
                  <SecurityIcon className="!w-12 !h-12" />
                </div>
                <Typography variant="h4" className="font-extrabold text-red-500 tracking-tight mb-2">
                  Examination Cancelled
                </Typography>
                <Typography variant="body2" className="text-slate-400 mb-6 max-w-md mx-auto">
                  The anti-cheat proctoring engine detected multiple security anomalies (tab switches, focus loss, or DevTools panel access) exceeding the security threshold. This attempt has been logged as a failure.
                </Typography>
                <Alert severity="error" className="bg-red-950/20 border border-red-900/50 text-red-200 rounded-xl mb-8 text-left">
                  Trainers have been notified of this security violation. Please coordinate a manual session unlocking before retrying.
                </Alert>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-amber-950/40 border border-amber-500 rounded-full text-amber-500 animate-bounce">
                  <TrophyIcon className="!w-12 !h-12" />
                </div>
                <Typography variant="h4" className="font-extrabold text-slate-100 tracking-tight mb-2">
                  Congratulations, graduate!
                </Typography>
                <Typography variant="body2" className="text-slate-400 mb-8 max-w-md mx-auto">
                  You have successfully completed the JS-Mentor Final Endgame Examination. Your performance data has been logged to the ML risk assessment pipeline.
                </Typography>

                <div className="grid grid-cols-3 gap-4 mb-8 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Objective</span>
                    <span className="text-xl font-bold text-slate-200 block mt-1">{examScore.objective} / 15</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">1 mark each</span>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Subjective</span>
                    <span className="text-xl font-bold text-slate-200 block mt-1">{examScore.subjective} / 75</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">5 marks each</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Grade</span>
                    <span className="text-2xl font-black text-amber-400 block mt-0.5">{examScore.total} / 90</span>
                    <span className="text-[9px] text-amber-500/80 font-bold block mt-0.5">
                      {Math.round((examScore.total / 90) * 100)}% Score
                    </span>
                  </div>
                </div>
              </>
            )}

            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              startIcon={<ArrowBackIcon />}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-8 py-3 normal-case rounded-xl shadow-none border border-slate-700"
            >
              Return to Insights Dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // LAYER 3: WELCOME / INSTRUCTIONS START SCREEN
  if (!examStarted) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-center my-8">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            <Typography variant="h3" className="font-extrabold text-slate-100 tracking-tight mb-2 text-2xl sm:text-3xl">
              Endgame Examination
            </Typography>
            <Typography variant="body2" className="text-slate-400 mb-6">
              Complete this final checkpoint to validate your proficiency.
            </Typography>

            <Divider className="border-slate-800 my-6" />

            <div className="space-y-4 mb-8">
              <Typography variant="h6" className="text-slate-200 font-bold text-sm sm:text-base">
                📋 Examination Protocol & Guidelines:
              </Typography>
              <ul className="space-y-3 text-sm text-slate-300 pl-4 list-disc">
                <li><strong>Weightage Details:</strong> 15 objective questions (1 mark each) and 15 subjective coding challenges (5 marks each). Total Marks: 90.</li>
                <li><strong>Sourcing:</strong> MCQs evaluate the last 4 learning paths; subjective exercises test the first 2 paths.</li>
                <li><strong>Anti-Cheat Shield Active:</strong> Leaving the page, switching browser tabs, docking/undocking DevTools, or opening sidebar panels will record a security warning.</li>
                <li><strong>Violation Limit:</strong> Exceeding 3 warnings will result in immediate termination and failure of the exam.</li>
                <li><strong>No Help:</strong> Objective questions do not show correct/incorrect state or AI helpers during the exam.</li>
              </ul>
            </div>

            <Alert severity="warning" icon={<SecurityIcon />} className="bg-amber-950/20 border border-amber-900/50 text-amber-200 rounded-xl mb-8">
              Ensure you have a stable network and a quiet environment. Closing this tab or window once started counts as a failed attempt.
            </Alert>

            <div className="flex justify-end gap-3">
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                className="border-slate-800 text-slate-400 hover:bg-slate-800 font-bold px-6 py-2.5 normal-case rounded-xl"
              >
                Go Back
              </Button>
              <Button
                variant="contained"
                onClick={() => setExamStarted(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-8 py-2.5 normal-case rounded-xl shadow-none"
              >
                Begin Examination
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // LAYER 4: ACTIVE EXAM PORTAL SCREEN
  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white select-none">
      <Navbar />

      {/* SECURITY BLOCKING OVERLAY (ANTI-CHEAT) */}
      <Fade in={isSidebarBlocked}>
        <Box sx={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          zIndex: 99999, backgroundColor: 'rgba(2, 6, 23, 0.9)',
          backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyCenter: 'center', p: 4, textAlign: 'center',
          pointerEvents: 'auto', justifyContent: 'center'
        }}>
          <WarningAmberIcon className="text-red-500 !w-20 !h-20 animate-pulse mb-6" />
          <Typography variant="h4" className="font-extrabold text-red-500 tracking-tight mb-2">
            Workspace Temporarily Blocked
          </Typography>
          <Typography variant="body2" className="text-slate-300 max-w-md">
            The proctoring engine detected a sidebar extension or a docked browser panel. Close the sidebar panel or undock DevTools to resume the exam.
          </Typography>
        </Box>
      </Fade>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-6">
        
        {/* Security Warning Notification Toast */}
        <Fade in={showWarningAlert}>
          <Alert 
            severity="warning" 
            icon={<WarningAmberIcon />}
            onClose={() => setShowWarningAlert(false)}
            className="border border-red-900/50 bg-red-950/20 text-red-200 rounded-xl"
          >
            <strong>Security Warning:</strong> Action detected outside permitted workspace bounds. Staying on this tab is mandatory. (Warnings: {warnings} / 3)
          </Alert>
        </Fade>

        {/* Live Proctoring Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping"></div>
            <div>
              <Typography className="font-bold text-slate-100 text-sm">Exam Proctoring: Active</Typography>
              <Typography className="text-slate-400 text-xs mt-0.5">Focus violation warnings: {warnings} / 3</Typography>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Objective Finished</span>
              <span className="text-sm font-bold text-slate-200 block">
                {Object.keys(mcqAnswers).length} / 15 Answered
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800"></div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-semibold">Subjective Solved</span>
              <span className="text-sm font-bold text-slate-200 block">
                {solvedCount} / 15 Solved
              </span>
            </div>
          </div>
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={() => setSubmitDialogOpen(true)}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2 normal-case rounded-xl shadow-none"
          >
            Submit Examination
          </Button>
        </div>

        {/* Main Grid: split MCQs and Subjective Challenges */}
        <Grid container spacing={4}>
          
          {/* Objective MCQ Card Panel */}
          <Grid item xs={12} lg={6}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
              <div>
                <Typography variant="h5" className="font-extrabold text-slate-100 tracking-tight">
                  Section A: Objective Questions
                </Typography>
                <Typography variant="caption" className="text-slate-400 mt-1 block">
                  Select your answers. Each correct response grants 1 mark. (Total: 15 marks)
                </Typography>
              </div>

              <Divider className="border-slate-800" />

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {mcqs.map((q, idx) => (
                  <Card key={q.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl shadow-none">
                    <Typography className="font-bold text-slate-200 text-sm mb-3">
                      {idx + 1}. {q.text}
                    </Typography>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = mcqAnswers[q.id] === opt;
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleMcqSelect(q.id, opt)}
                            className={`flex items-center gap-3 w-full text-left p-3 rounded-lg border text-xs font-semibold transition-all ${
                              isSelected 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                : 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {isSelected ? (
                              <CheckCircleIcon className="text-amber-500 w-4 h-4" />
                            ) : (
                              <RadioButtonUncheckedIcon className="text-slate-600 w-4 h-4" />
                            )}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Grid>

          {/* Subjective Coding Challenge Card Panel */}
          <Grid item xs={12} lg={6}>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6">
              <div>
                <Typography variant="h5" className="font-extrabold text-slate-100 tracking-tight">
                  Section B: Subjective Challenges
                </Typography>
                <Typography variant="caption" className="text-slate-400 mt-1 block">
                  Write correct scripts. Each successful compile and submission yields 5 marks. (Total: 75 marks)
                </Typography>
              </div>

              <Divider className="border-slate-800" />

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {exercises.map((ex, idx) => {
                  const isSolved = exerciseProgress[ex.id]?.status === 'completed';
                  return (
                    <div key={ex.id} className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Typography className="font-bold text-slate-200 text-sm truncate">
                            {idx + 1}. {ex.title.replace('Final Challenge ', 'Challenge ')}
                          </Typography>
                          <span className="text-[9px] bg-red-950 border border-red-900 text-red-400 px-1.5 py-0.5 rounded-md uppercase font-black tracking-wider">
                            {ex.difficulty}
                          </span>
                        </div>
                        <Typography className="text-slate-400 text-xs mt-1 truncate">
                          {ex.description}
                        </Typography>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSolved ? (
                          <span className="text-xs text-emerald-500 font-bold bg-emerald-950/20 border border-emerald-900 px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0">
                            ✓ Solved
                          </span>
                        ) : (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setSolvingExercise(ex)}
                            startIcon={<CodeIcon />}
                            className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 text-xs py-1.5 font-bold rounded-lg shrink-0"
                          >
                            Solve
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Grid>
        </Grid>
      </main>

      <Footer />

      {/* Compiler Dialog Wrapper */}
      {solvingExercise && (
        <ExerciseCompiler
          exercise={solvingExercise}
          onClose={() => setSolvingExercise(null)}
          onSubmit={handleExerciseSubmit}
        />
      )}

      {/* Confirmation Dialog prior to submit */}
      <Dialog 
        open={submitDialogOpen} 
        onClose={() => setSubmitDialogOpen(false)}
        PaperProps={{ className: 'bg-slate-900 border border-slate-800 text-white rounded-2xl' }}
      >
        <DialogTitle className="font-extrabold text-slate-100">Submit Exam?</DialogTitle>
        <DialogContent>
          <p className="text-sm text-slate-400 leading-relaxed">
            Are you sure you want to finish the exam? Double check that you've answered all MCQs and solved all subjective challenges possible.
          </p>
          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl mt-4 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black block">Objective</span>
              <span className="font-bold text-slate-200 mt-1 block">{Object.keys(mcqAnswers).length} / 15 answered</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-black block">Subjective</span>
              <span className="font-bold text-slate-200 mt-1 block">{solvedCount} / 15 solved</span>
            </div>
          </div>
        </DialogContent>
        <DialogActions className="p-4 border-t border-slate-800">
          <Button 
            onClick={() => setSubmitDialogOpen(false)} 
            className="text-slate-400 font-bold normal-case hover:bg-slate-800 px-4 py-2 rounded-xl"
          >
            Go Back
          </Button>
          <Button 
            onClick={handleFinalSubmit} 
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-6 py-2 normal-case rounded-xl shadow-none"
          >
            Yes, Submit Exam
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FinalExamPage;
