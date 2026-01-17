import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import { useUser, UserButton } from "@clerk/clerk-react"; // 👈 Clerk imports
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../Images/jsmentorlogof.png";
import "./Navbar.css";

const NavbarComponent = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { isSignedIn } = useUser(); // 👈 Clerk hook

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
        <Navbar.Toggle
          aria-controls="navbarSupportedContent"
          className="border-0 custom-toggler"
        > 
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
            <Nav.Link href="/dashboard" className="nav-link">
              Dashboard
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
            <Nav.Link href="/testimonials" className="nav-link">
              Testimonials
            </Nav.Link>

            <div className="d-flex align-items-center">
              {/* Auth Buttons */}
              {isSignedIn ? (
                <UserButton signOutRedirectUrl="/" /> // 👈 Shows profile + logout
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