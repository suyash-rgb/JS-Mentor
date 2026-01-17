import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import data from "../../data/data.json";
import "../Fundamentals.css"; // Uses the updated CSS with the left-aligned tinted sidebar
import Compiler from '../jscompiler';

function Fundamentals5() {
  const allCards = data.cards;
  const [activeCard, setActiveCard] = useState(0);
  const [activeLink, setActiveLink] = useState(4); // Default for this specific page
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error('Failed to copy: ', err));
  };

  const handleLinkSelect = (linkIndex) => {
    setActiveLink(linkIndex);
    if (isMobile) setSidebarOpen(false);
    // Smoothly return to top of lesson when switching topics
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fundamentals-page">
      <Navbar />

      <main className="fundamentals-main">
        <div className="content-container">
          
          {/* Mobile Navigation Toggle */}
          {isMobile && (
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '✕ Close' : '☰ Topics'}
            </button>
          )}

          {/* Sidebar: Pinned left with elevated white items on tinted background */}
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            <h2 className="sidebar-title">Topics</h2>
            <div className="sublinks-items">
              {allCards[activeCard].links.map((link, index) => (
                <div
                  key={index}
                  className={`sublink-item ${activeLink === index ? 'active' : ''}`}
                  onClick={() => handleLinkSelect(index)}
                >
                  <div className="sublink-content">
                    <h4>{link.text}</h4>
                    <p className="sublink-preview">
                      {link.pageContent?.description.substring(0, 50)}...
                    </p>
                  </div>
                  <div className="sublink-arrow">→</div>
                </div>
              ))}
            </div>
          </aside>

          {/* Fluid Main Content area */}
          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>

            {activeCard !== null && activeLink !== null ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{allCards[activeCard].links[activeLink].text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{allCards[activeCard].heading}</span>
                      <span className="content-difficulty">Beginner</span>
                    </div>
                  </div>

                  <div className="content-body">
                    <p className="content-description">
                      {allCards[activeCard].links[activeLink].pageContent.description}
                    </p>

                    {allCards[activeCard].links[activeLink].pageContent.title1 && (
                      <section className="content-section">
                        <h3>{allCards[activeCard].links[activeLink].pageContent.title1}</h3>
                        <div className="section-divider"></div>
                        <p>{allCards[activeCard].links[activeLink].pageContent.para1}</p>
                        
                        {allCards[activeCard].links[activeLink].pageContent.code1 && (
                          <div className="code-container">
                            <div className="code-header">
                              <span className="code-language">JavaScript</span>
                              <button
                                className={`copy-button ${copied ? 'copied' : ''}`}
                                onClick={() => copyToClipboard(allCards[activeCard].links[activeLink].pageContent.code1)}
                              >
                                {copied ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                            <pre>
                              <code>{allCards[activeCard].links[activeLink].pageContent.code1}</code>
                            </pre>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                </div>

                {/* Practice Compiler Section */}
                <div className="compiler-section-wrapper">
                  {!showCompiler ? (
                    <div className="practice-cta">
                      <h3>Ready to apply what you've learned?</h3>
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>
                        <i className="fas fa-code"></i> Try It Out
                      </button>
                    </div>
                  ) : (
                    <div className="active-compiler-container">
                      <div className="compiler-controls">
                        <button className="hide-btn" onClick={() => setShowCompiler(false)}>
                          Hide Compiler
                        </button>
                      </div>
                      <Compiler />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="welcome-message">
                <h2>Choose a Topic</h2>
                <p>Select a lesson from the menu on the left to get started!</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Fundamentals5;