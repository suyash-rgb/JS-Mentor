import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Importing your custom hook with the specific naming convention
import { useDomainSpecializedAIAssistant } from "../hooks/useDomainSpecializedAIAssistant";

import "./Ai.css";

function Ai() {
  const location = useLocation();
  const [inputText, setInputText] = useState("");

  // Destructuring the logic from your specialized hook
  const { response, setResponse, isLoading, error, askAi } = useDomainSpecializedAIAssistant();

  // Handle "Read More" flow from the Chatbot
  useEffect(() => {
    if (location.state?.response) {
      // Set the full response from the chatbot navigation state
      setResponse(location.state.response);

      // Keep the original question in the textarea
      if (location.state?.inputText) {
        setInputText(location.state.inputText);
      }

      // Clear navigation state to prevent re-triggering logic on page refresh
      window.history.replaceState({}, document.title, window.location.pathname);

      // Smooth scroll to the response section for better UX
      setTimeout(() => {
        const responseSection = document.querySelector(".ai-response");
        if (responseSection) {
          responseSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [location, setResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // The hook handles the JS-check, backend call, and state management
    await askAi(inputText);
  };

  return (
    <div className="ai-page-wrapper">
      <Navbar />
      <div className="ai-content">
        <h1 className="ai-title">JS Mentor AI</h1>

        <div className="ai-main-card">
          <form onSubmit={handleSubmit} className="ai-form-group">
            <label className="ai-label">
              Ask JS Mentor AI
              {location.state?.response && <span className="chatbot-tag">(From Chatbot)</span>}
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="ai-textarea"
              placeholder="Type your question..."
              required
            />
            <button
              type="submit"
              disabled={isLoading}
              className={`ai-submit-btn ${isLoading ? 'btn-loading' : 'btn-active'}`}
            >
              {isLoading ? (
                <>
                  <span>Processing...</span>
                  <div className="spinner"></div>
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <i className="fas fa-paper-plane"></i>
                </>
              )}
            </button>
          </form>

          {/* Error display with standard formatting */}
          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Response area using ReactMarkdown for safe, structured output */}
          {response && (
            <div className="ai-response-container ai-response">
              <h3 className="ai-response-header">
                <i className="fas fa-robot"></i> AI Response:
              </h3>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Wraps tables in a responsive container for mobile/tablet views
                    table: ({ node, ...props }) => (
                      <div className="table-responsive-wrapper">
                        <table {...props} />
                      </div>
                    ),
                    // Ensures all links from AI open in new tabs
                    a: ({ node, children, ...props }) => (
                      <a target="_blank" rel="noopener noreferrer" {...props}>{children}</a>
                    )
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Ai;