import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Ai() {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert Markdown to HTML
  const markdownToHtml = (markdown) => {
    return markdown;
  };

  const checkIfJavaScriptRelated = async (text) => {
    try {
      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = "https://api.groq.com/openai/v1/responses";

      const response = await axios.post(url, {
        model: "openai/gpt-oss-20b",
        input: `Determine if the following question is related to JavaScript programming (including frameworks like React, Node.js, TypeScript, etc.). Reply with only "YES" or "NO".\n\nQuestion: ${text}`,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("JS check full response:", response.data);
      
      // Extract message from output array
      let result = "";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(item => item.type === "message");
        if (messageObj?.content?.[0]?.text) {
          result = messageObj.content[0].text;
          console.log("JS check result:", result);
        }
      }
      
      const isRelated = typeof result === 'string' ? result.trim().toUpperCase().includes("YES") : false;
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
          "You can ask me questions about:\n" +
          "• JavaScript fundamentals (variables, loops, functions, etc.)\n" +
          "• ES6+ features and modern JavaScript\n" +
          "• React, Node.js, and JavaScript frameworks\n" +
          "• Debugging and troubleshooting JavaScript code\n" +
          "• Best practices and coding patterns\n\n" +
          "Feel free to ask any JavaScript-related questions! I will be happy to assist you. 😊"
        );
        setIsLoading(false);
        return;
      }

      // If JavaScript related, ask the API
      const apiKey = process.env.REACT_APP_GROK_API_KEY;
      const url = "https://api.groq.com/openai/v1/responses";

      const response = await axios.post(url, {
        model: "openai/gpt-oss-20b",
        input: `You are a JavaScript expert assistant. Answer the following JavaScript-related question clearly and helpfully:\n\n${inputText}`,
      }, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Main API full response:", response.data);
      
      // Extract message from output array
      let generatedText = "No response generated";
      if (response.data?.output && Array.isArray(response.data.output)) {
        const messageObj = response.data.output.find(item => item.type === "message");
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
    <>
      <div className="Home" style={{ 
        minHeight: "100vh", 
        display: "flex", 
        flexDirection: "column",
        backgroundColor: "#f8f9fa"
      }}>
        <Navbar />
        
        <div style={{ flex: 1, padding: "20px" }}>
          <h1 className="heading" style={{ 
            textAlign: "center", 
            margin: "30px 0", 
            color: "rgb(240, 82, 4)",
            fontSize: "2.5rem",
            fontWeight: "700"
          }}>
          JS Mentor AI
          </h1>

          <div className="ai-container" style={{ 
            maxWidth: "800px", 
            margin: "0 auto", 
            padding: "30px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.08)"
          }}>
            <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontWeight: "600",
                  color: "#333"
                }}>
                  Ask Coding Shark AI
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your question or request here..."
                  style={{ 
                    width: "100%", 
                    minHeight: "150px", 
                    padding: "15px", 
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    fontSize: "16px",
                    fontFamily: "inherit",
                    resize: "vertical",
                    transition: "border-color 0.3s ease",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgb(240, 82, 4)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e0e0e0";
                  }}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading}
                style={{ 
                  padding: "12px 28px", 
                  backgroundColor: isLoading ? "#ccc" : "rgb(240, 82, 4)", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "6px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "16px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  margin: "0 auto"
                }}
                className="button-hover"
               
              >
                {isLoading ? (
                  <>
                    <span>Processing...</span>
                    <div style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid transparent ",
                      borderTop: "2px solid white",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}></div>
                  </>
                ) : (
                  <>
                    <span>Ask AI</span>
                    <i className="fas fa-paper-plane"></i>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div style={{ 
                color: "#e74c3c", 
                marginBottom: "20px", 
                padding: "15px",
                backgroundColor: "#ffeaea",
                borderRadius: "8px",
                border: "1px solid #ffcdd2"
              }}>
                <strong>Error:</strong> {error}
              </div>
            )}

            {response && (
              <div className="ai-response" style={{ 
                backgroundColor: "#f8f9fa", 
                padding: "25px", 
                borderRadius: "8px",
                border: "1px solid #e0e0e0"
              }}>
                <h3 style={{ 
                  marginTop: "0", 
                  color: "rgb(240, 82, 4)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}>
                  <i className="fas fa-robot" style={{ fontSize: "1.2em" }}></i>
                  AI Response:
                </h3>
                <div 
                  style={{ 
                    margin: "0", 
                    lineHeight: "1.8",
                    color: "#333",
                    fontSize: "16px"
                  }}
                  className="markdown-content"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 style={{ fontSize: "1.8em", fontWeight: "bold", marginTop: "20px", marginBottom: "12px", color: "#333" }} {...props} />,
                      h2: ({node, ...props}) => <h2 style={{ fontSize: "1.5em", fontWeight: "bold", marginTop: "20px", marginBottom: "12px", color: "#333" }} {...props} />,
                      h3: ({node, ...props}) => <h3 style={{ fontSize: "1.3em", fontWeight: "bold", marginTop: "15px", marginBottom: "10px", color: "#333" }} {...props} />,
                      p: ({node, ...props}) => <p style={{ margin: "10px 0" }} {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? 
                          <code style={{ backgroundColor: "#f5f5f5", padding: "2px 6px", borderRadius: "3px", fontFamily: "monospace", fontSize: "0.9em" }} {...props} /> 
                          : <code style={{ backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "4px", display: "block", overflowX: "auto", fontFamily: "monospace", fontSize: "0.9em", margin: "10px 0" }} {...props} />,
                      pre: ({node, ...props}) => <pre style={{ backgroundColor: "#f5f5f5", padding: "12px", borderRadius: "4px", overflowX: "auto", fontFamily: "monospace", margin: "10px 0" }} {...props} />,
                      table: ({node, ...props}) => <table style={{ width: "100%", borderCollapse: "collapse", margin: "15px 0", border: "1px solid #ddd" }} {...props} />,
                      thead: ({node, ...props}) => <thead style={{ backgroundColor: "#f0f0f0" }} {...props} />,
                      tr: ({node, ...props}) => <tr style={{ borderBottom: "1px solid #ddd" }} {...props} />,
                      th: ({node, ...props}) => <th style={{ padding: "10px", textAlign: "left", fontWeight: "bold", borderRight: "1px solid #ddd" }} {...props} />,
                      td: ({node, ...props}) => <td style={{ padding: "10px", borderRight: "1px solid #ddd" }} {...props} />,
                      ul: ({node, ...props}) => <ul style={{ marginLeft: "20px", margin: "10px 0" }} {...props} />,
                      ol: ({node, ...props}) => <ol style={{ marginLeft: "20px", margin: "10px 0" }} {...props} />,
                      li: ({node, ...props}) => <li style={{ margin: "5px 0" }} {...props} />,
                      a: ({node, ...props}) => <a style={{ color: "rgb(240, 82, 4)", textDecoration: "underline", cursor: "pointer" }} target="_blank" rel="noopener noreferrer" {...props} />,
                      hr: ({node, ...props}) => <hr style={{ border: "none", borderTop: "2px solid #ddd", margin: "15px 0" }} {...props} />,
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

      <style>
        {`
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .button-hover:hover {
    background-color:rgba(240, 82, 4,0.9) !important;
  }

`}
      </style>
    </>
  );
}

export default Ai;