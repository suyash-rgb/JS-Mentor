import React from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Hero from "../components/landing/Hero";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "./About.css"; // Reuse About styles for the About section on Home page
import "./Home.css";

function Home() {
  return (
    <div className="Home">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />

      {/* About Section - Merged from About.js */}
      <div className="about-content" id="about-section">
        {/* Mission Section */}
        <section className="mission-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Mission</h2>
              <div className="header-underline"></div>
            </div>
            <p className="mission-text">
              At JS Mentor Training Institute, we believe that quality education should be accessible to everyone. 
              Our mission is to empower aspiring developers with practical, industry-relevant skills that prepare them 
              for real-world job challenges. We don't just teach theory—we teach from experience, by coders, for coders.
            </p>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="why-section">
          <div className="container">
            <div className="section-header">
              <h2>Why Choose JS Mentor?</h2>
              <div className="header-underline"></div>
            </div>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-code"></i>
                </div>
                <h3>Expert Instructors</h3>
                <p>Learn from experienced coders with real industry expertise, not just tutors reading from books.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-briefcase"></i>
                </div>
                <h3>Job-Ready Skills</h3>
                <p>Our curriculum is designed to make you job-ready with practical, hands-on experience in modern technologies.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-laptop"></i>
                </div>
                <h3>Interactive Learning</h3>
                <p>Learn through interactive projects, real-world scenarios, and hands-on coding exercises.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-graduation-cap"></i>
                </div>
                <h3>Comprehensive Curriculum</h3>
                <p>From fundamentals to advanced concepts, we cover everything needed to become a professional developer.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-tools"></i>
                </div>
                <h3>AI-Powered Tools</h3>
                <p>Access cutting-edge AI tools including our JS Compiler and AI Assistant to enhance your learning.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-users"></i>
                </div>
                <h3>Community Support</h3>
                <p>Join a vibrant community of learners and instructors ready to help you succeed on your coding journey.</p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Offer Section */}
        <section className="offer-section">
          <div className="container">
            <div className="section-header">
              <h2>What We Offer</h2>
              <div className="header-underline"></div>
            </div>

            <div className="offer-grid">
              <div className="offer-item">
                <h4>📚 Fundamentals Course</h4>
                <p>Master the core concepts of JavaScript from basics to intermediate level with our comprehensive fundamentals course.</p>
              </div>

              <div className="offer-item">
                <h4>🔨 JS Compiler</h4>
                <p>Practice and test your JavaScript code in real-time with our built-in compiler and code editor.</p>
              </div>

              <div className="offer-item">
                <h4>🤖 AI Assistant</h4>
                <p>Get instant help from our AI-powered assistant for coding questions, debugging, and learning guidance.</p>
              </div>

              <div className="offer-item">
                <h4>🎓 Expert Mentorship</h4>
                <p>Receive guidance from industry professionals who understand what employers are looking for.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="contact-section">
          <div className="container">
            <div className="section-header">
              <h2>Get in Touch</h2>
              <div className="header-underline"></div>
            </div>

            <div className="contact-info">
              <div className="contact-detail">
                <i className="fas fa-map-marker-alt"></i>
                <div>
                  <h4>Visit Us</h4>
                  <p>Orange Business Park, 110, Bhawarkua Main Rd, Indore, Madhya Pradesh 452001</p>
                </div>
              </div>

              <div className="contact-detail">
                <i className="fas fa-envelope"></i>
                <div>
                  <h4>Email</h4>
                  <p>chetanyaa004@gmail.com</p>
                </div>
              </div>

              <div className="contact-detail">
                <i className="fas fa-globe"></i>
                <div>
                  <h4>Online</h4>
                  <p>Learn anytime, anywhere with our LMS</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

export default Home;