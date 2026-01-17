import React, { useState, useEffect } from 'react';
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import data from "../../data/data.json";
import "../Fundamentals.css"; // Centralized styling
import Compiler from '../compiler';

function Fivth9() {
  const allCards = data.cards;
  const [activeCard, setActiveCard] = useState(4);
  const [activeLink, setActiveLink] = useState(8); 
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCompiler, setShowCompiler] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getContent = () => allCards[activeCard]?.links[activeLink]?.pageContent;

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
            <h2 className="sidebar-title">Topics</h2>
            <div className="sublinks-items">
              {allCards[activeCard]?.links.map((link, index) => (
                <div
                  key={index}
                  className={`sublink-item ${activeLink === index ? 'active' : ''}`}
                  onClick={() => handleLinkSelect(index)}
                >
                  <div className="sublink-content">
                    <h4>{link.text}</h4>
                    <p className="sublink-preview">{link.pageContent?.description.substring(0, 45)}...</p>
                  </div>
                  <div className="sublink-arrow">→</div>
                </div>
              ))}
            </div>
          </aside>

          <section className="main-content">
            <h1 className="page-title">JavaScript Learning Hub</h1>
            <p className="page-subtitle">Bridging the Gap: Full-Stack Connectivity</p>

            {getContent() ? (
              <div className="content-wrapper">
                <div className="content-card">
                  <div className="content-header">
                    <h2>{allCards[activeCard].links[activeLink].text}</h2>
                    <div className="content-meta">
                      <span className="content-category">{allCards[activeCard].heading}</span>
                      <span className="content-difficulty">Advanced</span>
                    </div>
                  </div>

                  <div className="content-body">
                    <p className="content-description">{getContent().description}</p>

                    {/* Section 1: Communication Methods */}
                    {getContent().title1 && (
                      <section className="content-section">
                        <h3>{getContent().title1}</h3>
                        <div className="section-divider"></div>
                        <p>{getContent().para1}</p>
                        {getContent().code1 && (
                          <div className="code-container">
                            <div className="code-header"><span>Standard AJAX (XHR)</span></div>
                            <pre><code>{getContent().code1}</code></pre>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Section 3: RESTful API Integration Summary */}
                    {getContent().title3 && (
                      <section className="content-section">
                        <h3>{getContent().title3}</h3>
                        <div className="section-divider"></div>
                        <ul className="learning-list">
                          <li><strong>{getContent().heading3Subheading1}</strong></li>
                          <li><strong>{getContent().heading3Subheading2}</strong></li>
                          <li><strong>{getContent().heading3Subheading3}</strong></li>
                        </ul>
                      </section>
                    )}

                    {/* Section 4: Endpoint Design */}
                    {getContent().title4 && (
                      <section className="content-section">
                        <h3>{getContent().title4}</h3>
                        <p>{getContent().title41}</p>
                        {getContent().code2 && (
                          <div className="code-container">
                            <div className="code-header"><span>Server-side Endpoint Example</span></div>
                            <pre><code>{getContent().code2}</code></pre>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Section 5: HTTP Methods */}
                    {getContent().title5 && (
                      <section className="content-section">
                        <h3>{getContent().title5}</h3>
                        <p>{getContent().title51}</p>
                        {getContent().code3 && (
                          <div className="code-container">
                             <pre><code>{getContent().code3}</code></pre>
                          </div>
                        )}
                      </section>
                    )}

                    {/* Section 6: Data Formats (JSON) */}
                    {getContent().title6 && (
                      <section className="content-section">
                        <h3>{getContent().title6}</h3>
                        <p>{getContent().title61}</p>
                        {getContent().code4 && (
                          <div className="code-container">
                             <div className="code-header"><span>Handling JSON Requests</span></div>
                            <pre><code>{getContent().code4}</code></pre>
                          </div>
                        )}
                      </section>
                    )}
                  </div>
                </div>

                <div className="compiler-section-wrapper">
                  {!showCompiler ? (
                    <div className="practice-cta">
                      <h3>Ready to simulate a Full-Stack request?</h3>
                      <button className="try-it-btn" onClick={() => setShowCompiler(true)}>
                        <i className="fas fa-code"></i> Try It Out
                      </button>
                    </div>
                  ) : (
                    <div className="active-compiler-container">
                       <button className="hide-btn" onClick={() => setShowCompiler(false)}>Hide Compiler</button>
                       <Compiler />
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

export default Fivth9;