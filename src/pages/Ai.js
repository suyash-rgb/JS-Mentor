import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Custom specialized AI hook
import { useDomainSpecializedAIAssistant } from "../hooks/useDomainSpecializedAIAssistant";

function Ai() {
  const location = useLocation();
  const [inputText, setInputText] = useState("");

  // Destructuring logic from specialized hook
  const { response, setResponse, isLoading, error, askAi } = useDomainSpecializedAIAssistant();

  // Handle "Read More" flow from the Chatbot
  useEffect(() => {
    if (location.state?.response) {
      setResponse(location.state.response);

      if (location.state?.inputText) {
        setInputText(location.state.inputText);
      }

      window.history.replaceState({}, document.title, window.location.pathname);

      setTimeout(() => {
        const responseSection = document.querySelector(".ai-response-target");
        if (responseSection) {
          responseSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  }, [location, setResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    await askAi(inputText);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
      
      {/* Workspace Wrapper */}
      <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto space-y-6">
        
        {/* Page Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            JS Mentor AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Deep dive query assistant specializing in custom JavaScript compiling and logic tracking.
          </p>
        </div>

        {/* Central Card Shell Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-6">
          
          {/* Query Form Block */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-2">
              <span>Ask JS Mentor AI</span>
              {location.state?.response && (
                <span className="bg-blue-50 border border-blue-100 text-blue-600 font-extrabold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-md shadow-sm">
                  From Chatbot
                </span>
              )}
            </label>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full min-h-[120px] sm:min-h-[150px] bg-slate-50 text-slate-800 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm focus:outline-none transition-colors leading-relaxed placeholder-slate-400"
              placeholder="Type your advanced JavaScript programming question here..."
              required
            />
            
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:w-auto self-end flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 shadow-none ${
                isLoading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <span>Processing Query</span>
                  {/* Tailwind Spinner Animation */}
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                </>
              ) : (
                <>
                  <span>Ask AI</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Diagnostic Error Alerts */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs sm:text-sm font-medium">
              <strong className="font-bold text-rose-900">Error:</strong> {error}
            </div>
          )}

          {/* AI Response Output Block Area */}
          {response && (
            <div className="ai-response-target border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  {/* Custom Inline SVG Bot Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  AI Response:
                </h3>
                <button
                  onClick={() => {
                    setInputText("");
                    setResponse(null);
                  }}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Chat
                </button>
              </div>
              
              {/* ReactMarkdown Layout Wrapper */}
              <div className="prose prose-sm max-w-none dark:prose-invert prose-slate prose-headings:font-black prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:underline text-slate-700 leading-relaxed space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Prevent table layout blowout via horizontal responsive sliders
                    table: ({ node, ...props }) => (
                      <div className="w-full overflow-x-auto border border-slate-100 rounded-xl my-4 shadow-sm scrollbar-thin">
                        <table className="w-full text-left text-xs border-collapse divide-y divide-slate-200" {...props} />
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-slate-50/80 font-bold text-slate-700" {...props} />,
                    th: ({ node, ...props }) => <th className="p-3" {...props} />,
                    td: ({ node, ...props }) => <td className="p-3 border-t border-slate-100" {...props} />,
                    // Handle responsive code example boxes inside markdown strings
                    code: ({ node, inline, className, children, ...props }) => {
                      if (inline) {
                        return <code className="bg-slate-100 text-rose-600 px-1.5 py-0.5 rounded font-mono text-[11px]" {...props}>{children}</code>;
                      }
                      return (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 my-3 overflow-x-auto shadow-inner text-slate-300 font-mono text-xs leading-relaxed">
                          <pre className="overflow-x-auto m-0"><code {...props}>{children}</code></pre>
                        </div>
                      );
                    },
                    a: ({ node, children, ...props }) => (
                      <a target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold hover:underline" {...props}>{children}</a>
                    )
                  }}
                >
                  {response}
                </ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Ai;