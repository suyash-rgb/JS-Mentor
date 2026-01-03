import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css'; 
import logo from '../Images/jsmentorlogof.png'; //
import address from "../Images/address_icon.png";
import email from "../Images/email.png";
// import phone from "../Images/phone.png";

const Footer = () => {
  return (
    <footer className="footer-container">
      <Container>
        <Row className="footer-content">
          <Col lg={4} md={6} className="footer-brand mb-4 mb-md-0">
            <div className="brand-wrapper">
              <img
                width="180px"
                src={logo}
                alt="Apoliums Logo"
                className="footer-logo" 
              />
              <p className="company-name">We'll help you to become job-ready. Learn from actual coders, not just tutors.</p>
            </div>
          </Col>
          
          <Col lg={4} md={6} className="footer-contact mb-4 mb-md-0">
            <h5 className="footer-section-title">Contact Us</h5>
            <ul className="contact-list">
              <li className="contact-item">
                <img width="16" src={address} alt="Address" className="contact-icon" />
                <span>Orange business park, 110, Bhawarkua Main Rd, Indore, Madhya Pradesh 452001</span>
              </li>
              <li className="contact-item">
                <img width="16" src={email} alt="Email" className="contact-icon" />
                <span>Email: chetanyaa004@gmail.com</span>
              </li>
              {/* <li className="contact-item">
                <img width="16" src={phone} alt="Phone" className="contact-icon" />
                <span>Phone:  </span>
              </li> */}
            </ul>
          </Col>
          
          <Col lg={4} md={12} className="footer-links mt-4 mt-lg-0">
            <h5 className="footer-section-title">Quick Links</h5>
            <ul className="links-list">
              <li><a href="/">Fundamental</a></li>
              <li><a href="/jscompiler">JS Compiler</a></li>
              <li><a href="/Ai">AI</a></li>
              <li><a href="/about">About</a></li>
            </ul>
          </Col>
        </Row>
        
        <Row>
          <Col className="footer-bottom">
            <div className="copyright-text">
              © {new Date().getFullYear()} Js Mentor Training Institute • Turning Ideas into Code
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
