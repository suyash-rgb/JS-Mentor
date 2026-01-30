import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "../Fundamentals.css"; 
import Compiler from '../compiler';

function Fundamentals5() {
  const { curriculum, loading, error } = useCurriculum();

  const [activeCard, setActiveCard] = useState(0); 
  const [activeLink, setActiveLink] = useState(4); 
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

  if (loading) return (
    <div className="fundamentals-page">
      <Navbar /><div className="loading-state">Syncing Curriculum...</div>
    </div>
  );

  if (error) return (
    <div className="fundamentals-page">
      <Navbar /><div className="error-state">Connection Lost: {error}</div>
    </div>
  );

  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCard];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

  // Helper function to render sections dynamically based on key patterns in data.json
  const renderDynamicSections = () => {
    if (!content) return null;

    // Identify all title keys (title1, title2, title3, etc.) and sort them numerically
    const titleKeys = Object.keys(content)
      .filter(key => /^title\d+$/.test(key))
      .sort((a, b) => parseInt(a.replace('title', '')) - parseInt(b.replace('title', '')));

    return titleKeys.map((titleKey) => {
      const num = titleKey.replace('title', '');
      const sectionTitle = content[titleKey];
      
      // Look for description/paragraph variants (paraN, paraN+1, or titleN1)
      const sectionDesc = content[`para${num}`] || content[`para${parseInt(num)+1}`] || content[`title${num}1`];
      
      // Look for code and result variants
      const code = content[`code${num}`] || content[`code${parseInt(num)-1}`] || content[`code${parseInt(num)-2}`];
      const result = content[`result${parseInt(num)-4}`] || content[`result${parseInt(num)-3}`] || content['result'];

      // Dynamically find all subheadings for this specific section (headingNSubheadingM)
      const subheadings = Object.keys(content)
        .filter(key => key.startsWith(`heading${num}Subheading`))
        .sort()
        .map(key => content[key]);

      return (
        <section key={titleKey} className="content-section">
          <h3>{sectionTitle}</h3>
          {/* Only show divider if it's a main heading section */}
          {subheadings.length > 0 || code ? <div className="section-divider"></div> : null}
          
          {sectionDesc && <p>{sectionDesc}</p>}

          {/* Render List if subheadings exist, ensuring no empty bullets */}
          {subheadings.length > 0 && (
            <ul className="learning-list">
              {subheadings.map((sub, idx) => sub && (
                <li key={idx}><strong>{sub}</strong></li>
              ))}
            </ul>
          )}

          {/* Render Code Block */}
          {code && (
            <div className="code-container">
              <div className="code-header">
                <span>{num === "1" || !result ? "Standard Output" : `Output: ${result}`}</span>
              </div>
              <pre><code>{code}</code></pre>
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
                    <p className="sublink-preview">
                      {link.pageContent?.description?.substring(0, 45)}...
                    </p>
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

                    {/* DYNAMIC SECTION RENDERER */}
                    {renderDynamicSections()}

                    {/* DYNAMIC EXERCISES SECTION */}
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
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>
                        <i className="fas fa-code"></i> Try It Out
                      </button>
                    </div>
                  ) : (
                    <div className="active-compiler-container">
                        <button className="hide-btn" onClick={() => setShowCompiler(false)}>Hide Compiler</button>
                        <div className="compiler-frame">
                          <Compiler />
                        </div>
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

export default Fundamentals5;