import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import data from "../data/data.json";
import "./Fundamentals.css";
import Compiler from './compiler';
function  Bitwise2() {
  const allCards = data.cards;
  const [activeCard, setActiveCard] = useState(1);
  const [activeLink, setActiveLink] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
      .catch((err) => {
        console.error('Failed to copy: ', err);
      });
  };

  const handleCardSelect = (cardIndex) => {
    setActiveCard(cardIndex);
    setActiveLink(0);
    if (isMobile) setSidebarOpen(false);
  };

  const handleLinkSelect = (linkIndex) => {
    setActiveLink(linkIndex);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div className="fundamentals-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <main style={{ flex: 1, padding: isMobile ? '0.5rem' : '1.5rem', marginTop: isMobile ? '0.5rem' : '1rem' }}>
        <h1 className="page-title" style={{ fontSize: isMobile ? '1.5rem' : '2rem', marginBottom: '1rem' }}>
          JavaScript Learning Hub
        </h1>
        
        <div className="content-container" style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row', 
          gap: isMobile ? '0.5rem' : '1.5rem'
        }}>
          {isMobile && (
            <button 
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              style={{
                marginTop:'30px',
                padding: '0.5rem',
                marginBottom: '30px',
                background: '#A7C7E7',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              {sidebarOpen ? '✕ Close' : '☰ Menu'}
            </button>
          )}
          
          <div className={`sidebar ${sidebarOpen ? 'open' : ''}`} style={{
            width: isMobile ? '100%' : '300px',
            flexShrink: 0,
            display: isMobile ? (sidebarOpen ? 'block' : 'none') : 'block',
            height: isMobile ? 'auto' : 'calc(100vh - 200px)',
            overflowY: 'auto',
            marginBottom: isMobile ? '0.5rem' : '0'
          }}>
            <h2 className="sidebar-title" style={{ 
              fontSize: '1.2rem', 
              padding: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              Topics
            </h2>
            
            <div className="sidebar-content" style={{ maxHeight: isMobile ? '60vh' : 'none', overflowY: 'auto' }}>
              <div className="sublinks-items">
                {allCards[activeCard !== null ? activeCard : 0].links.map((link, linkIndex) => (
                  <div
                    key={`link-${linkIndex}`}
                    className={`sublink-item ${activeLink === linkIndex ? 'active' : ''}`}
                    onClick={() => handleLinkSelect(linkIndex)}
                    style={{
                      padding: '0.75rem',
                      cursor: 'pointer',
                      borderBottom: '1px solid #eee',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <div className="sublink-icon" style={{ marginRight: '0.75rem' }}>
                      {linkIndex === activeLink ? '🔵' : '⚪'}
                    </div>
                    <div className="sublink-content" style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '1rem' }}>{link.text}</h4>
                      <p className="sublink-preview" style={{ 
                        margin: '0.25rem 0 0',
                        fontSize: '0.8rem',
                        color: '#666'
                      }}>
                        {link.pageContent?.description.substring(0, 60)}...
                      </p>
                    </div>
                    <div className="sublink-arrow" style={{ marginLeft: '0.5rem' }}>→</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="main-content" style={{ 
            flex: 1,
            minHeight: isMobile ? 'auto' : 'calc(100vh - 200px)',
            overflowY: 'auto'
          }}>
            {activeCard !== null && activeLink !== null ? (
              <div className="content-card" style={{ 
                background: '#fff',
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div className="content-header" style={{ marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                    <a 
                      href={allCards[activeCard].links[activeLink].url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="content-title-link"
                      style={{ color: '#1976d2', textDecoration: 'none' }}
                    >
                      {allCards[activeCard].links[activeLink].text}
                      <span className="external-link-icon" style={{ marginLeft: '0.5rem' }}>↗</span>
                    </a>
                  </h2>
                  <div className="content-meta" style={{ 
                    display: 'flex',
                    gap: '1rem',
                    marginTop: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <span className="content-category">{allCards[activeCard].heading}</span>
                    <span className="content-difficulty">Beginner</span>
                  </div>
                </div>
                
                <div className="content-body">
                  <p className="content-description" style={{ marginBottom: '1rem' }}>
                    {allCards[activeCard].links[activeLink].pageContent.description}
                  </p>
                  
                  {allCards[activeCard].links[activeLink].pageContent.title1 && (
                    <section className="content-section" style={{ marginBottom: '1.5rem' }}>
                      <div className="section-header" style={{ marginBottom: '0.75rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                          {allCards[activeCard].links[activeLink].pageContent.title1}
                        </h3>
                        <div className="section-divider" style={{ 
                          height: '1px',
                          background: '#eee',
                          margin: '0.5rem 0'
                        }}></div>
                      </div>
                      <p style={{ marginBottom: '1rem' }}>
                        {allCards[activeCard].links[activeLink].pageContent.para1}
                      </p>
                      {allCards[activeCard].links[activeLink].pageContent.code1 && (
                        <div className="code-container" style={{ 
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          marginBottom: '1rem'
                        }}>
                          <div className="code-header" style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: '#e0e0e0',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px'
                          }}>
                            <span className="code-language" style={{ fontSize: '0.8rem' }}>JavaScript</span>
                            <button 
                              className={`copy-button ${copied ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(allCards[activeCard].links[activeLink].pageContent.code1)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: copied ? '#4caf50' : '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {copied ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                          <pre style={{ 
                            margin: 0,
                            padding: '1rem',
                            overflowX: 'auto',
                            fontSize: '0.85rem'
                          }}>
                            <code>{allCards[activeCard].links[activeLink].pageContent.code1}</code>
                          </pre>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>
            ) : (
              <div className="welcome-message" style={{ 
                textAlign: 'center',
                padding: '2rem',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div className="welcome-illustration" style={{ marginBottom: '1rem' }}>
                  <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ 
                    width: '150px',
                    height: '150px'
                  }}>
                    <circle cx="100" cy="100" r="90" fill="#e3f2fd" />
                    <path d="M50,100 Q100,50 150,100 Q100,150 50,100 Z" fill="#bbdefb" />
                    <circle cx="80" cy="80" r="10" fill="#2196f3" />
                    <circle cx="120" cy="80" r="10" fill="#2196f3" />
                  </svg>
                </div>
                <h2 style={{ marginBottom: '0.5rem' }}>Welcome to JavaScript Learning Hub</h2>
                <p style={{ marginBottom: '1rem' }}>Select a category from the sidebar to begin your learning journey!</p>
                {isMobile && (
                  <button 
                    className="explore-button"
                    onClick={() => setSidebarOpen(true)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#1976d2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Explore Topics
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Compiler/>
      <Footer />
     
    </div>
  );
}


export default Bitwise2;