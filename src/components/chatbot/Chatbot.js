import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { registerDoubt } from "../../utils/scheduleService";

// Import your specialized hook
import { useDomainSpecializedAIAssistant } from "../../hooks/useDomainSpecializedAIAssistant";

import "./Chatbot.css";

function Chatbot({ isOpen, onClose }) {
  // Shared AI Logic via Hook
  const { response, setResponse, isLoading, error, setError, askAi } = useDomainSpecializedAIAssistant();

  // Component-Specific State
  const [inputText, setInputText] = useState("");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDoubtSessionMode, setIsDoubtSessionMode] = useState(false);
  const [isDoubtLoading, setIsDoubtLoading] = useState(false);
  const [responseType, setResponseType] = useState("normal"); // 'normal' or 'doubt'

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    // --- LOGIC A: Doubt Session Registration ---
    if (isDoubtSessionMode) {
      if (cleanInput.length < 5) {
        setError('Please describe your doubt in at least 5 characters.');
        return;
      }

      setIsDoubtLoading(true);
      setError(null);

      try {
        const topic = cleanInput.substring(0, 100);
        const description = cleanInput.length >= 20 ? cleanInput : cleanInput + ' (session requested)';

        // --- Determine Learning Path Index ---
        // Mapping topic slugs to their respective 1-indexed learning paths
        const currentPath = window.location.pathname.replace(/^\//, '');
        let pathIndex = 1; // Default to Fundamentals

        const pathMappings = {
          // Path 1: Fundamentals
          'js': 1, 'jsb': 1, 'sue': 1, 'gs': 1, 'vc': 1, 'oe': 1, 'cf': 1, 'fc': 1, 'ao': 1, 'ehd': 1,
          // Path 2: JS Core
          'cc': 2, 'pa': 2, 'eh': 2, 'dom': 2, 'mdj': 2, 'afa': 2, 'jds': 2, 'ef': 2, 'mmb': 2, 'paa': 2,
          // Path 3: Frontend
          'ff': 3, 'rb': 3, 'rrn': 3, 'smr': 3, 'sr': 3, 'hfui': 3, 'lmr': 3, 'iav': 3, 'spa': 3, 'tfc': 3,
          // Path 4: Node.js
          'in': 4, 'nmn': 4, 'rae': 4, 'di': 4, 'aa': 4, 'me': 4, 'ehn': 4, 'rtc': 4, 'tbc': 4, 'dh': 4,
          // Path 5: Full Stack
          'ifb': 5, 'a': 5, 'sm': 5, 'op': 5, 'sbp': 5, 'id': 5, 'bsa': 5, 'ma': 5, 'gb': 5, 'agac': 5,
          // Path 6: Tech Trends
          'pwa': 6, 'wj': 6, 'sa': 6, 'ml': 6, 'wc': 6, 'rtc2': 6, 'cbc': 6, 'po': 6, 'wd': 6, 'jtt': 6
        };

        if (pathMappings[currentPath]) {
          pathIndex = pathMappings[currentPath];
        }

        const data = await registerDoubt(topic, description, pathIndex);

        setResponseType('doubt');
        setResponse(data.message || 'Your doubt has been registered! Check "My Sessions".');
        setInputText('');
        setIsDoubtSessionMode(false);
      } catch (err) {
        // FastAPI returns validation errors in a 'detail' array
        const errorDetail = err?.response?.data?.detail;
        if (Array.isArray(errorDetail)) {
          const msg = errorDetail.map(e => `${e.loc.join('.')}: ${e.msg}`).join(', ');
          setError(msg);
        } else {
          setError(errorDetail || 'Failed to register doubt.');
        }
      } finally {
        setIsDoubtLoading(false);
      }
      return;
    }

    //hii

    // --- LOGIC B: AI Mentor Consultation ---
    setOriginalQuestion(cleanInput);
    setResponseType("normal");

    // askAi handles the JS check and backend call internally
    const result = await askAi(cleanInput);

    // Clear input if we successfully got a response (or a "Not JS" message)
    if (result === "success" || result === "not_js") {
      setInputText("");
    }
  };

  const handleReadMore = () => {
    onClose();
    navigate("/ai", {
      state: {
        response: response,
        inputText: originalQuestion
      }
    });
    window.scrollTo(0, 0);
  };

  const truncateResponse = (text, maxLength = 300) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (!isOpen) return null;

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      {/* Ribbon / Header */}
      <div className="chatbot-ribbon">
        <div className="ribbon-title">
          <i className="fas fa-robot" style={{ marginRight: "8px" }}></i>
          JS Mentor AI
        </div>
        <div className="ribbon-buttons">
          <button
            className="ribbon-btn minimize-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            <i className={`fas fa-${isMinimized ? "window-maximize" : "window-minimize"}`}></i>
          </button>
          <button className="ribbon-btn close-btn" onClick={onClose} title="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {!isMinimized && (
        <div className="chatbot-content">
          <div className="chatbot-messages">
            {!response && !error && (
              <div className="welcome-message">
                <i className="fas fa-comments" style={{ fontSize: "2.5rem", marginBottom: "10px" }}></i>
                <p>Ask me anything about JavaScript!</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
              </div>
            )}

            {response && (
              <div className="response-message">
                <div className="response-header">
                  <i className="fas fa-lightbulb" style={{ marginRight: "6px" }}></i>
                  {responseType === 'doubt' ? 'Notification' : 'AI Response'}
                </div>
                <div className="response-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p style={{ margin: "6px 0", fontSize: "0.95em" }} {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ?
                          <code className="inline-code" {...props} /> :
                          <code className="block-code" {...props} />,
                      a: ({ node, children, ...props }) => <a className="response-link" {...props}>{children}</a>,
                    }}
                  >
                    {truncateResponse(response)}
                  </ReactMarkdown>
                </div>
                {responseType === "normal" && response.length > 300 && (
                  <button className="read-more-btn" onClick={handleReadMore}>
                    Read More <i className="fas fa-arrow-right"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Form / Input Area */}
          <form onSubmit={handleSubmit} className="chatbot-form">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isDoubtSessionMode ? "Describe your doubt..." : "Ask your question..."}
                className="chatbot-input"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className={`doubt-session-btn ${isDoubtSessionMode ? 'active' : ''}`}
                disabled={isDoubtLoading}
                onClick={() => {
                  if (!isDoubtSessionMode) {
                    setIsDoubtSessionMode(true);
                    setError(null);
                    setResponseType('doubt');
                    setResponse('Sure! Describe your doubt below, then click "Submit Doubt" to alert a trainer.');
                  } else {
                    handleSubmit({ preventDefault: () => { } });
                  }
                }}
              >
                {isDoubtLoading ? <i className="fas fa-spinner fa-spin"></i> :
                  (isDoubtSessionMode ? 'Submit Doubt ✓' : 'Request Doubt Session')}
              </button>

              <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;