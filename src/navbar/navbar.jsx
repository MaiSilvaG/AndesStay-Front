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

  const home = isAdmin ? '/dashboard'
  : isRecepcion ? '/dashboardRecepcionista'
  : isCliente ? '/catalogCliente'
  : '/audit';


  return (
    <Navbar expand="lg" className="bg-body-tertiary" data-bs-theme="dark">
      <Navbar.Brand as={Link} to={home} className="ms-3">
        AndesStay
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {isAuthenticated && (
            <>
              {/* dashboard: admin */}
              {isAdmin && (
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
              )}

              {/* dashboard: recepcionista */}
              {isRecepcion && (
                <Nav.Link as={Link} to="/dashboardRecepcionista">Dashboard</Nav.Link>
              )}

              {/*reservasCliente: Cliente */}
              {isCliente && !isRecepcion && !isAdmin && (
                <Nav.Link as={Link} to="/reservasCliente">Reservations</Nav.Link>
              )}

              {/*reservasEditar: Recepcionista o Admin */}
              {(isRecepcion || isAdmin) && (
                <Nav.Link as={Link} to="/reservasEditar">Reservations</Nav.Link>
              )}

              {/* Catalogo: Admin, Recepcionista */}
              {(isAdmin || isRecepcion) && (
                <Nav.Link as={Link} to="/catalog">Catalog</Nav.Link>
              )}

              {/* Catalogo:  Cliente */}
              {isCliente && !isAdmin && !isRecepcion && (
                <Nav.Link as={Link} to="/catalogCliente">Catalog</Nav.Link>
              )}

              {/* Auditoria: Admin, Auditor */}
              {(isAdmin || isAuditor) && (
                <Nav.Link as={Link} to="/audit">Audit</Nav.Link>
              )}
            </>
          )}
        </Nav>
        
        <Nav className="ms-auto me-4 d-flex align-items-center">
          {/*notificaciones cliente */}
          {isAuthenticated && isCliente && !isAdmin && !isRecepcion && (
            <Nav.Link as={Link} to="/notificacionCliente">
              <img
                src='/campana.png'
                alt='notificaciones'
                width='22'
                height='22'
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Nav.Link>
          )}

          {/*notificaciones admin y recepcionista */}
          {isAuthenticated && (isAdmin || isRecepcion) && (
            <Nav.Link as={Link} to="/notificacionPersonal">
              <img
                src='/campana.png'
                alt='notificaciones'
                width='22'
                height='22'
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </Nav.Link>
          )}
          <Nav.Link as={Link} to="/login">
            {isAuthenticated ? 'Mi Cuenta' : 'Login'}
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default Navigation;