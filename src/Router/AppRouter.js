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

// Auth pages
import SignInPage from "../pages/auth/SignInPage";
import SignUpPage from "../pages/auth/SignUpPage";
import InstituteLogin from "../pages/auth/InstituteLogin";
import InstituteSignUp from "../pages/auth/InstituteSignUp";

// learning Path Pages
import Fundamentals from "../pages/fundamentals/Fundamentals";
import Bitwise from "../pages/javascript_core/bitwise";
import Ternary from "../pages/frontend_frameworks/ternary";
import TechTrendsTopic from "../pages/tech_and_trends/TechTrendsTopic";

import NodeJsTopic from "../pages/node_js/NodeJsTopic";

import FullStackTopic from "../pages/full_stack_architecture/FullStackTopic";

import Fundamentals2 from "../pages/fundamentals/12";
import Fundamentals3 from "../pages/fundamentals/13";
import Fundamentals4 from "../pages/fundamentals/14";
import Fundamentals5 from "../pages/fundamentals/15";
import Fundamentals6 from "../pages/fundamentals/16";
import Fundamentals7 from "../pages/fundamentals/17";
import Fundamentals8 from "../pages/fundamentals/18";
import Fundamentals9 from "../pages/fundamentals/19";
import Fundamentals10 from "../pages/fundamentals/110";
import Bitwise2 from "../pages/javascript_core/22";
import Bitwise3 from "../pages/javascript_core/23";
import Bitwise4 from "../pages/javascript_core/24";
import Bitwise5 from "../pages/javascript_core/25";
import Bitwise6 from "../pages/javascript_core/26";
import Bitwise7 from "../pages/javascript_core/27";
import Bitwise8 from "../pages/javascript_core/28";
import Bitwise9 from "../pages/javascript_core/29";
import Bitwise10 from "../pages/javascript_core/210";
import Ternary2 from "../pages/frontend_frameworks/32";
import Ternary3 from "../pages/frontend_frameworks/33";
import Ternary4 from "../pages/frontend_frameworks/34";
import Ternary5 from "../pages/frontend_frameworks/35";
import Ternary6 from "../pages/frontend_frameworks/36";
import Ternary7 from "../pages/frontend_frameworks/37";
import Ternary8 from "../pages/frontend_frameworks/38";
import Ternary9 from "../pages/frontend_frameworks/39";
import Ternary10 from "../pages/frontend_frameworks/310";
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
          path="/js"
          element={
            <ProtectedRoute>
              <Fundamentals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jsb"
          element={
            <ProtectedRoute>
              <Fundamentals2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sue"
          element={
            <ProtectedRoute>
              <Fundamentals3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gs"
          element={
            <ProtectedRoute>
              <Fundamentals4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vc"
          element={
            <ProtectedRoute>
              <Fundamentals5 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/oe"
          element={
            <ProtectedRoute>
              <Fundamentals6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cf"
          element={
            <ProtectedRoute>
              <Fundamentals7 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fc"
          element={
            <ProtectedRoute>
              <Fundamentals8 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ao"
          element={
            <ProtectedRoute>
              <Fundamentals9 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ehd"
          element={
            <ProtectedRoute>
              <Fundamentals10 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cc"
          element={
            <ProtectedRoute>
              <Bitwise />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pa"
          element={
            <ProtectedRoute>
              <Bitwise2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eh"
          element={
            <ProtectedRoute>
              <Bitwise3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dom"
          element={
            <ProtectedRoute>
              <Bitwise4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mdj"
          element={
            <ProtectedRoute>
              <Bitwise5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/afa"
          element={
            <ProtectedRoute>
              <Bitwise6 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jds"
          element={
            <ProtectedRoute>
              <Bitwise7 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ef"
          element={
            <ProtectedRoute>
              <Bitwise8 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mmb"
          element={
            <ProtectedRoute>
              <Bitwise9 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paa"
          element={
            <ProtectedRoute>
              <Bitwise10 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ff"
          element={
            <ProtectedRoute>
              <Ternary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rb"
          element={
            <ProtectedRoute>
              <Ternary2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rrn"
          element={
            <ProtectedRoute>
              <Ternary3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/smr"
          element={
            <ProtectedRoute>
              <Ternary4 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sr"
          element={
            <ProtectedRoute>
              <Ternary5 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hfui"
          element={
            <ProtectedRoute>
              <Ternary6 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/lmr"
          element={
            <ProtectedRoute>
              <Ternary7 />
            </ProtectedRoute>
          }
        />

        <Route
          path="/iav"
          element={
            <ProtectedRoute>
              <Ternary8 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/spa"
          element={
            <ProtectedRoute>
              <Ternary9 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tfc"
          element={
            <ProtectedRoute>
              <Ternary10 />
            </ProtectedRoute>
          }
        />

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
