import { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Ai.css"; 

function Ai() {
  const location = useLocation();
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load response from chatbot if passed via navigation
  useEffect(() => {
    console.log("Location state:", location.state);
    if (location.state?.response) {
      console.log("Setting response from chatbot:", location.state.response);
      console.log("Current response state before update:", response);
      setResponse(location.state.response);
      if (location.state?.inputText) {
        setInputText(location.state.inputText);
      }
      // Clear navigation state to avoid issues on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      // Scroll to response section
      setTimeout(() => {
        const responseSection = document.querySelector(".ai-response");
        if (responseSection) {
          console.log("Found response section, scrolling...");
          responseSection.scrollIntoView({ behavior: "smooth" });
        } else {
          console.log("Response section not found in DOM");
        }
      }, 100);
    }
  }, [location]);

  // Convert Markdown to HTML
  const markdownToHtml = (markdown) => {
    return markdown;
  };

  const checkIfJavaScriptRelated = async (text) => {
    try {
      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = process.env.REACT_APP_GROK_API_URL;

      const response = await axios.post(
        url,
        {
          model: process.env.REACT_APP_GROK_MODEL,
          input: `Determine if the following question is related to JavaScript programming (including frameworks like React, Node.js, TypeScript, etc.). Reply with only "YES" or "NO".\n\nQuestion: ${text}`,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("JS check full response:", response.data);

      // Extract message from output array
      let result = "";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(
          (item) => item.type === "message"
        );
        if (messageObj?.content?.[0]?.text) {
          result = messageObj.content[0].text;
          console.log("JS check result:", result);
        }
      }

      const isRelated =
        typeof result === "string"
          ? result.trim().toUpperCase().includes("YES")
          : false;
      console.log("Is JavaScript related:", isRelated);
      return isRelated;
    } catch (err) {
      console.error("Error checking if JavaScript related:", err);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const isJSRelated = await checkIfJavaScriptRelated(inputText);

      if (!isJSRelated) {
        // If NOT JavaScript related, show generic response
        setResponse(
          "I can only help you with your doubts regarding JavaScript! 🚀\n\n" +
            "You can ask me questions about:\n\n" +
            "- JavaScript fundamentals (variables, loops, functions, etc.)\n" +
            "- ES6+ features and modern JavaScript\n" +
            "- React, Node.js, and JavaScript frameworks\n" +
            "- Debugging and troubleshooting JavaScript code\n" +
            "- Best practices and coding patterns\n\n" +
            "Feel free to ask any JavaScript-related questions! I will be happy to assist you. 😊"
        );
        setIsLoading(false);
        return;
      }

      // If JavaScript related, ask the API
      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = process.env.REACT_APP_GROK_API_URL;

      const response = await axios.post(
        url,
        {
          model: process.env.REACT_APP_GROK_MODEL,
          input: `You are a JavaScript expert assistant. Answer the following JavaScript-related question clearly and helpfully:\n\n${inputText}`,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Main API full response:", response.data);

      // Extract message from output array
      let generatedText = "No response generated";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(
          (item) => item.type === "message"
        );
        if (messageObj?.content?.[0]?.text) {
          generatedText = messageObj.content[0].text;
          console.log("Main API response text:", generatedText);
        }
      }

      // Convert markdown to HTML
      const htmlContent = markdownToHtml(generatedText);
      setResponse(htmlContent);
    } catch (err) {
      setError(err.message);
      console.error("Error calling Gemini API:", err);
    } finally {
      setIsLoading(false);
    }
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
                <><span>Processing...</span><div className="spinner"></div></>
              ) : (
                <><span>Ask AI</span><i className="fas fa-paper-plane"></i></>
              )}
            </button>
          </form>

          {error && <div className="error-message"><strong>Error:</strong> {error}</div>}

          {response && (
            <div className="ai-response-container ai-response">
              <h3 className="ai-response-header">
                <i className="fas fa-robot"></i> AI Response:
              </h3>
              <div className="markdown-content">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Only keep logic-based overrides, let CSS handle the rest
                    table: ({node, ...props}) => (
                      <div className="table-responsive-wrapper">
                        <table {...props} />
                      </div>
                    ),
                    a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />
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
