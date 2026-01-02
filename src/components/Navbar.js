// 

import { Navbar, Nav, Container } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../Images/jsmentorlogo.png';
import "./Navbar.css";

const NavbarComponent = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="navbar-custom">
            <Container fluid>
                {/* Logo */}
                <Navbar.Brand href="/" className="d-flex align-items-center">
                    <img
                        src={logo}
                        width="180"
                        height="100"
                        className="logo"
                        alt="Company Logo"
                    />
                </Navbar.Brand>

                {/* Toggle Button for Mobile */}
                <Navbar.Toggle aria-controls="navbarSupportedContent" className="border-0 custom-toggler">
                    <span className="navbar-toggler-icon"></span>
                </Navbar.Toggle>

                {/* Navbar Content */}
                <Navbar.Collapse id="navbarSupportedContent">
                    {/* Navigation Links */}
                    <Nav className="ms-auto mb-2 mb-lg-0 nav-links-container">
                        {!isHome && (
                            <Nav.Link href="/" className="nav-link">
                                Home
                            </Nav.Link>
                        )}
                        <Nav.Link href="/#learning-paths" className="nav-link">
                            Learning Paths
                        </Nav.Link>
                        <Nav.Link href="/jscompiler" className="nav-link">
                            JS Compiler
                        </Nav.Link>
                        <Nav.Link href="/Ai" className="nav-link">
                            AI
                        </Nav.Link>
                        <Nav.Link href="/about" className="nav-link">
                            About
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;