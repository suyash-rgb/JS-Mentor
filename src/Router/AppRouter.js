import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { UserButton, RedirectToSignIn } from "@clerk/clerk-react";
// import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react"; 
// Removed unused imports to resolve ESLint warnings

import Chatbot from "../components/chatbot/Chatbot";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import TrainerProtectedRoute from "../components/auth/TrainerProtectedRoute";
import { useGlobalNotifications } from "../hooks/useGlobalNotifications";

// Core pages
import Home from "../pages/Home";
import LearningPathsPage from "../pages/LearningPathsPage";
import JSCompiler from "../pages/jscompiler";
import Ai from "../pages/Ai";

//Dashborad page
import Dashboard from "../pages/dashboard/student/Dashboard";
import TrainerDashboard from "../pages/dashboard/trainer/TrainerDashboard";
import SyllabusEditor from "../pages/dashboard/trainer/SyllabusEditor";

// Auth pages
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import InstituteLogin from "../pages/auth/InstituteLogin";
import InstituteSignUp from "../pages/auth/InstituteSignUp";

// learning Path Pages
import LearningPathTopic from "../pages/LearningPathTopic";
import FinalExamPage from "../pages/FinalExamPage";

console.log("Dashboard Component:", Dashboard);

function AppRouter() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Initialize Global Notifications for instant chat/call popups
  useGlobalNotifications();

  React.useEffect(() => {
    const openChatbot = () => {
      setIsChatbotOpen(true);
      setHasUnread(false);
    };
    const markUnread = () => {
      setHasUnread(true);
      setIsChatbotOpen(true); // Always auto-open on incoming message
    };

    // 'open-mentorship-chat' — fired by useGlobalNotifications when trainer sends a message to a student
    window.addEventListener('open-mentorship-chat', markUnread);
    // 'force-open-chatbot' — fired by Chatbot.js itself (incoming call ringing, or when it
    // needs to ensure it is visible after setting internal session state)
    window.addEventListener('force-open-chatbot', openChatbot);
    return () => {
      window.removeEventListener('open-mentorship-chat', markUnread);
      window.removeEventListener('force-open-chatbot', openChatbot);
    };
  }, []);

  return (
    <Router>
      {/* Chatbot Toggle Button with unread badge */}
      <div style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
        <button
          className="chatbot-toggle-btn"
          style={{ position: 'relative', bottom: 'auto', right: 'auto' }}
          onClick={() => { setIsChatbotOpen(!isChatbotOpen); setHasUnread(false); }}
          title={isChatbotOpen ? "Close Chatbot" : "Open Chatbot"}
        >
          <i className="fas fa-comments"></i>
          {hasUnread && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 14, height: 14, borderRadius: '50%',
              background: '#ef4444', border: '2px solid #fff',
              animation: 'pulse 1.5s infinite',
            }} />
          )}
        </button>
      </div>

      {/* Chatbot Component - Inside Router context */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/learning-paths" element={<LearningPathsPage />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/institute/login" element={<InstituteLogin />} />
        <Route path="/institute/signup" element={<InstituteSignUp />} /> 


        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainer/dashboard"
          element={
            <TrainerProtectedRoute>
              <TrainerDashboard />
            </TrainerProtectedRoute>
          }
        />

        <Route
          path="/trainer/curriculum/editor"
          element={
            <TrainerProtectedRoute>
              <SyllabusEditor />
            </TrainerProtectedRoute>
          }
        />

        <Route
          path="/jscompiler"
          element={
            <ProtectedRoute>
              <JSCompiler />
            </ProtectedRoute>
          }
        />

        <Route
          path="/Ai"
          element={
            <ProtectedRoute>
              <Ai />
            </ProtectedRoute>
          }
        />

        <Route
          path="/final-exam"
          element={
            <ProtectedRoute>
              <FinalExamPage />
            </ProtectedRoute>
          }
        />

        {/* Dynamic Route for All Learning Paths */}
        {[
          'js', 'jsb', 'sue', 'gs', 'vc', 'oe', 'cf', 'fc', 'ao', 'ehd',
          'cc', 'pa', 'eh', 'dom', 'mdj', 'afa', 'jds', 'ef', 'mmb', 'paa',
          'ff', 'rb', 'rrn', 'smr', 'sr', 'hfui', 'lmr', 'iav', 'spa', 'tfc',
          'in', 'nmn', 'rae', 'di', 'aa', 'me', 'ehn', 'rtc', 'tbc', 'dh',
          'ifb', 'a', 'sm', 'op', 'sbp', 'id', 'bsa', 'ma', 'gb', 'agac',
          'pwa', 'wj', 'sa', 'ml', 'wc', 'rtc2', 'cbc', 'po', 'wd', 'jtt'
        ].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <LearningPathTopic />
              </ProtectedRoute>
            }
          />
        ))}

      </Routes>

      <style>
        {`
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.1);
              }
            }

            .chatbot-toggle-btn {
              position: fixed;
              bottom: 30px;
              right: 30px;
              width: 56px;
              height: 56px;
              border-radius: 50%;
              background: linear-gradient(135deg, rgb(240, 82, 4) 0%, rgba(240, 82, 4, 0.9) 100%);
              color: white;
              border: none;
              font-size: 1.5rem;
              cursor: pointer;
              box-shadow: 0 4px 16px rgba(240, 82, 4, 0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;
              z-index: 9998;
            }

            .chatbot-toggle-btn:hover {
              transform: scale(1.1);
              box-shadow: 0 6px 24px rgba(240, 82, 4, 0.4);
            }

            .chatbot-toggle-btn:active {
              transform: scale(0.95);
            }

            @media (max-width: 480px) {
              .chatbot-toggle-btn {
                width: 50px;
                height: 50px;
                bottom: 20px;
                right: 20px;
                font-size: 1.2rem;
              }
            }
          `}
      </style>
    </Router>
  );
}

export default AppRouter;
