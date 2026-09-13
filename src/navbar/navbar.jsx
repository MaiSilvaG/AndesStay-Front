import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { useIsAuthenticated } from '@azure/msal-react';
import { useUserRoles } from '../useUserRoles';

function Navigation() {
  const isAuthenticated = useIsAuthenticated();
  const roles = useUserRoles();

  const isAdmin = roles.includes('Admin');
  const isRecepcion = roles.includes('Recepcionista');
  const isCliente = roles.includes('Cliente');
  const isAuditor = roles.includes('Auditor');

  return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
      <Navbar.Brand as={Link} to="/dashboard" className="ms-3">
        AndesStay
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {isAuthenticated && (
            <>
              {/* dashboard: todos los autenticados */}
              <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>

              {/*reservasCliente: Cliente */}
              {isCliente && !isRecepcion && !isAdmin && (
                <Nav.Link as={Link} to="/reservasCliente">Reservations</Nav.Link>
              )}

              {/*reservasEditar: Recepcionista o Admin */}
              {(isRecepcion || isAdmin) && (
                <Nav.Link as={Link} to="/reservasEditar">Reservations</Nav.Link>
              )}

              {/* Catálogo: Admin, Recepcionista */}
              {(isAdmin || isRecepcion) && (
                <Nav.Link as={Link} to="/catalog">Catalog</Nav.Link>
              )}

              {/* Reportes: Admin */}
              {isAdmin && (
                <Nav.Link as={Link} to="/reports">Reports</Nav.Link>
              )}

              {/* Auditoría: Admin, Auditor */}
              {(isAdmin || isAuditor) && (
                <Nav.Link as={Link} to="/audit">Audit</Nav.Link>
              )}
            </>
          )}
        </Nav>

        <Nav className="ms-auto me-4">
          <Nav.Link as={Link} to="/login">
            {isAuthenticated ? 'Mi Cuenta' : 'Login'}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;