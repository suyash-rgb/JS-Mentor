// import React from 'react';
// import { Container, Row, Col } from 'react-bootstrap';
// import './Footer.css'; 
// import logo from "../Images/apoliums-removebg-preview.png";
// import address from "../Images/address_icon.png";
// import email from "../Images/email.png";
// import phone from "../Images/phone.png";

// const Footer = () => {
//   return (
//     <footer className="footer-container">
//       <Container>
//         <Row>
//           <Col md={4} className="section1">
//             <img
//               width="200px"
//               src={logo}
//               alt="Apoliums Logo"
//             />
//             <div className="h6">
//               <h6>APOLIUMS INFOTECH INDIA PRIVATE LIMITED</h6>
//             </div>
//           </Col>
//           <Col md={4} className="section2">
//             <h4 className="address">Address</h4>
//             <h6>
//               <img
//                 width="20px"
//                 src={address}
//                 alt="Address Icon"
//               />
//               Orange business park, 110, Bhawarkua Main Rd, above MacDonald,
//               Sindhi Colony, Indore, Madhya Pradesh 452001
//             </h6>
//           </Col>
//           <Col md={4} className="section3">
//             <h4 className="contact">Contact Details</h4>
//             <h6>
//               <img width="20" src={email} alt="Email Icon" />
//               Email: pradeep.mp09@gmail.com
//             </h6>
//             <h6>
//               <img width="20" src={phone} alt="Phone Icon" />
//               Phone:
//             </h6>
//           </Col>
//         </Row>
//         <Row>
//           <Col className="text-center">
//             <h6 className="copyright">
//               © 2024 Apoliums • Built within India.
//             </h6>
//           </Col>
//         </Row>
//       </Container>
//     </footer>
//   );
// };

// export default Footer;


import { Container, Row, Col } from 'react-bootstrap';
import './Footer.css'; 
import logo from "../Images/apoliums-removebg-preview.png";
import address from "../Images/address_icon.png";
import email from "../Images/email.png";
import phone from "../Images/phone.png";
import {jscompiler} from "../pages/jscompiler";

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
              <p className="company-name">APOLIUMS INFOTECH INDIA PRIVATE LIMITED</p>
            </div>
          </Col>
          
          <Col lg={4} md={6} className="footer-contact mb-4 mb-md-0">
            <h5 className="footer-section-title">Contact Us</h5>
            <ul className="contact-list">
              <li className="contact-item">
                <img width="16" src={address} alt="Address" className="contact-icon" />
                <span>Orange business park, 110, Bhawarkua Main Rd, above MacDonald, Sindhi Colony, Indore, Madhya Pradesh 452001</span>
              </li>
              <li className="contact-item">
                <img width="16" src={email} alt="Email" className="contact-icon" />
                <span>Email: pradeep.mp09@gmail.com</span>
              </li>
              <li className="contact-item">
                <img width="16" src={phone} alt="Phone" className="contact-icon" />
                <span>Phone: 9424586286 </span>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={12} className="footer-links mt-4 mt-lg-0">
            <h5 className="footer-section-title">Quick Links</h5>
            <ul className="links-list">
              <li><a href="/">Fundamental</a></li>
              <li><a href="/jscompiler">JS Compiler</a></li>
              <li><a href="/Ai">AI</a></li>
            </ul>
          </Col>
        </Row>
        
        <Row>
          <Col className="footer-bottom">
            <div className="copyright-text">
              © {new Date().getFullYear()} Apoliums Infotech India Pvt. Ltd. • Built with pride in India.
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
