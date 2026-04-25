import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './Footer.css'; 
import logo from '../Images/jsmentorlogof.png'; 
import address from "../Images/address_icon.png";
import email from "../Images/email.png";

const Footer = () => {
  return (
    <footer className="footer-container">
      <Container>
        <Row className="footer-content">
          <Col lg={4} md={12} className="footer-brand mb-4 mb-lg-0">
            <div className="brand-wrapper">
              <img
                src={logo}
                alt="JS Mentor Logo"
                className="footer-logo" 
              />
              <p className="company-name">Accelerate your coding journey. Learn from actual developers, not just tutors.</p>
            </div>
          </Col>
          
          <Col lg={4} md={6} className="footer-contact mb-4 mb-md-0">
            <h5 className="footer-section-title">Contact Us</h5>
            <ul className="contact-list">
              <li className="contact-item">
                <img width="14" src={address} alt="Address" className="contact-icon" />
                <span>Bhawarkua Main Rd, Indore, MP 452001</span>
              </li>
              <li className="contact-item">
                <img width="14" src={email} alt="Email" className="contact-icon" />
                <span>chetanyaa004@gmail.com</span>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={6} className="footer-links">
            <h5 className="footer-section-title">Quick Links</h5>
            <ul className="links-list">
              <li><Link to="/learning-paths">Learning Paths</Link></li>
              <li><Link to="/jscompiler">JS Compiler</Link></li>
              <li><Link to="/Ai">AI Assistant</Link></li>
              <li><a href="/#about-section">Our Mission</a></li>
            </ul>
          </Col>
        </Row>
        
        <Row>
          <Col className="footer-bottom">
            <div className="copyright-text">
              © {new Date().getFullYear()} JS Mentor Training Institute • Turning Ideas into Code
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
