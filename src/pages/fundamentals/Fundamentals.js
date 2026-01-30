import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "../Fundamentals.css"; 
import Compiler from '../compiler';

function Fundamentals() {
  // 1. DYNAMIC DATA FETCHING
  // Connects to the backend 'Source of Truth'
  const { curriculum, loading, error } = useCurriculum();

  const [activeCard, setActiveCard] = useState(0); // Pinned to 'Fundamentals'
  const [activeLink, setActiveLink] = useState(0); // Pinned to 'Introduction to JS'
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

  // Handle Responsive Layout
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

  // 2. STATE GUARDS
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

  // Data mapping from the synchronized data.json
  const allCards = curriculum?.cards || [];
  const currentCard = allCards[activeCard];
  const currentLink = currentCard?.links[activeLink];
  const content = currentLink?.pageContent;

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

          {/* SIDEBAR: Dynamically built from Backend State */}
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

                    {/* Section 1: Contextual Overview */}
                    {content.title1 && (
                      <section className="content-section">
                        <h3>{content.title1}</h3>
                        <div className="section-divider"></div>
                        <p>{content.para1}</p>
                        {content.code1 && (
                          <div className="code-container">
                             <div className="code-header"><span>Standard Output</span></div>
                            <pre><code>{content.code1}</code></pre>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Section 3: Summary Lists */}
                    {content.title3 && (
                      <section className="content-section">
                        <h3>{content.title3}</h3>
                        <div className="section-divider"></div>
                        <ul className="learning-list">
                          <li><strong>{content.heading3Subheading1}</strong></li>
                          <li><strong>{content.heading3Subheading2}</strong></li>
                          <li><strong>{content.heading3Subheading3}</strong></li>
                        </ul>
                      </section>
                    )}

                    {/* Dynamic Iteration for code snippets 4, 5, 6 */}
                    {[4, 5, 6].map((num) => {
                      const titleKey = `title${num}`;
                      const subKey = `title${num}1`;
                      const codeKey = `code${num - 2}`;
                      const resKey = num === 4 ? 'result' : `result${num - 4}`;

                      if (!content[titleKey]) return null;

                      return (
                        <section key={num} className="content-section">
                          <h3>{content[titleKey]}</h3>
                          <p>{content[subKey]}</p>
                          {content[codeKey] && (
                            <div className="code-container">
                              <div className="code-header">
                                <span>Output: {content[resKey]}</span>
                              </div>
                              <pre><code>{content[codeKey]}</code></pre>
                            </div>
                          )}
                        </section>
                      );
                    })}

                    {/* 3. DYNAMIC EXERCISES SECTION (Trainer Injected) */}
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

                {/* INTERACTIVE COMPILER */}
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

export default Fundamentals;