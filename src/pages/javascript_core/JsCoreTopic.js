import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "./JsCore.css"; 
import Compiler from '../compiler';

function JsCoreTopic() {
  const { topicId: paramId } = useParams();
  const { curriculum, loading, error } = useCurriculum();
  
  // Mapping for "JavaScript Core" series
  const pathMap = {
    'cc': 0, 'pa': 1, 'eh': 2, 'dom': 3, 'mdj': 4,
    'afa': 5, 'jds': 6, 'ef': 7, 'mmb': 8, 'paa': 9
  };

  const currentPath = window.location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  const activeCardIndex = 1;
  const [activeLink, setActiveLink] = useState(0); 
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

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

  const handleLinkSelect = (linkIndex) => {
    setActiveLink(linkIndex);
    if (isMobile) setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing JavaScript Core...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Error: {error}</div></div>;

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
        if (numStr.length > 1 && numStr.endsWith('1')) {
           const parentKey = `title${numStr.slice(0, -1)}`;
           if (allKeys.includes(parentKey)) return false;
        }
        return true;
      })
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    let codeCounter = 1;
    const renderedKeys = new Set(); 

    return titleKeys.map((titleKey) => {
      const num = parseInt(titleKey.replace('title', ''));
      const sectionTitle = content[titleKey];
      
      const sectionDesc = content[`title${num}1`] || content[`para${num}`] || content[`para${num + 1}`];

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

      let assignedCode = null;
      let assignedResult = null;
      
      if (currentSubheadings.length === 0 && !renderedKeys.has(`code${codeCounter}`)) {
          assignedCode = content[`code${codeCounter}`];
          if (codeCounter === 1) {
              assignedResult = content['result'] && !allKeys.includes('code2') ? content['result'] : null;
          } else if (codeCounter === 2) {
              assignedResult = content['result'];
          } else {
              assignedResult = content[`result${codeCounter - 2}`];
          }
          
          if (assignedCode) {
              renderedKeys.add(`code${codeCounter}`);
              codeCounter++;
          }
      }


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
                <span>{assignedResult ? `Output: ${assignedResult}` : "JS Core Example"}</span>
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
            <h2 className="sidebar-title">JS Core</h2>
            <div className="sublinks-items">
              {currentCard?.links.map((link, index) => (
                <div
                  key={index}
                  className={`sublink-item ${activeLink === index ? 'active' : ''}`}
                  onClick={() => handleLinkSelect(index)}
                >
                  <div className="sublink-content">
                    <h4>{link.text}</h4>
                    <p className="sublink-preview">{link.pageContent?.description?.substring(0, 45)}...</p>
                  </div>
                  <div className="sublink-arrow">→</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>
            <p className="page-subtitle">Deep dive into the core mechanics of JS.</p>

            {content ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{currentLink.text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{currentCard.heading}</span>
                      <span className="content-difficulty">Intermediate</span>
                    </div>
                  </div>

                  <div className="content-body">
                    <p className="content-description">{content.description}</p>
                    {renderDynamicSections()}

                    {content.exercises && content.exercises.length > 0 && (
                      <div className="exercises-section">
                        <h3 className="exercise-heading">⚡ Hands-on Challenges</h3>
                        <div className="section-divider"></div>
                        {content.exercises.map((ex, i) => (
                          <div key={ex.id || i} className="exercise-card">
                            <div className="exercise-badge">{ex.difficulty}</div>
                            <h4>{ex.title}</h4>
                            <p>{ex.description}</p>
                            <div className="exercise-tags">
                              {ex.tags?.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="compiler-section-wrapper">
                  {!showCompiler ? (
                    <div className="practice-cta">
                      <h3>Practice this concept?</h3>
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>Open Compiler</button>
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
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default JsCoreTopic;
