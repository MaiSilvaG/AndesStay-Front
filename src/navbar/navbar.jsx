import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary " data-bs-theme="dark">
     
        <Navbar.Brand as={Link} to="/home" className="ms-3">AndesStay</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
                <Nav.Link as={Link} to="/home">Home</Nav.Link>
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/catalog">Catalog</Nav.Link>
                <Nav.Link as={Link} to="/reservations">Reservations</Nav.Link>
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
                <Nav.Link as={Link} to="/audit">Audit</Nav.Link>
            </Nav>

            <Nav className="ms-auto me-4">
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
            </Nav>
        </Navbar.Collapse>
    
    </Navbar>
  );
}

export default Navigation;