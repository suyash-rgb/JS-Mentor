import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../Images/jsmentorlogof.png";
import "./Navbar.css";

const NavbarComponent = () => {
  const location = useLocation();
  const { pathname } = location; // Destructure for cleaner code
  const { isSignedIn } = useUser();

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
            alt="JS Mentor Logo"
          />
        </Navbar.Brand>

        <Navbar.Toggle
          aria-controls="navbarSupportedContent"
          className="border-0 custom-toggler"
        > 
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>

        <Navbar.Collapse id="navbarSupportedContent">
          <Nav className="ms-auto mb-2 mb-lg-0 nav-links-container">
            
            {/* Conditional Rendering based on current path */}
            {pathname !== "/" && (
              <Nav.Link as={Link} to="/" className="nav-link">Home</Nav.Link>
            )}

            {pathname !== "/learning-paths" && (
              <Nav.Link as={Link} to="/learning-paths" className="nav-link">Learning Paths</Nav.Link>
            )}

            {isSignedIn && pathname !== "/dashboard" && (
              <Nav.Link as={Link} to="/dashboard" className="nav-link">Dashboard</Nav.Link>
            )}

            {pathname !== "/jscompiler" && (
              <Nav.Link as={Link} to="/jscompiler" className="nav-link">JS Compiler</Nav.Link>
            )}

            {pathname !== "/Ai" && (
              <Nav.Link as={Link} to="/Ai" className="nav-link">AI</Nav.Link>
            )}

            {pathname !== "/testimonials" && (
              <Nav.Link as={Link} to="/testimonials" className="nav-link">Testimonials</Nav.Link>
            )}

            <div className="d-flex align-items-center">
              {isSignedIn ? (
                <UserButton signOutRedirectUrl="/" />
              ) : (
                <>
                  <Button
                    variant="outline-primary"
                    href="/sign-in"
                    className="ms-2 navbar-button"
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary" 
                    href="/sign-up"
                    className="ms-2 navbar-button"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;