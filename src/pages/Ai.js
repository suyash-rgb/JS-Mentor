import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Custom specialized AI hook
import { useDomainSpecializedAIAssistant } from "../hooks/useDomainSpecializedAIAssistant";

// ─────────────────────────────────────────────────────────────────────────────
// RCA Fix: react-markdown v10 removed the `inline` prop from <code>.
// Block code is always rendered inside a <pre> by the parser.
// We detect inline vs block by checking whether the parent node is a <pre>.
// Additionally, Groq sometimes emits "<br>" as raw HTML inside table cells —
// rehypeRaw handles those, and the preprocessor below converts any remaining
// literal "<br>" / "<br/>" strings into markdown line breaks.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Preprocesses raw AI markdown to fix common Groq output quirks:
 *  1. `<br>` / `<br/>` → two spaces + newline (markdown line break)
 *  2. Collapse excessive blank lines (>2 consecutive) to 2
 */
function preprocessMarkdown(text) {
  if (!text) return text;
  return text
    // Replace HTML br tags with markdown line-break (two trailing spaces + \n)
    .replace(/<br\s*\/?>/gi, "  \n")
    // Collapse 3+ consecutive blank lines to 2
    .replace(/\n{3,}/g, "\n\n");
}

function Ai() {
  const location = useLocation();
  const [inputText, setInputText] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  // Destructuring logic from specialized hook
  const { response, setResponse, isLoading, error, askAi } = useDomainSpecializedAIAssistant();

  // Handle "Read More" flow from the Chatbot
  useEffect(() => {
    if (location.state?.response) {
      setResponse(location.state.response);

      if (location.state?.inputText) {
        setSubmittedQuery(location.state.inputText);
        setInputText("");
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
    
    const query = inputText;
    setSubmittedQuery(query);
    setInputText("");
    await askAi(query);
  };

  // ── Markdown component overrides ──────────────────────────────────────────

  const markdownComponents = {
    // ── Tables ──────────────────────────────────────────────────────────────
    table: ({ node, ...props }) => (
      <div style={{
        width: "100%",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        margin: "20px 0",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "0.84rem",
          textAlign: "left",
          backgroundColor: "#ffffff",
        }} {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead style={{
        backgroundColor: "#f1f5f9",
        fontWeight: "700",
        color: "#475569",
      }} {...props} />
    ),
    th: ({ node, ...props }) => (
      <th style={{
        padding: "10px 14px",
        borderBottom: "2px solid #e2e8f0",
        fontWeight: "700",
        fontSize: "0.78rem",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "#64748b",
        whiteSpace: "nowrap",
      }} {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody style={{ backgroundColor: "#ffffff" }} {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr
        className="transition-colors hover:bg-slate-100 even:bg-slate-50/80"
        style={{ borderBottom: "1px solid #f1f5f9" }}
        {...props}
      />
    ),
    td: ({ node, ...props }) => (
      <td style={{
        padding: "9px 14px",
        verticalAlign: "top",
        color: "#374151",
        fontSize: "0.84rem",
        lineHeight: "1.55",
      }} {...props} />
    ),

    // ── Code — react-markdown v10 correct pattern ────────────────────────────
    // v10 removed the `inline` prop. The correct pattern:
    //   • Override `pre` to add the dark code-block wrapper (only called for block code)
    //   • Override `code` to style the text — detect context via className
    //     - className="language-*" → inside a fenced block (pre already wraps it)
    //     - No className, single-line content → inline code
    //     - No className, multi-line content → unlabelled fenced block (pre wraps it)
    pre: ({ node, children, ...props }) => (
      <div style={{
        backgroundColor: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: "10px",
        padding: "16px 20px",
        margin: "14px 0",
        overflowX: "auto",
        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)",
      }}>
        <pre style={{ margin: 0, overflowX: "auto", whiteSpace: "pre" }} {...props}>
          {children}
        </pre>
      </div>
    ),
    code: ({ node, className, children, ...props }) => {
      // If this code element has a language class OR its content has newlines,
      // it's inside a block <pre> — just style as mono text (pre handles the box)
      const textContent = String(children ?? "");
      const isInsidePre = !!className || textContent.includes("\n");

      if (isInsidePre) {
        return (
          <code
            className={className}
            style={{
              fontFamily: "'Fira Code', 'Courier New', monospace",
              fontSize: "0.8rem",
              color: "#94a3b8",
              lineHeight: "1.7",
              whiteSpace: "pre",
            }}
            {...props}
          >
            {children}
          </code>
        );
      }

      // No className + single line = inline code
      return (
        <code
          style={{
            backgroundColor: "#f1f5f9",
            color: "#be123c",
            padding: "1px 6px",
            borderRadius: "4px",
            fontFamily: "'Fira Code', 'Courier New', monospace",
            fontSize: "0.82em",
            fontWeight: "500",
          }}
          {...props}
        >
          {children}
        </code>
      );
    },

    // ── Headings ─────────────────────────────────────────────────────────────
    h1: ({ node, ...props }) => (
      <h1 style={{ fontSize: "1.4rem", fontWeight: "800", color: "#0f172a", margin: "24px 0 12px", lineHeight: 1.3 }} {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#1e293b", margin: "20px 0 10px", lineHeight: 1.35 }} {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#334155", margin: "16px 0 8px" }} {...props} />
    ),

    // ── Body text ─────────────────────────────────────────────────────────────
    p: ({ node, ...props }) => (
      <p style={{ margin: "8px 0", color: "#374151", lineHeight: 1.75 }} {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul style={{ paddingLeft: "22px", margin: "8px 0", listStyleType: "disc" }} {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol style={{ paddingLeft: "22px", margin: "8px 0" }} {...props} />
    ),
    li: ({ node, ...props }) => (
      <li style={{ margin: "3px 0", color: "#374151", lineHeight: 1.7 }} {...props} />
    ),
    strong: ({ node, ...props }) => (
      <strong style={{ fontWeight: "700", color: "#1e293b" }} {...props} />
    ),
    em: ({ node, ...props }) => (
      <em style={{ fontStyle: "italic", color: "#475569" }} {...props} />
    ),

    // ── Links ─────────────────────────────────────────────────────────────────
    a: ({ node, children, ...props }) => (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "#2563eb", fontWeight: "600", textDecoration: "none" }}
        onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
        onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        {...props}
      >
        {children}
      </a>
    ),

    // ── Blockquote ────────────────────────────────────────────────────────────
    blockquote: ({ node, ...props }) => (
      <blockquote style={{
        borderLeft: "4px solid #cbd5e1",
        paddingLeft: "14px",
        margin: "14px 0",
        color: "#64748b",
        fontStyle: "italic",
      }} {...props} />
    ),

    hr: ({ node, ...props }) => (
      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "18px 0" }} {...props} />
    ),
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

          {/* Initial Query View */}
          {!submittedQuery && !response && !isLoading ? (
            <div className="p-4 sm:p-6 space-y-6">
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
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <span>Processing Query</span>
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

              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs sm:text-sm font-medium">
                  <strong className="font-bold text-rose-900">Error:</strong> {error}
                </div>
              )}
            </div>
          ) : (
            /* Chat Interface View */
            <div className="flex flex-col bg-slate-50">
              {/* Chat History Area */}
              <div className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
                {/* User Message Bubble */}
                {submittedQuery && (
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm max-w-[85%] sm:max-w-[75%] shadow-sm">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{submittedQuery}</p>
                    </div>
                  </div>
                )}
                
                {/* AI Loading Bubble */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-3">
                      <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                      <span className="text-sm font-medium text-slate-500">Processing query...</span>
                    </div>
                  </div>
                )}

                {/* AI Response Bubble */}
                {response && (
                  <div className="flex justify-start">
                    <div className="ai-response-target bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-5 sm:p-6 shadow-sm w-full max-w-full">
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span className="font-extrabold text-slate-900 tracking-tight">JS Mentor AI</span>
                      </div>
                      <div style={{ lineHeight: "1.75", color: "#334155", fontSize: "0.9rem" }}>
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                          components={markdownComponents}
                        >
                          {preprocessMarkdown(response)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Diagnostic Error Alerts */}
                {error && (
                  <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-3 text-xs sm:text-sm font-medium">
                    <strong className="font-bold text-rose-900">Error:</strong> {error}
                  </div>
                )}
              </div>

              {/* Sticky Bottom Input Form */}
              <div className="p-4 sm:p-5 bg-white border-t border-slate-200 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-3xl mx-auto">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    className="flex-1 max-h-32 min-h-[44px] bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm focus:outline-none transition-colors resize-none placeholder-slate-400"
                    placeholder="Ask a follow-up question..."
                    required
                  />
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-5 py-2.5 rounded-xl font-bold text-sm tracking-tight transition-all active:scale-95 shadow-sm h-[44px] flex items-center justify-center"
                    >
                      Ask
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInputText("");
                        setSubmittedQuery("");
                        setResponse(null);
                      }}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      Clear
                    </button>
                  </div>
                </form>
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