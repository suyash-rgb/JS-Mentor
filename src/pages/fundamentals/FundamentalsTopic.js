import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum';
import "./Fundamentals.css";
import Compiler from '../compiler';
import ScrollTracker from '../../components/common/ScrollTracker';
import { useProgress } from '../../hooks/useProgress';
import ExerciseCompiler from '../../components/common/ExerciseCompiler';
import Quiz from '../../components/common/Quiz'; // New Import

const pathMap = {
  'js': 0, 'jsb': 1, 'sue': 2, 'gs': 3, 'vc': 4,
  'oe': 5, 'cf': 6, 'fc': 7, 'ao': 8, 'ehd': 9
};

function FundamentalsTopic() {
  const { topicId: paramId } = useParams();
  const { curriculum, loading, error } = useCurriculum();

  const currentPath = window.location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  const activeCardIndex = 0;
  const [activeLink, setActiveLink] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [solvingExercise, setSolvingExercise] = useState(null);
  const {
    markTheoryRead,
    computePageProgress,
    computeHeadingProgress,
    updateLastVisited,
    submitExerciseResult,
    exerciseProgress
  } = useProgress();
  const pageProgress = computePageProgress(topicId);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  useEffect(() => {
    if (topicId && pathMap[topicId] !== undefined) {
      setActiveLink(pathMap[topicId]);
      updateLastVisited('Fundamentals', topicId);
    }
  }, [topicId, updateLastVisited]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLinkSelect = (linkIndex) => {
    setActiveLink(linkIndex);
    if (isMobile) setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Curriculum...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Error: {error}</div></div>;

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCardIndex];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  const renderDynamicSections = () => {
    if (!content) return null;
    const allKeys = Object.keys(content);

    // Find only "root" title keys (title1, title2, etc.)
    // We ignore title41 if title4 exists, but keep title10 if it's a main heading
    const titleKeys = allKeys
      .filter(key => {
        const match = /^title(\d+)$/.exec(key);
        if (!match) return false;
        const numStr = match[1];
        // If it's something like title41 and title4 exists, it's a sub-desc
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

      const currentSubheadings = subheadingKeys.map(k => {
        renderedKeys.add(k);
        return content[k];
      });

      // Aligned lookup: titleN maps directly to paraN, codeN, and resultN
      const assignedCode = content[`code${num}`];
      const assignedResult = content[`result${num}`];


      return (
        <section key={titleKey} className="content-section">
          <h3>{sectionTitle}</h3>
          <div className="section-divider"></div>
          {sectionDesc && <p>{sectionDesc}</p>}
          {currentSubheadings.length > 0 && (
            <ul className="learning-list">
              {currentSubheadings.map((sub, idx) => (
                <li key={idx}><strong>{sub}</strong></li>
              ))}
            </ul>
          )}
          {assignedCode && (
            <div className="code-container">
              <div className="code-header">
                <span>{assignedResult ? `Output: ${assignedResult}` : "Code Example"}</span>
                <button className="copy-btn" onClick={() => copyToClipboard(assignedCode, titleKey)}>
                  {copiedId === titleKey ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre><code>{assignedCode}</code></pre>
            </div>
          )}
        </section>
      );
    });
  };

  const handleExerciseSubmit = (exId, submittedCode, warnings, status = 'completed', score = 100) => {
    submitExerciseResult(exId, status, score, submittedCode, warnings);
    setSolvingExercise(null);
  };

  return (
    <div className="fundamentals-page">
      <Navbar />
      <main className="fundamentals-main">
        <div className="content-container">
          {isMobile && (
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? '✕ Close' : '☰ Topics'}
            </button>
          )}

          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <h2 className="sidebar-title">Fundamentals</h2>
            <div className="overall-progress-container">
              <div className="progress-label">Path Progress: {computeHeadingProgress('Fundamentals')}%</div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${computeHeadingProgress('Fundamentals')}%` }}></div>
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
                    <p className="sublink-preview">{link.pageContent?.description?.substring(0, 45)}...</p>
                  </div>
                  <div className="sublink-arrow">→</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>
            <p className="page-subtitle">Master the basics, build the future.</p>

            {content ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{currentLink.text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{currentCard.heading}</span>
                      <span className="content-difficulty">Beginner</span>
                      {pageProgress.status === 'Completed' && (
                        <span className="completion-badge">✅ Completed</span>
                      )}
                    </div>
                  </div>

                  <div className="content-body">
                    <p className="content-description">{content.description}</p>
                    <ScrollTracker
                      onComplete={() => markTheoryRead(topicId)}
                      disabled={pageProgress.status === 'Completed'}
                    >
                      {renderDynamicSections()}
                    </ScrollTracker>

                    {content.exercises && content.exercises.length > 0 && (
                      <div className="exercises-section">
                        <h3 className="exercise-heading">⚡ Hands-on Challenges</h3>
                        <div className="section-divider"></div>
                        {content.exercises.map((ex, i) => {
                          const isSolved = exerciseProgress[ex.id]?.status === 'completed';
                          return (
                            <div key={ex.id || i} className="exercise-card">
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
                        })}
                      </div>
                    )}

                    {/* Sequential Quiz at the bottom of the content */}
                    {(() => {
                      const quizKeys = Object.keys(content).filter(k => k.startsWith('quiz')).sort();
                      const allQuestions = quizKeys.flatMap(k => content[k] || []);
                      return allQuestions.length > 0 ? (
                        <div className="topic-quiz-wrapper mt-5 pt-4 border-top">
                          <Quiz questions={allQuestions} topicId={topicId} />
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div className="compiler-section-wrapper">
                  {!showCompiler ? (
                    <div className="practice-cta">
                      <h3>Ready to write your first line of JS?</h3>
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>Try It Out</button>
                    </div>
                  ) : (
                    <div className="active-compiler-container">
                      <button className="hide-btn" onClick={() => setShowCompiler(false)}>Hide Compiler</button>
                      <div className="compiler-frame"><Compiler /></div>
                    </div>
                  )}
                </div>
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

export default FundamentalsTopic;
