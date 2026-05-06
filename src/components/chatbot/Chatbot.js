import { useState, useRef } from "react";
import { registerDoubt } from "../../utils/scheduleService";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import "./Chatbot.css";

function Chatbot({ isOpen, onClose }) {
  const [inputText, setInputText] = useState("");
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [responseType, setResponseType] = useState("normal");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDoubtSessionMode, setIsDoubtSessionMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDoubtLoading, setIsDoubtLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const checkIfJavaScriptRelated = async (text) => {
    try {
      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = process.env.REACT_APP_GROK_API_URL;

      console.log("Chatbot DEBUG - API URL:", url);
      console.log("Chatbot DEBUG - API Key exists:", !!apiKey);
      if (apiKey) {
        console.log("Chatbot DEBUG - API Key prefix:", apiKey.substring(0, 7) + "...");
      }

      const response = await axios.post(url, {
        model: process.env.REACT_APP_GROK_MODEL,
        input: `Determine if the following question is related to JavaScript programming (including frameworks like React, Node.js, TypeScript, etc.). Reply with only "YES" or "NO".\n\nQuestion: ${text}`,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      let result = "";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(item => item.type === "message");
        if (messageObj?.content?.[0]?.text) {
          result = messageObj.content[0].text;
        }
      }

      const isRelated = typeof result === 'string' ? result.trim().toUpperCase().includes("YES") : false;
      return isRelated;
    } catch (err) {
      console.error("Error checking if JavaScript related:", err);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (isDoubtSessionMode) {
      const rawText = inputText.trim();
      if (rawText.length < 5) {
        setError('Please describe your doubt in at least 5 characters.');
        return;
      }
      // Use full text as both topic (first 100 chars) and description
      const topic = rawText.substring(0, 100);
      const description = rawText.length >= 20 ? rawText : rawText + ' (please elaborate in a session)';
      setIsDoubtLoading(true);
      setError(null);
      try {
        const data = await registerDoubt(topic, description);
        setResponseType('doubt');
        setResponse(data.message || 'Your doubt has been registered! Check \'My Sessions\' for updates.');
      } catch (err) {
        const detail = err?.response?.data?.detail;
        setError(detail || 'Failed to register doubt. Please try again.');
      } finally {
        setIsDoubtLoading(false);
        setInputText('');
        setIsDoubtSessionMode(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const isJSRelated = await checkIfJavaScriptRelated(inputText);

      if (!isJSRelated) {
        setResponseType("normal");
        setResponse(
          "I can only help with JavaScript questions! 🚀\n\n" +
          "Ask me about: JS fundamentals, ES6+, React, Node.js, TypeScript, debugging & best practices."
        );
        setIsLoading(false);
        return;
      }

      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = process.env.REACT_APP_GROK_API_URL;

      const response = await axios.post(url, {
        model: process.env.REACT_APP_GROK_MODEL,
        input: `You are a JavaScript expert assistant. Answer the following JavaScript-related question clearly and helpfully:\n\n${inputText}`,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      let generatedText = "No response generated";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(item => item.type === "message");
        if (messageObj?.content?.[0]?.text) {
          generatedText = messageObj.content[0].text;
        }
      }

      setResponseType("normal");
      setResponse(generatedText);
      setOriginalQuestion(inputText);  // Save the original question before clearing
      setInputText("");  // Clear input after saving the original question
    } catch (err) {
      setError(err.message);
      console.error("Error calling API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputText(prev => prev + `\n[Image uploaded: ${file.name}]`);
    }
  };

  const handleReadMore = () => {
    console.log("Read More clicked with response:", response);
    console.log("Read More clicked with originalQuestion:", originalQuestion);
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
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-container">
      {/* Ribbon */}
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
          <button
            className="ribbon-btn close-btn"
            onClick={onClose}
            title="Close"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {!isMinimized && (
        <div className="chatbot-content">
          {/* Messages Area */}
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
                  Response
                </div>
                <div className="response-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ node, ...props }) => <h2 style={{ fontSize: "1.2em", fontWeight: "bold", margin: "10px 0", color: "#333" }} {...props} />,
                      h2: ({ node, ...props }) => <h3 style={{ fontSize: "1.1em", fontWeight: "bold", margin: "8px 0", color: "#333" }} {...props} />,
                      p: ({ node, ...props }) => <p style={{ margin: "6px 0", fontSize: "0.95em" }} {...props} />,
                      code: ({ node, inline, ...props }) =>
                        inline ?
                          <code style={{ backgroundColor: "#f5f5f5", padding: "2px 4px", borderRadius: "3px", fontFamily: "monospace", fontSize: "0.9em" }} {...props} />
                          : <code style={{ backgroundColor: "#f5f5f5", padding: "8px", borderRadius: "4px", display: "block", overflowX: "auto", fontFamily: "monospace", fontSize: "0.85em", margin: "6px 0" }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ marginLeft: "15px", margin: "6px 0" }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ margin: "3px 0", fontSize: "0.95em" }} {...props} />,
                      a: ({ node, ...props }) => <a style={{ color: "rgb(240, 82, 4)", textDecoration: "underline" }} {...props} />,
                    }}
                  >
                    {truncateResponse(response)}
                  </ReactMarkdown>
                </div>
                {responseType === "normal" && (
                  <button
                    className="read-more-btn"
                    onClick={handleReadMore}
                  >
                    Read More <i className="fas fa-arrow-right"></i>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="chatbot-form">
            <div className="input-wrapper">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isDoubtSessionMode ? "Describe the topic or doubt you need help with..." : "Ask your question..."}
                className="chatbot-input"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="doubt-session-btn"
                disabled={isDoubtLoading}
                onClick={() => {
                  if (!isDoubtSessionMode) {
                    // Step 1: enter doubt mode, prompt user
                    setIsDoubtSessionMode(true);
                    setError(null);
                    setResponseType('doubt');
                    setResponse('Sure! Describe your topic or doubt below, then click "Request a Doubt Session" again to submit.');
                    return;
                  }
                  // Step 2: user clicked again with text — trigger form submit logic
                  if (inputText.trim().length < 5) {
                    setError('Please describe your doubt in at least 5 characters.');
                    return;
                  }
                  // Simulate form submit to reuse handleSubmit
                  const syntheticEvent = { preventDefault: () => {} };
                  handleSubmit(syntheticEvent);
                }}
                title="Request a Doubt Session"
              >
                {isDoubtLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  isDoubtSessionMode ? 'Submit Doubt ✓' : 'Request a Doubt Session'
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="submit"
                className="send-btn"
                disabled={isLoading || !inputText.trim()}
              >
                {isLoading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
