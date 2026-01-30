import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useCurriculum } from '../../hooks/useCurriculum'; 
import "../Fundamentals.css"; 
import Compiler from '../compiler';

function Ternary7() {
  // 1. DYNAMIC DATA FETCHING
  // This hook now talks to http://localhost:8000/trainer/curriculum
  const { curriculum, loading, error } = useCurriculum();

  const [activeCard, setActiveCard] = useState(2); // Default to 'Frontend Frameworks' based on your JSON
  const [activeLink, setActiveLink] = useState(6); // Default to 'React Basics'
  const [isMobile, setIsMobile] = useState(false); 
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

  // Handle Responsive Sidebar
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

  // 2. LOADING & ERROR STATES
  // Essential because 'curriculum' starts as null while the API responds
  if (loading) {
    return (
      <div className="fundamentals-page">
        <Navbar />
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Fetching latest curriculum from JS Mentor Backend...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundamentals-page">
        <Navbar />
        <div className="error-container">
          <h3>Connection Error</h3>
          <p>{error}. Please ensure your FastAPI server is running.</p>
        </div>
        <Footer />
      </div>
    );
  }

  // 3. DATA MAPPING
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

          {/* SIDEBAR: Dynamically generated from Backend JSON */}
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <h2 className="sidebar-title">Topics</h2>
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
            <p className="page-subtitle">Mastering {currentCard?.heading}</p>

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

                    {/* Dynamic Sections: Logic checks for title1 through title6 */}
                    {[1, 3, 4, 5, 6].map((num) => {
                      const titleKey = `title${num}`;
                      const paraKey = num === 1 ? 'para1' : `title${num}1`;
                      const codeKey = num === 1 ? 'code1' : `code${num === 3 ? null : num - 2}`; // Matches your specific JSON mapping
                      
                      if (!content[titleKey]) return null;

                      return (
                        <section key={num} className="content-section">
                          <h3>{content[titleKey]}</h3>
                          <div className="section-divider"></div>
                          <p>{content[paraKey]}</p>
                          
                          {/* Special rendering for Section 3 (List) vs others (Code) */}
                          {num === 3 ? (
                            <ul className="learning-list">
                              <li><strong>{content.heading3Subheading1}</strong></li>
                              <li><strong>{content.heading3Subheading2}</strong></li>
                              <li><strong>{content.heading3Subheading3}</strong></li>
                            </ul>
                          ) : content[`code${num === 1 ? 1 : num-2}`] && (
                            <div className="code-container">
                              <div className="code-header">
                                <span>{content.result || "JavaScript"}</span>
                              </div>
                              <pre><code>{content[`code${num === 1 ? 1 : num-2}`]}</code></pre>
                            </div>
                          )}
                        </section>
                      );
                    })}

                    {/* 4. NEW: DYNAMIC EXERCISES SECTION */}
                    {/* This will render whatever the Trainer 'injects' via the Backend */}
                    {content.exercises && content.exercises.length > 0 && (
                      <div className="exercises-section">
                        <h3 className="exercise-heading">⚡ Hands-on Challenges</h3>
                        {content.exercises.map((ex, i) => (
                          <div key={ex.id || i} className="exercise-card">
                            <h4>{ex.title}</h4>
                            <p>{ex.description}</p>
                            <span className={`badge ${ex.difficulty.toLowerCase()}`}>
                              {ex.difficulty}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* COMPILER SECTION */}
                <div className="compiler-section-wrapper">
                  {!showCompiler ? (
                    <div className="practice-cta">
                      <h3>Ready to build your first component?</h3>
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>
                        <i className="fas fa-code"></i> Try It Out
                      </button>
                    </div>
                  ) : (
                    <div className="active-compiler-container">
                      <button className="hide-btn" onClick={() => setShowCompiler(false)}>
                        Hide Compiler
                      </button>
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

export default Ternary7;