import { useEffect, useState } from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { rutaInicio, useUserRoles } from '../useUserRoles';
import { API, useApi } from '../useApi';
import logo from '../assets/logo.png';

function Campana() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

// Avisos sin leer para el punto de la campana. Si el endpoint aún no existe, no muestra nada.
function useNoLeidas(activo) {
  const { fetchWithToken } = useApi();
  const { pathname } = useLocation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!activo) return;
    fetchWithToken(`${API}/notifications/unread-count`)
      .then((data) => setCount(Number(data?.count) || 0))
      .catch(() => setCount(0));
  }, [activo, pathname]);

  return count;
}

function Navigation() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const roles = useUserRoles();

  const isAdmin = roles.includes('Admin');
  const isRecepcion = roles.includes('Recepcionista');
  const isAuditor = roles.includes('Auditor');
  const isPersonal = isAdmin || isRecepcion;
  const isCliente = roles.includes('Cliente') && !isPersonal;

  const rutaAvisos = isPersonal ? '/notificacionPersonal' : isCliente ? '/notificacionCliente' : null;
  const noLeidas = useNoLeidas(isAuthenticated && !!rutaAvisos);

  const nombre = instance.getActiveAccount()?.name ?? '';

  return (
    <Navbar expand="lg" className="as-nav">
      <div className="container-xl px-4 py-2 gap-3">
        <Navbar.Brand as={Link} to={rutaInicio(roles)} aria-label="AndesStay, inicio">
          <img src={logo} alt="" height="44" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="nav-principal" />
        <Navbar.Collapse id="nav-principal">
          {isAuthenticated && (
            <Nav className="me-auto gap-1" aria-label="Principal">
              {isAdmin && <Nav.Link as={NavLink} to="/dashboard">Dashboard</Nav.Link>}
              {isRecepcion && !isAdmin && (
                <Nav.Link as={NavLink} to="/dashboardRecepcionista">Dashboard</Nav.Link>
              )}
              {isCliente && <Nav.Link as={NavLink} to="/catalogCliente">Catálogo</Nav.Link>}
              {isCliente && <Nav.Link as={NavLink} to="/reservasCliente">Mis reservas</Nav.Link>}
              {isPersonal && <Nav.Link as={NavLink} to="/reservasEditar">Reservas</Nav.Link>}
              {isPersonal && <Nav.Link as={NavLink} to="/catalog">Catálogo</Nav.Link>}
              {(isAdmin || isAuditor) && <Nav.Link as={NavLink} to="/audit">Auditoría</Nav.Link>}
              {isAdmin && <Nav.Link as={NavLink} to="/rabbitAdmin">Mensajería</Nav.Link>}
            </Nav>
          )}

          <div className="d-flex align-items-center gap-3 ms-auto">
            {isAuthenticated && rutaAvisos && (
              <Link
                to={rutaAvisos}
                className="as-icon-btn"
                aria-label={noLeidas ? `Notificaciones, ${noLeidas} sin leer` : 'Notificaciones'}
              >
                <Campana />
                {noLeidas > 0 && <span className="as-dot" />}
              </Link>
            )}
            {isAuthenticated ? (
              <Link to="/login" className="d-flex align-items-center gap-2 text-decoration-none" aria-label="Mi cuenta">
                <span className="as-avatar" aria-hidden="true">{(nombre[0] || 'U').toUpperCase()}</span>
                <span className="fw-medium">{nombre}</span>
              </Link>
            ) : (
              <Nav.Link as={NavLink} to="/login">Iniciar sesión</Nav.Link>
            )}
          </div>
        </Navbar.Collapse>
      </div>
    </Navbar>
  );
}

export default Navigation;
