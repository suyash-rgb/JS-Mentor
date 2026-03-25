import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "./Frontend.css"; 
import ScrollTracker from '../../components/common/ScrollTracker';
import { useProgress } from '../../hooks/useProgress';

const pathMap = {
  'rb': 0, 'rd': 1, 'rr': 2, 'ra': 3, 'rc': 4,
  're': 5, 'rn': 6, 'rh': 7, 'rt': 8, 'rf': 9
};

function FrontendTopic() {
  const { topicId: paramId } = useParams();
  const { curriculum, loading, error } = useCurriculum();
  
  // Mapping of shortcodes for the "Frontend Frameworks" series
  // const pathMap = {
  //   'ff': 0, 'rb': 1, 'rrn': 2, 'smr': 3, 'sr': 4,
  //   'hfui': 5, 'lmr': 6, 'iav': 7, 'spa': 8, 'tfc': 9
  // };

  const currentPath = window.location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  // Coordinate: 'Frontend Frameworks' is Index 2 in the curriculum cards array
  const activeCardIndex = 2;
  const [activeLink, setActiveLink] = useState(0); 
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { markTheoryRead, computePageProgress, computeHeadingProgress } = useProgress();
  const pageProgress = computePageProgress(topicId);

  useEffect(() => {
    if (topicId && pathMap[topicId] !== undefined) {
      setActiveLink(pathMap[topicId]);
    }
  }, [topicId]);

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

  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Frontend Path...</div></div>;
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

      // Aligned lookup with sequential fallback
      const assignedCode = content[`code${num}`] || content[`code${codeIndex}`];
      const assignedResult = content[`result${num}`] || (codeIndex === 1 ? content['result'] : (content[`result${codeIndex - 1}`] || content[`result${codeIndex}`]));

      if (assignedCode && !content[`code${num}`]) {
          codeIndex++;
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
            <h2 className="sidebar-title">Frontend Mastery</h2>
            <div className="overall-progress-container">
               <div className="progress-label">Frameworks Progress: {computeHeadingProgress('Frontend Frameworks')}%</div>
               <div className="progress-bar-bg">
                  <div className="progress-bar-fill" style={{ width: `${computeHeadingProgress('Frontend Frameworks')}%` }}></div>
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
            <p className="page-subtitle">Mastering React, Vue, & Modern UI</p>

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
                        {content.exercises.map((ex, i) => (
                          <div key={ex.id || i} className="exercise-card">
                            <div className="exercise-badge">{ex.difficulty}</div>
                            <h4>{ex.title}</h4>
                            <p>{ex.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FrontendTopic;
