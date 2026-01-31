import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "../Fundamentals.css"; 
import Compiler from '../compiler';

function Switchjs2() {
  const { curriculum, loading, error } = useCurriculum();

  // Coordinates: 'Node.js' is typically Index 3 in your backend data.json
  const [activeCard] = useState(3); 
  const [activeLink, setActiveLink] = useState(1); 
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

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

  // State Guards for API Syncing
  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Curriculum...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Error: {error}</div></div>;

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCard];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  const renderDynamicSections = () => {
    if (!content) return null;

    const allKeys = Object.keys(content);
    
    // 1. Filter out sub-keys like title41 to ensure only primary headings are processed
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
      
      // Match descriptions (titleN1, paraN, or paraN+1)
      const sectionDesc = content[`title${num}1`] || content[`para${num}`] || content[`para${num + 1}`];
      
      // Handle the /oe typo and avoid duplicate rendering
      const isOperatorsPage = currentLink.url === "/oe";
      const subheadingKeys = allKeys.filter(key => 
        (key.startsWith(`heading${num}Subheading`) || (isOperatorsPage && key.startsWith(`heading${num + 1}Subheading`))) && 
        !renderedKeys.has(key)
      ).sort();

      const subheadings = subheadingKeys.map(key => {
        renderedKeys.add(key);
        return content[key];
      }).filter(val => val && val.trim() !== "");

      // ALIGNMENT LOGIC: Assign code sequentially only if it's a detail section (not a list header)
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

          {/* List Rendering */}
          {subheadings.length > 0 && (
            <ul className="learning-list">
              {subheadings.map((sub, idx) => (
                <li key={idx}><strong>{sub}</strong></li>
              ))}
            </ul>
          )}

          {/* Code/Example Rendering */}
          {assignedCode && (
            <div className="code-container">
              <div className="code-header">
                <span>{assignedResult ? `Output: ${assignedResult}` : "Node.js Example"}</span>
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
            <h2 className="sidebar-title">Node.js Mastery</h2>
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
                </div>
              ))}
            </div>
          </aside>

          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>
            <div className="content-wrapper">
              {content ? (
                <>
                  <div className="content-card">
                    <div className="content-header">
                      <h2>{currentLink.text}</h2>
                      <div className="content-meta">
                        <span className="content-category">{currentCard.heading}</span>
                        <span className="content-difficulty">Intermediate</span>
                      </div>
                    </div>
                    <div className="content-body">
                      <p className="content-main-desc">{content.description}</p>
                      {renderDynamicSections()}

                      {/* DYNAMIC EXERCISES (Automatically show up when added via Backend) */}
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

                  <div className="compiler-section-wrapper">
                    {!showCompiler ? (
                      <div className="practice-cta">
                        <h3>Ready to build this?</h3>
                        <button className="try-it-btn" onClick={() => setShowCompiler(true)}>Try It Out</button>
                      </div>
                    ) : (
                      <div className="active-compiler-container">
                        <button className="hide-btn" onClick={() => setShowCompiler(false)}>Hide Compiler</button>
                        <div className="compiler-frame"><Compiler /></div>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Switchjs2;