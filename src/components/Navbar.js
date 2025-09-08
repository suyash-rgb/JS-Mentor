import { Navbar, Nav, Form, FormControl, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../Images/apoliums-removebg-preview.png'; // Ensure the path is correct
import "./Navbar.css";


const NavbarComponent = () => {
    return (
        <Navbar bg="white" expand="lg" sticky="top" className="navbar-custom shadow-sm">
            <Container fluid>
                {/* Logo */}
                <Navbar.Brand href="#home" className="d-flex align-items-center">
                    <img
                        src={logo}
                        width="150px" // Adjusted size for better balance
                        className="logo"
                        alt="Logo"
                    />
                </Navbar.Brand>

                {/* Toggle Button for Mobile */}
                <Navbar.Toggle aria-controls="navbarSupportedContent" className="border-0">
                    <span className="navbar-toggler-icon"></span>
                </Navbar.Toggle>

                {/* Navbar Content */}
                <Navbar.Collapse id="navbarSupportedContent">
                    {/* Navigation Links */}
                    <Nav className="ms-auto mb-2 mb-lg-0" style={{ gap: '1.5rem' }}>
                         
                   
                        <Nav.Link href="/" className="nav-link text-dark fw-medium">
                            Fundamental
                        </Nav.Link>
                        <Nav.Link href="/jscompiler" className="nav-link text-dark fw-medium">
                            JS Compiler
                        </Nav.Link>
                         <Nav.Link href="/Ai" className="nav-link text-dark fw-medium">
                            AI
                        </Nav.Link>
                    </Nav>

                    {/* Search Bar */}
                    {/* <Form className="d-flex ms-lg-4" id="search">
                        <FormControl
                            type="search"
                            placeholder="Search"
                            className="me-2 rounded-pill border-0 bg-light"
                            aria-label="Search"
                            id="searchInput"
                            style={{ minWidth: '200px' }} 
                        />
                        <Button
                            variant="danger"
                            className="rounded-pill px-4 fw-medium"
                            type="submit"
                            style={{ whiteSpace: 'nowrap' }} 
                        >
                            Search
                        </Button>
                    </Form> */}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavbarComponent;