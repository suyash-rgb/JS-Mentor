import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { UserButton, RedirectToSignIn } from "@clerk/clerk-react";
// import { SignedIn, SignedOut, SignIn, SignUp } from "@clerk/clerk-react"; 
// Removed unused imports to resolve ESLint warnings

import Chatbot from "../components/chatbot/Chatbot";
import ProtectedRoute from "../components/auth/ProtectedRoute";

// Core pages
import Home from "../pages/Home";
import About from "../pages/About";
import JSCompiler from "../pages/jscompiler";
import Ai from "../pages/Ai";
import Testimonials from "../pages/Testimonials";

//Dashborad page
import Dashboard from "../pages/dashboard/Dashboard";
import TrainerDashboard from "../pages/dashboard/TrainerDashboard";

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

// import Bitwise2 from "../pages/javascript_core/22";
// ... (Removing obsolete Bitwise/Fundamentals imports)

// import Ternary2 from "../pages/frontend_frameworks/32";
// import Ternary3 from "../pages/frontend_frameworks/33";
// ... (Removing obsolete Ternary imports)

// import Switchjs2 from "../pages/node_js/42";
// import Switchjs3 from "../pages/node_js/43";
// ... (Removing obsolete Switchjs imports)

// import Fivth2 from "../pages/full_stack_architecture/52";
// import Fivth3 from "../pages/full_stack_architecture/53";
// ... (Removing obsolete Fivth imports)

// import Sixth2 from "../pages/tech_and_trends/62";
// import Sixth3 from "../pages/tech_and_trends/63";
// import Sixth4 from "../pages/tech_and_trends/64";
// import Sixth5 from "../pages/tech_and_trends/65";
// import Sixth6 from "../pages/tech_and_trends/66";
// import Sixth7 from "../pages/tech_and_trends/67";
// import Sixth8 from "../pages/tech_and_trends/68";
// import Sixth9 from "../pages/tech_and_trends/69";
// import Sixth10 from "../pages/tech_and_trends/610";




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
        <Route path="/about" element={<About />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/institute/login" element={<InstituteLogin />} />
        <Route path="/institute/signup" element={<InstituteSignUp />} /> 
        <Route path="/testimonials" element={<Testimonials />} />

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
