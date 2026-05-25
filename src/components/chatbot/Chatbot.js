import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerDoubt, getSlugMapping } from "../../utils/scheduleService";
import ChatBox from "../chat/ChatBox";
import { useMentorshipCall } from "../../hooks/useMentorshipCall";
import VideoContainer from "../call/VideoContainer";

// Import your specialized hook
import { useDomainSpecializedAIAssistant } from "../../hooks/useDomainSpecializedAIAssistant";
import { domainSpecicalizedAssistantService } from "../../utils/groqService";

import "./Chatbot.css";


// Module-level cache to ensure zero-latency for subsequent opens
let cachedMappings = null;

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
  const [pathMappings, setPathMappings] = useState(cachedMappings || {});

  // Mentorship (Human Chat) Mode
  const [mentorshipSession, setMentorshipSession] = useState(null);
  const [token, setToken] = useState(null);

  // Student's name from Clerk user object
  const studentName = window.Clerk?.user?.firstName || 'Student';

  // Video Call Hook - scoped to the current mentorship session
  const callHook = useMentorshipCall(
    mentorshipSession?.id || null,
    'STUDENT',
    studentName
  );

  // Auto-open chatbot when incoming call arrives
  useEffect(() => {
    if (callHook.callStatus === callHook.CALL_STATUS.RINGING) {
      // Dispatch event to ensure chatbot is open
      window.dispatchEvent(new CustomEvent('force-open-chatbot'));
    }
  }, [callHook.callStatus, callHook.CALL_STATUS.RINGING]);

  const navigate = useNavigate();

  // 1. Fetch dynamic mappings on mount
  useEffect(() => {
    if (cachedMappings) return;

    const fetchMappings = async () => {
      try {
        const mapping = await getSlugMapping();
        setPathMappings(mapping);
        cachedMappings = mapping;
      } catch (err) {
        console.warn("Chatbot: Failed to fetch dynamic path mappings, using fallback logic.", err);
      }
    };
    fetchMappings();
  }, []);

  // 2. Global Event Listener to trigger mentorship chat from Dashboard
  useEffect(() => {
    const handleOpenMentorship = async (event) => {
      const { sessionId, topic, mentor } = event.detail;

      // Get token if not already present
      if (window.Clerk?.session) {
        const t = await window.Clerk.session.getToken();
        setToken(t);
      }

      setMentorshipSession({ id: sessionId, topic, mentor });

      // Auto-open chatbot
      if (!isOpen) {
        // We can't directly call setIsChatbotOpen from here since it's in AppRouter.
        // But AppRouter can also listen to this event!
      }
    };

    window.addEventListener('open-mentorship-chat', handleOpenMentorship);
    return () => window.removeEventListener('open-mentorship-chat', handleOpenMentorship);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanInput = inputText.trim();
    if (!cleanInput) return;

    // --- LOGIC A: Doubt Session Registration ---
    if (isDoubtSessionMode) {
      if (!window.Clerk?.user) {
        toast.error("Login to register doubts");
        setIsDoubtSessionMode(false);
        setResponse(null);
        setError(null);
        setInputText("");
        return;
      }

      if (cleanInput.length < 5) {
        setError('Please describe your doubt in at least 5 characters.');
        return;
      }

      setIsDoubtLoading(true);
      setError(null);

      try {
        // --- JS Relatedness Check ---
        const isRelated = await domainSpecicalizedAssistantService.checkIfJavaScriptRelated(cleanInput);
        if (!isRelated) {
          setResponseType('doubt');
          setResponse("This topic does not seem related to JavaScript, would you like to rephrase?");
          setInputText('');
          setIsDoubtSessionMode(false);
          return;
        }

        const topic = cleanInput.substring(0, 100);
        const description = cleanInput.length >= 20 ? cleanInput : cleanInput + ' (session requested)';


        // --- Determine Learning Path Index (Smart Inference) ---
        let pathIndex = 1; // Default to Fundamentals

        // Extract slug from URL (e.g., /fundamentals/getting-started -> ["fundamentals", "getting-started"])
        const urlSegments = window.location.pathname.toLowerCase().split('/').filter(Boolean);

        // Try to match the most specific segment first (right to left)
        for (let i = urlSegments.length - 1; i >= 0; i--) {
          const segment = urlSegments[i];
          if (pathMappings[segment]) {
            pathIndex = pathMappings[segment];
            break;
          }
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
          <i className={`fas fa-${mentorshipSession ? "user-tie" : "robot"}`} style={{ marginRight: "8px" }}></i>
          {mentorshipSession ? `Support: ${mentorshipSession.mentor}` : "JS Mentor AI"}
        </div>
        <div className="ribbon-buttons">
          {mentorshipSession && (
            <button
              className="ribbon-btn back-btn"
              onClick={() => setMentorshipSession(null)}
              title="Back to AI Mentor"
            >
              <i className="fas fa-robot"></i>
            </button>
          )}
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
        <div className="chatbot-content" style={{ position: 'relative' }}>

          {/* ── Incoming Call Overlay ─────────────────────────────── */}
          {callHook.callStatus === callHook.CALL_STATUS.RINGING && callHook.incomingCallData && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 100,
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 16, borderRadius: 'inherit',
            }}>
              <div style={{ fontSize: 48 }}>📞</div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, margin: 0 }}>
                Incoming Call
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, margin: 0 }}>
                from {callHook.incomingCallData.callerName}
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  onClick={callHook.acceptCall}
                  style={{
                    background: '#22c55e', color: '#fff', border: 'none',
                    borderRadius: 24, padding: '10px 24px', fontWeight: 700,
                    cursor: 'pointer', fontSize: 14,
                  }}
                >
                  ✅ Accept
                </button>
                <button
                  onClick={callHook.declineCall}
                  style={{
                    background: '#ef4444', color: '#fff', border: 'none',
                    borderRadius: 24, padding: '10px 24px', fontWeight: 700,
                    cursor: 'pointer', fontSize: 14,
                  }}
                >
                  ❌ Decline
                </button>
              </div>
            </div>
          )}

          {mentorshipSession ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ChatBox
                sessionId={mentorshipSession.id}
                userToken={token}
                userRole="STUDENT"
              />
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {/* Floating Video Window - persists even when chatbot is minimized */}
      {callHook.callStatus !== callHook.CALL_STATUS.IDLE &&
        callHook.callStatus !== callHook.CALL_STATUS.RINGING && (
          <VideoContainer
            callStatus={callHook.callStatus}
            CALL_STATUS={callHook.CALL_STATUS}
            localStream={callHook.localStream}
            remoteStream={callHook.remoteStream}
            isAudioMuted={callHook.isAudioMuted}
            isVideoOff={callHook.isVideoOff}
            isScreenSharing={callHook.isScreenSharing}
            mediaStatePartner={callHook.mediaStatePartner}
            onToggleAudio={callHook.toggleAudio}
            onToggleVideo={callHook.toggleVideo}
            onToggleScreenShare={callHook.toggleScreenShare}
            onEndCall={callHook.endCall}
            userRole="STUDENT"
          />
        )}
    </div>
  );
}

export default Chatbot;
