import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "./NodeJs.css"; 
import ScrollTracker from '../../components/common/ScrollTracker';
import { useProgress } from '../../hooks/useProgress';
import ExerciseCompiler from '../../components/common/ExerciseCompiler';

const pathMap = {
  'nb': 0, 'nd': 1, 'nr': 2, 'na': 3, 'nc': 4,
  'ne': 5, 'nn': 6, 'nh': 7, 'nt': 8, 'nf': 9
};

function NodeJsTopic() {
  const { topicId: paramId } = useParams();
  const { curriculum, loading, error } = useCurriculum();
  
  // Determine the active topic from either the URL parameter or the raw path
  const currentPath = window.location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  // Coordinate: 'Node.js' is Index 3 in the curriculum cards array
  const activeCardIndex = 3;
  const [activeLink, setActiveLink] = useState(0); 
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  useEffect(() => {
    // If topicId is provided (from URL), update activeLink
    if (topicId && pathMap[topicId] !== undefined) {
      setActiveLink(pathMap[topicId]);
      updateLastVisited('Node.js', topicId);
    }
  }, [topicId, updateLastVisited]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleLinkSelect = (linkIndex) => {
    setActiveLink(linkIndex);
    if (isMobile) setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // API Syncing Guards
  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Node.js Path...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Connection Lost: {error}</div></div>;

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCardIndex];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  const renderDynamicSections = () => {
    if (!content) return null;
    const allKeys = Object.keys(content);
    
    const titleKeys = allKeys
      .filter(key => {
        const match = /^title(\d+)$/.exec(key);
        if (!match) return false;
        const numStr = match[1];
        if (numStr.endsWith('1') && numStr.length > 1) {
          const parentTitle = `title${numStr.slice(0, -1)}`;
          if (allKeys.includes(parentTitle)) return false;
        }
        return true;
      })
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    let codeIndex = 1;
    const renderedKeys = new Set(); 

    return titleKeys.map((titleKey) => {
      const num = parseInt(titleKey.replace('title', ''));
      const sectionTitle = content[titleKey];
      const sectionDesc = content[`title${num}1`] || content[`para${num}`] || content[`para${num + 1}`];
      
      const subheadingKeys = allKeys.filter(key => 
        key.startsWith(`heading${num}Subheading`) && !renderedKeys.has(key)
      ).sort();

      const subheadings = subheadingKeys.map(key => {
        renderedKeys.add(key);
        return content[key];
      }).filter(val => val && val.trim() !== "");

      let assignedCode = null;
      let assignedResult = null;

      if (subheadings.length === 0) {
        assignedCode = content[`code${codeIndex}`];
        assignedResult = codeIndex === 1 ? content['result'] : (content[`result${codeIndex - 1}`] || content[`result${codeIndex}`]);
        if (assignedCode) codeIndex++; 
      }

      return (
        <section key={titleKey} className="content-section">
          <h3>{sectionTitle}</h3>
          {(sectionDesc || subheadings.length > 0 || assignedCode) && <div className="section-divider"></div>}
          {sectionDesc && <p className="content-description">{sectionDesc}</p>}
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
                <span>{assignedResult ? `Output: ${assignedResult}` : "Implementation Example"}</span>
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
            <h2 className="sidebar-title">Node.js Mastery</h2>
            <div className="overall-progress-container">
               <div className="progress-label">Server-Side Progress: {computeHeadingProgress('Node.js')}%</div>
               <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${computeHeadingProgress('Node.js')}%` }}></div>
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
            <p className="page-subtitle">Mastering Server-Side JavaScript</p>

            {content ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{currentLink.text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{currentCard.heading}</span>
                      <span className="content-difficulty">Intermediate</span>
                      {pageProgress.status === 'Completed' && (
                        <span className="completion-badge">✅ Completed</span>
                      )}
                    </div>
                  </div>

                  <div className="content-body">
                    <p className="content-main-desc">{content.description}</p>
                    <ScrollTracker 
                      onComplete={() => markTheoryRead(topicId)} 
                      disabled={pageProgress.status === 'Completed'}
                    >
                      {renderDynamicSections()}
                    </ScrollTracker>

                    {/* DYNAMIC EXERCISES (Automatically rendered when added to backend) */}
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
                  </div>
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

export default NodeJsTopic;
