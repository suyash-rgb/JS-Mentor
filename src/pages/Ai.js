// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";


// function Ai() {
//   return (
//     <>
//       <div className="Home">
//         <Navbar />
//         <h1 className="heading">ai</h1>

//         <Footer />
//       </div>
//     </>
//   );
// }

// export default Ai;

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Ai() {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const apiKey = "AIzaSyC-A5mTlZcmGs73LmWsuMK4fp3elgdzvas"; // Replace with your actual API key
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: inputText,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
      setResponse(generatedText);
    } catch (err) {
      setError(err.message);
      console.error("Error calling Gemini API:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="Home">
        <Navbar />
        <h1 className="heading">AI</h1>

        <div className="ai-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
            <div style={{ marginBottom: "10px" }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask the AI anything..."
                style={{ width: "100%", minHeight: "100px", padding: "10px" }}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                padding: "10px 20px", 
                background: "#007bff", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              {isLoading ? "Processing..." : "Ask AI"}
            </button>
          </form>

          {error && (
            <div style={{ color: "red", marginBottom: "20px" }}>
              Error: {error}
            </div>
          )}

          {response && (
            <div className="ai-response" style={{ 
              background: "#f5f5f5", 
              padding: "20px", 
              borderRadius: "4px",
              whiteSpace: "pre-wrap"
            }}>
              <h3>AI Response:</h3>
              <p>{response}</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}

export default Ai;