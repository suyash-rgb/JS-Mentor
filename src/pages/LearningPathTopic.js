import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCurriculum } from '../hooks/useCurriculum';
import ScrollTracker from '../components/common/ScrollTracker';
import { useProgress, useTopicStatus } from '../hooks/useProgress';
import ExerciseCompiler from '../components/common/ExerciseCompiler';
import Quiz from '../components/common/Quiz';
import VideoCarousel from '../components/common/VideoCarousel';
import ChevronTracker from '../components/common/ChevronTracker';
import Compiler from './compiler';

// Scoped styles
import "./fundamentals/Fundamentals.css";
import "./javascript_core/JsCore.css";
import "./frontend_frameworks/Frontend.css";
import "./node_js/NodeJs.css";
import "./full_stack_architecture/FullStack.css";
import "./tech_and_trends/TechTrends.css";

const PATH_CONFIGS = [
  {
    sidebarTitle: "Fundamentals",
    progressLabel: "Path Progress",
    pageSubtitle: "Master the basics, build the future.",
    difficulty: "Beginner",
    copyLabel: "Code Example",
    hasCompiler: true
  },
  {
    sidebarTitle: "JS Core",
    progressLabel: "Core Progress",
    pageSubtitle: "Deep dive into the core mechanics of JS.",
    difficulty: "Intermediate",
    copyLabel: "JS Core Example",
    hasCompiler: true
  },
  {
    sidebarTitle: "Frontend Mastery",
    progressLabel: "Frameworks Progress",
    pageSubtitle: "Mastering React, Vue, & Modern UI",
    difficulty: "Intermediate",
    copyLabel: "Implementation Example"
  },
  {
    sidebarTitle: "Node.js Mastery",
    progressLabel: "Server-Side Progress",
    pageSubtitle: "Mastering Server-Side JavaScript",
    difficulty: "Intermediate",
    copyLabel: "Implementation Example"
  },
  {
    sidebarTitle: "Architecture",
    progressLabel: "Architecture Progress",
    pageSubtitle: "Mastering Full-Stack Connectivity",
    difficulty: "Advanced",
    copyLabel: "Logic Implementation"
  },
  {
    sidebarTitle: "Trends",
    progressLabel: "Trends Progress",
    pageSubtitle: "Mastering the Modern Ecosystem",
    difficulty: "Advanced",
    copyLabel: "Trend Implementation"
  }
];

function LearningPathTopic() {
  const { topicId: paramId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { curriculum, loading, error } = useCurriculum();

  const currentPath = location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  const [activeLink, setActiveLink] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [solvingExercise, setSolvingExercise] = useState(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

  useEffect(() => {
    setActiveExerciseIndex(0);
  }, [topicId]);

  const {
    markTheoryRead,
    computePageProgress,
    computeHeadingProgress,
    updateLastVisited,
    submitExerciseResult,
    exerciseProgress
  } = useProgress();

  const pageProgress = computePageProgress(topicId);
  const { status: topicStatus, markVideoCompleted, refreshStatus } = useTopicStatus(topicId);

  // Dynamically resolve activeCardIndex and activeLink from curriculum
  let activeCardIndex = -1;
  let resolvedActiveLink = -1;

  if (curriculum && curriculum.cards) {
    for (let cIdx = 0; cIdx < curriculum.cards.length; cIdx++) {
      const card = curriculum.cards[cIdx];
      const linkIdx = card.links.findIndex(
        (link) => link.url.replace(/^\//, '') === topicId
      );
      if (linkIdx !== -1) {
        activeCardIndex = cIdx;
        resolvedActiveLink = linkIdx;
        break;
      }
    }
  }

  // Refresh status when returning from solving an exercise
  useEffect(() => {
    if (!solvingExercise) refreshStatus();
  }, [solvingExercise, refreshStatus]);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  useEffect(() => {
    if (activeCardIndex !== -1 && resolvedActiveLink !== -1 && curriculum) {
      setActiveLink(resolvedActiveLink);
      const cardHeading = curriculum.cards[activeCardIndex].heading;
      updateLastVisited(cardHeading, topicId);
    }
  }, [activeCardIndex, resolvedActiveLink, topicId, updateLastVisited, curriculum]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkSelect = (linkIndex) => {
    const targetLink = currentCard?.links[linkIndex];
    if (targetLink) {
      navigate(targetLink.url);
    }
    if (isMobile) setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="fundamentals-page">
        <Navbar />
        <div className="loading-state">Syncing Curriculum...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundamentals-page">
        <Navbar />
        <div className="error-state">Error: {error}</div>
      </div>
    );
  }

  if (activeCardIndex === -1) {
    return (
      <div className="fundamentals-page">
        <Navbar />
        <div className="error-state">Topic Not Found</div>
      </div>
    );
  }

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCardIndex];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;
  const config = PATH_CONFIGS[activeCardIndex];

  const renderDynamicSections = () => {
    if (!content) return null;
    const allKeys = Object.keys(content);

    // Find only "root" title keys (title1, title2, etc.)
    const titleKeys = allKeys
      .filter(key => {
        const match = /^title(\d+)$/.exec(key);
        if (!match) return false;
        const numStr = match[1];
        if (numStr.length > 1 && numStr.endsWith('1')) {
          const parentKey = `title${numStr.slice(0, -1)}`;
          if (allKeys.includes(parentKey)) return false;
        }
        return true;
      })
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    const renderedKeys = new Set();

    return titleKeys.map((titleKey) => {
      const num = parseInt(titleKey.replace('title', ''));
      const sectionTitle = content[titleKey];
      const sectionDesc = content[`para${num}`] || content[`title${num}1`] || content[`para${num + 1}`];

      let subheadings = [];
      let assignedCode = null;

      if (activeCardIndex <= 1) {
        // Group A: Fundamentals, JsCore
        const subheadingKeys = allKeys.filter(key => {
          const match = /^heading(\d+)Subheading(\d+)$/.exec(key);
          if (!match || renderedKeys.has(key)) return false;
          const hNum = parseInt(match[1]);
          return hNum === num || (num === 3 && hNum === 4);
        }).sort((a, b) => {
          const matchA = /^heading(\d+)Subheading(\d+)$/.exec(a);
          const matchB = /^heading(\d+)Subheading(\d+)$/.exec(b);
          return parseInt(matchA[1]) - parseInt(matchB[1]) || parseInt(matchA[2]) - parseInt(matchB[2]);
        });

        subheadings = subheadingKeys.map(k => {
          renderedKeys.add(k);
          return content[k];
        });

        if (num === 2 && !content[`code2`]) {
          assignedCode = content[`code1`];
        } else {
          assignedCode = content[`code${num}`];
        }
      } else {
        // Group B: Frontend, NodeJs, FullStack, TechTrends
        const subheadingKeys = allKeys.filter(key => 
          key.startsWith(`heading${num}Subheading`) && !renderedKeys.has(key)
        ).sort();

        subheadings = subheadingKeys.map(key => {
          renderedKeys.add(key);
          return content[key];
        }).filter(val => val && val.trim() !== "");

        if (num === 1) {
          assignedCode = content[`code1`];
        } else if (num === 4) {
          assignedCode = content[`code2`];
        } else if (num === 5) {
          assignedCode = content[`code3`];
        } else if (num === 6) {
          assignedCode = content[`code4`];
        } else {
          assignedCode = null;
        }
      }

      const showSectionDivider = activeCardIndex <= 1 || (sectionDesc || subheadings.length > 0 || assignedCode);

      const sectionDescElem = sectionDesc && (
        <p className={activeCardIndex <= 1 ? "content-description" : "content-main-desc"}>
          {sectionDesc}
        </p>
      );

      const sectionBodyElem = (
        <>
          {subheadings.length > 0 && (
            <ul className="learning-list">
              {subheadings.map((sub, idx) => (
                <li key={idx}><strong>{sub}</strong></li>
              ))}
            </ul>
          )}
          {assignedCode && (
            <div className="code-container">
              <div className="code-header">
                <span>{config.copyLabel}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(assignedCode, titleKey)}>
                  {copiedId === titleKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre><code>{assignedCode}</code></pre>
            </div>
          )}
        </>
      );

      return (
        <section key={titleKey} className="content-section">
          {activeCardIndex === 1 ? (
            // JsCore has specific header row layout and ScrollTracker wrapper inside
            <>
              <div className="section-header-row">
                <h3>{sectionTitle}</h3>
                {pageProgress.status === 'Completed' && <span className="section-check">✅</span>}
              </div>
              {showSectionDivider && <div className="section-divider"></div>}
              {sectionDescElem}
              <ScrollTracker 
                onComplete={() => markTheoryRead(topicId)} 
                disabled={pageProgress.status === 'Completed'}
              >
                {sectionBodyElem}
              </ScrollTracker>
            </>
          ) : (
            // Standard layout
            <>
              <h3>{sectionTitle}</h3>
              {showSectionDivider && <div className="section-divider"></div>}
              {sectionDescElem}
              {sectionBodyElem}
            </>
          )}
        </section>
      );
    });
  };

  const handleExerciseSubmit = (exId, submittedCode, warnings, status = 'completed', score = 100) => {
    submitExerciseResult(exId, status, score, submittedCode, warnings);
    setSolvingExercise(null);
  };

  const themeClass = `path-theme-${activeCardIndex}`;

  return (
    <div className={`${themeClass} fundamentals-page`}>
      <Navbar />
      <main className="fundamentals-main">
        <div className="content-container">
          {isMobile && (
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '✕ Close' : '☰ Topics'}
            </button>
          )}

          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <h2 className="sidebar-title">{config.sidebarTitle}</h2>
            <div className="overall-progress-container">
              <div className="progress-label">{config.progressLabel}: {computeHeadingProgress(currentCard.heading)}%</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${computeHeadingProgress(currentCard.heading)}%` }}></div>
              </div>
            </div>
            <div className="sublinks-items">
              {currentCard?.links.map((link, index) => (
                <div
                  key={index}
                  className={`sublink-item ${activeLink === index ? 'active' : ''}`}
                  onClick={() => handleLinkSelect(index)}
                >
                  <div className="sublink-content">
                    <div className="sublink-header-row">
                      <h4>{link.text}</h4>
                      {(() => {
                        const progress = computePageProgress(link.url.replace(/^\//, ''));
                        return progress.status === 'Completed' ? (
                          <span className="mini-check">✅</span>
                        ) : (
                          <span className="mini-percent">{progress.percentage}%</span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="sublink-arrow">→</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>
            <p className="page-subtitle">{config.pageSubtitle}</p>

            {content ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{currentLink.text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{currentCard.heading}</span>
                      <span className="content-difficulty">{config.difficulty}</span>
                      {pageProgress.status === 'Completed' && (
                        <span className="completion-badge">✅ Completed</span>
                      )}
                    </div>
                  </div>

                  <div className="content-body">
                    {/* For Card 1, ScrollTracker is inside renderDynamicSections */}
                    {activeCardIndex === 1 ? (
                      <>
                        <p className="content-description">{content.description}</p>
                        {renderDynamicSections()}
                      </>
                    ) : (
                      <>
                        <p className={activeCardIndex <= 1 ? "content-description" : "content-main-desc"}>{content.description}</p>
                        <ScrollTracker
                          onComplete={() => markTheoryRead(topicId)}
                          disabled={pageProgress.status === 'Completed'}
                        >
                          {renderDynamicSections()}
                        </ScrollTracker>
                      </>
                    )}

                    <VideoCarousel 
                      videos={content.videos} 
                      onVideoCompleted={markVideoCompleted}
                      completedVideos={topicStatus?.videos || {}}
                    />

                    {content.exercises && content.exercises.length > 0 && (
                      <div className="exercises-section">
                        <h3 className="exercise-heading">⚡ Hands-on Challenges</h3>
                        <div className="section-divider"></div>
                        
                        {content.exercises.length > 1 && (
                          <ChevronTracker
                            exercises={content.exercises}
                            activeExerciseIndex={activeExerciseIndex}
                            setActiveExerciseIndex={setActiveExerciseIndex}
                            isExerciseSolved={(id) => !!(topicStatus?.exercises?.[id] || exerciseProgress[id]?.status === 'completed')}
                          />
                        )}

                        {(() => {
                          const ex = content.exercises.length === 1 ? content.exercises[0] : content.exercises[activeExerciseIndex];
                          if (!ex) return null;
                          const isSolved = topicStatus?.exercises?.[ex.id] || exerciseProgress[ex.id]?.status === 'completed';
                          return (
                            <div className="exercise-card">
                              <div className="exercise-badge">{ex.difficulty}</div>
                              <h4>{ex.title}</h4>
                              <p>{ex.description}</p>
                              <div className="exercise-footer">
                                <div className="exercise-tags">
                                  {ex.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                                </div>
                                <button
                                  className={`solve-btn ${isSolved ? 'solved' : ''}`}
                                  onClick={() => setSolvingExercise(ex)}
                                >
                                  {isSolved ? '✅ Review Solution' : 'Solve Challenge'}
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Sequential Quiz at the bottom of the content */}
                    {(() => {
                      const allQuestions = content.quizzes?.flatMap(q => q.questions) || [];
                      return allQuestions.length > 0 ? (
                        <div className="topic-quiz-wrapper mt-5 pt-4 border-top">
                          <Quiz questions={allQuestions} topicId={topicId} quizId={content.quizzes?.[0]?.id} />
                        </div>
                      ) : null;
                    })()}

                  </div>
                </div>

                {config.hasCompiler && (
                  <div className="compiler-section-wrapper">
                    {!showCompiler ? (
                      <div className="practice-cta">
                        <h3>{activeCardIndex === 0 ? "Ready to write your first line of JS?" : "Practice this concept?"}</h3>
                        <button className="try-it-btn" onClick={() => setShowCompiler(true)}>
                          {activeCardIndex === 0 ? "Try It Out" : "Open Compiler"}
                        </button>
                      </div>
                    ) : (
                      <div className="active-compiler-container">
                        <button className="hide-btn" onClick={() => setShowCompiler(false)}>Hide Compiler</button>
                        <div className="compiler-frame"><Compiler /></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {solvingExercise && (
              <ExerciseCompiler
                exercise={solvingExercise}
                onClose={() => setSolvingExercise(null)}
                onSubmit={handleExerciseSubmit}
              />
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LearningPathTopic;
