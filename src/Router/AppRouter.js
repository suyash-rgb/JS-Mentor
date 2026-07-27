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
import NotesViewerPage from "../pages/NotesViewerPage";
import PracticeHub from "../pages/PracticeHub";
import PracticeQuestions from "../pages/PracticeQuestions";
import PracticeWorkspace from "../pages/PracticeWorkspace";
import WeeklyChallenge from "../pages/WeeklyChallenge";
import GroupClassRoom from "../pages/GroupClassRoom";

//Dashborad page
import Dashboard from "../pages/dashboard/student/Dashboard";
import TrainerDashboard from "../pages/dashboard/trainer/TrainerDashboard";
import SyllabusEditor from "../pages/dashboard/trainer/SyllabusEditor";
import NotesEditorPage from "../pages/dashboard/trainer/NotesEditorPage";
// Auth pages
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import InstituteLogin from "../pages/auth/InstituteLogin";
import InstituteSignUp from "../pages/auth/InstituteSignUp";

// learning Path Pages
import LearningPathTopic from "../pages/LearningPathTopic";
import FinalExamPage from "../pages/FinalExamPage";

// Legal Pages
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import CookiePolicy from "../pages/CookiePolicy";
import Blog from "../pages/Blog";
import Careers from "../pages/Careers";
import AboutUs from "../pages/AboutUs";
import ServicesPage from "../pages/ServicesPage";
console.log("Dashboard Component:", Dashboard);

function AppRouter() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [classAlert, setClassAlert] = useState(null);
  
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

    const handleIncomingClass = (e) => {
      setClassAlert(e.detail);
    };

    // 'open-mentorship-chat' — fired by useGlobalNotifications when trainer sends a message to a student
    window.addEventListener('open-mentorship-chat', markUnread);
    // 'force-open-chatbot' — fired by Chatbot.js itself (incoming call ringing, or when it
    // needs to ensure it is visible after setting internal session state)
    window.addEventListener('force-open-chatbot', openChatbot);
    window.addEventListener('incoming-group-class', handleIncomingClass);
    return () => {
      window.removeEventListener('open-mentorship-chat', markUnread);
      window.removeEventListener('force-open-chatbot', openChatbot);
      window.removeEventListener('incoming-group-class', handleIncomingClass);
    };
  }, []);

  return (
    <Router>
      {/* Chatbot Toggle Button with unread badge */}
      <div className="print:hidden" style={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
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

      {/* Real-time Group Class Alert Banner */}
      {classAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] max-w-sm w-full mx-auto px-4">
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-red-500/20 animate-pulse">
            <div className="flex-1 pr-3">
              <span className="text-[9px] font-black uppercase bg-red-800/80 text-red-100 px-2 py-0.5 rounded-full tracking-wider">New Class Scheduled</span>
              <h4 className="text-xs font-extrabold mt-1.5 line-clamp-1">{classAlert.title}</h4>
              <p className="text-[10px] text-red-200 mt-0.5">Topic: {classAlert.topic} | Mentor: {classAlert.mentor}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button 
                onClick={() => {
                  const targetId = classAlert.class_id;
                  setClassAlert(null);
                  window.location.href = `/classroom/${targetId}`;
                }}
                className="bg-white hover:bg-slate-50 text-red-600 text-[10px] font-black px-3 py-1.5 rounded-xl capitalize shadow-sm transition-all"
              >
                Join
              </button>
              <button 
                onClick={() => setClassAlert(null)}
                className="text-red-100 hover:text-white text-[10px] font-bold px-2 py-1.5 rounded-xl"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route 
          path="/learning-paths" 
          element={
            <ProtectedRoute>
              <LearningPathsPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/institute/login" element={<InstituteLogin />} />
        <Route path="/institute/signup" element={<InstituteSignUp />} /> 
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/services" element={<ServicesPage />} />

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
          path="/trainer/notes/:pathId"
          element={
            <TrainerProtectedRoute>
              <NotesEditorPage />
            </TrainerProtectedRoute>
          }
        />

        <Route
          path="/practice-hub"
          element={
            <ProtectedRoute>
              <PracticeHub />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-hub/all"
          element={
            <ProtectedRoute>
              <PracticeQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/practice-workspace/:id"
          element={
            <ProtectedRoute>
              <PracticeWorkspace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/weekly-challenge"
          element={
            <ProtectedRoute>
              <WeeklyChallenge />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classroom/:classId"
          element={
            <ProtectedRoute>
              <GroupClassRoom />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jscompiler"
          element={<JSCompiler />}
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

        <Route
          path="/notes/:pathId"
          element={
            <ProtectedRoute>
              <NotesViewerPage />
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
