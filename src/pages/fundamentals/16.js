import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "../Fundamentals.css"; 
import Compiler from '../compiler';

function Fundamentals6() {
  const { curriculum, loading, error } = useCurriculum();

  // Coordinates: 'Fundamentals' (0) -> 'Control Flow' (6) or 'Operators' (5)
  const [activeCard] = useState(0); 
  const [activeLink, setActiveLink] = useState(6); 
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

  if (loading) return <div className="fundamentals-page"><Navbar /><div className="loading-state">Syncing Curriculum...</div></div>;
  if (error) return <div className="fundamentals-page"><Navbar /><div className="error-state">Connection Lost: {error}</div></div>;

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCard];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  const renderDynamicSections = () => {
    if (!content) return null;

    // 1. Collect and sort all title keys
    const titleKeys = Object.keys(content)
      .filter(key => /^title\d+$/.test(key))
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    // 2. State trackers to prevent jumbling and duplication
    let codeIndex = 1; 
    const renderedSubheadings = new Set(); // Prevents the 'Double Types' bug

    return titleKeys.map((titleKey) => {
      const num = parseInt(titleKey.replace('title', ''));
      const sectionTitle = content[titleKey];
      
      // Look for descriptions (titleN1, paraN, or paraN+1)
      const sectionDesc = content[`title${num}1`] || content[`para${num}`] || content[`para${num + 1}`];
      
      // Look for subheadings tied to this specific title (or N+1 for the Operators typo)
      const subheadingKeys = Object.keys(content).filter(key => 
        (key.startsWith(`heading${num}Subheading`) || key.startsWith(`heading${num + 1}Subheading`)) &&
        !renderedSubheadings.has(key)
      ).sort();

      const subheadings = subheadingKeys.map(key => {
        renderedSubheadings.add(key); // Mark as used so it won't duplicate later
        return content[key];
      }).filter(val => val && val.trim() !== "");

      // Logic: If a section has subheadings (Summary List), it usually DOES NOT have code.
      // If it's a detail section (No subheadings), it uses the next available code index.
      let assignedCode = null;
      let assignedResult = null;

      if (subheadings.length === 0 && (sectionDesc || content[`code${codeIndex}`])) {
        assignedCode = content[`code${codeIndex}`];
        assignedResult = codeIndex === 1 ? content['result'] : (content[`result${codeIndex - 1}`] || content[`result${codeIndex}`]);
        codeIndex++; // Only increment when a code block is actually consumed
      }

      return (
        <section key={titleKey} className="content-section">
          <h3>{sectionTitle}</h3>
          {(sectionDesc || subheadings.length > 0 || assignedCode) && <div className="section-divider"></div>}
          
          {sectionDesc && <p className="content-description">{sectionDesc}</p>}

          {/* Render List ONLY if not already rendered elsewhere */}
          {subheadings.length > 0 && (
            <ul className="learning-list">
              {subheadings.map((sub, idx) => (
                <li key={idx}><strong>{sub}</strong></li>
              ))}
            </ul>
          )}

          {/* Render Code with synced sequential indexing */}
          {assignedCode && (
            <div className="code-container">
              <div className="code-header">
                <span>{assignedResult ? `Output: ${assignedResult}` : "JavaScript Output"}</span>
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
                        <span className="content-difficulty">Beginner</span>
                      </div>
                    </div>
                    <div className="content-body">
                      <p className="content-main-desc">{content.description}</p>
                      {renderDynamicSections()}
                    </div>
                  </div>

                  <div className="compiler-section-wrapper">
                    {!showCompiler ? (
                      <div className="practice-cta">
                        <h3>Ready to test this?</h3>
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

export default Fundamentals6;