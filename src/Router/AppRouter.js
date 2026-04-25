import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { UserButton, RedirectToSignIn } from "@clerk/clerk-react";
// import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react"; 
// Removed unused imports to resolve ESLint warnings

import Chatbot from "../components/chatbot/Chatbot";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Core pages
import Home from "../pages/Home";
import LearningPathsPage from "../pages/LearningPathsPage";
import JSCompiler from "../pages/jscompiler";
import Ai from "../pages/Ai";

//Dashborad page
import Dashboard from "../pages/dashboard/student/Dashboard";
import TrainerDashboard from "../pages/dashboard/trainer/TrainerDashboard";

// Auth pages
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import InstituteLogin from "../pages/auth/InstituteLogin";
import InstituteSignUp from "../pages/auth/InstituteSignUp";

// learning Path Pages
import FundamentalsTopic from "../pages/fundamentals/FundamentalsTopic";
import JsCoreTopic from "../pages/javascript_core/JsCoreTopic";

import FrontendTopic from "../pages/frontend_frameworks/FrontendTopic";

import TechTrendsTopic from "../pages/tech_and_trends/TechTrendsTopic";

import NodeJsTopic from "../pages/node_js/NodeJsTopic";

import FullStackTopic from "../pages/full_stack_architecture/FullStackTopic";

console.log("Dashboard Component:", Dashboard);

function AppRouter() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <Router>
      {/* Chatbot Toggle Button */}
      <button
        className="chatbot-toggle-btn"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        title={isChatbotOpen ? "Close Chatbot" : "Open Chatbot"}
      >
        <i className="fas fa-comments"></i>
      </button>

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
            <ProtectedRoute>
              <TrainerDashboard />
            </ProtectedRoute>
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

        {/* Dynamic Route for Fundamentals */}
        {['js', 'jsb', 'sue', 'gs', 'vc', 'oe', 'cf', 'fc', 'ao', 'ehd'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <FundamentalsTopic />
              </ProtectedRoute>
            }
          />
        ))}

        {/* Dynamic Route for JavaScript Core */}
        {['cc', 'pa', 'eh', 'dom', 'mdj', 'afa', 'jds', 'ef', 'mmb', 'paa'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <JsCoreTopic />
              </ProtectedRoute>
            }
          />
        ))}


        {/* Dynamic Route for Frontend Frameworks */}
        {['ff', 'rb', 'rrn', 'smr', 'sr', 'hfui', 'lmr', 'iav', 'spa', 'tfc'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <FrontendTopic />
              </ProtectedRoute>
            }
          />
        ))}


        {/* Dynamic Route for Node.js */}
        {['in', 'nmn', 'rae', 'di', 'aa', 'me', 'ehn', 'rtc', 'tbc', 'dh'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <NodeJsTopic />
              </ProtectedRoute>
            }
          />
        ))}


        {/* Dynamic Route for Full Stack Architecture */}
        {['ifb', 'a', 'sm', 'op', 'sbp', 'id', 'bsa', 'ma', 'gb', 'agac'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <FullStackTopic />
              </ProtectedRoute>
            }
          />
        ))}


        {/* Dynamic Route for Technologies and Trends */}
        {['pwa', 'wj', 'sa', 'ml', 'wc', 'rtc2', 'cbc', 'po', 'wd', 'jtt'].map((topic) => (
          <Route
            key={topic}
            path={`/${topic}`}
            element={
              <ProtectedRoute>
                <TechTrendsTopic />
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
