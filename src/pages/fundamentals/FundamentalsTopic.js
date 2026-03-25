import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "./Fundamentals.css"; 
import Compiler from '../compiler';

function FundamentalsTopic() {
  const { topicId: paramId } = useParams();
  const { curriculum, loading, error } = useCurriculum();
  
  // Mapping for "Fundamentals" series
  const pathMap = {
    'js': 0, 'jsb': 1, 'sue': 2, 'gs': 3, 'vc': 4,
    'oe': 5, 'cf': 6, 'fc': 7, 'ao': 8, 'ehd': 9
  };

  const currentPath = window.location.pathname.replace(/^\//, '');
  const topicId = paramId || currentPath;

  const activeCardIndex = 0;
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

  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Curriculum...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Error: {error}</div></div>;

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCardIndex];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  const renderDynamicSections = () => {
    if (!content) return null;
    const allKeys = Object.keys(content);
    
    // Find all title keys (title1, title2, etc.)
    const titleKeys = allKeys
      .filter(key => /^title(\d+)$/.test(key))
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    let codeCounter = 1;
    const renderedKeys = new Set(); 

    return titleKeys.map((titleKey) => {
      const num = parseInt(titleKey.replace('title', ''));
      const sectionTitle = content[titleKey];
      
      // Look for descriptions: titleN1, paraN, paraN+1
      const sectionDesc = content[`title${num}1`] || content[`para${num}`] || content[`para${num + 1}`];

      // Robust subheading lookup (matches headingNSubheadingM where N can vary)
      const subheadingKeys = allKeys.filter(key => {
        const match = /^heading(\d+)Subheading(\d+)$/.exec(key);
        return match && !renderedKeys.has(key);
      }).sort((a, b) => {
          const matchA = /^heading(\d+)Subheading(\d+)$/.exec(a);
          const matchB = /^heading(\d+)Subheading(\d+)$/.exec(b);
          return parseInt(matchA[1]) - parseInt(matchB[1]) || parseInt(matchA[2]) - parseInt(matchB[2]);
      });

      // We only take subheadings that belong "spiritually" to this section 
      // or are next in line if this section has no para/code.
      const currentSubheadings = [];
      if (subheadingKeys.length > 0) {
          // If the heading number matches or we are at a specific title index
          const firstSubKeyNum = parseInt(/^heading(\d+)/.exec(subheadingKeys[0])[1]);
          if (firstSubKeyNum === num || (num === 3 && firstSubKeyNum === 4)) {
              subheadingKeys.forEach(k => {
                  currentSubheadings.push(content[k]);
                  renderedKeys.add(k);
              });
          }
      }

      // Logic for assigning code snippets
      let assignedCode = null;
      let assignedResult = null;
      
      // If no subheadings, we assume this section owns the next code snippet
      if (currentSubheadings.length === 0 && !renderedKeys.has(`code${codeCounter}`)) {
          assignedCode = content[`code${codeCounter}`];
          assignedResult = (codeCounter === 1 ? content['result'] : content[`result${codeCounter - 1}`]);
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
                <span>{assignedResult ? `Output: ${assignedResult}` : "Code Example"}</span>
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
            <h2 className="sidebar-title">Fundamentals</h2>
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
            <p className="page-subtitle">Master the basics, build the future.</p>

            {content ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{currentLink.text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{currentCard.heading}</span>
                      <span className="content-difficulty">Beginner</span>
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
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default FundamentalsTopic;
