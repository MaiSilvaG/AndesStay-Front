import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { Link } from 'react-router-dom';
import { loginRequest } from '../authConfig';
import { rutaInicio, useUserRoles } from '../useUserRoles';
import logo from '../assets/logo.png';
import fotoCabana from '../assets/cabaña.jpg';
import './login.css';

export default function Login() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const roles = useUserRoles();
  const ocupado = inProgress !== InteractionStatus.None;

  const usuario = instance.getActiveAccount() || accounts[0];
  const nombre = usuario?.name || usuario?.username || '';

  const iniciarSesion = () =>
    instance.loginRedirect(loginRequest).catch((e) => console.error('Error al iniciar sesión:', e));

  const cerrarSesion = () =>
    instance.logoutRedirect({ postLogoutRedirectUri: '/login' }).catch((e) => console.error(e));

  return (
    <div className="login-split">
      <img className="login-foto" src={fotoCabana} alt="" />

      <main className="login-panel">
        <img src={logo} alt="AndesStay" width="220" />

        {isAuthenticated ? (
          <>
            <div>
              <h1 className="as-page-title">Hola, {nombre.split(' ')[0]}</h1>
              <p className="as-page-lead">Tu sesión está activa como {usuario?.username}.</p>
            </div>
            <div className="as-surface p-4 d-flex flex-column gap-3">
              <Link to={rutaInicio(roles)} className="btn btn-primary">Ir al inicio</Link>
              <button type="button" className="btn btn-outline-danger" onClick={cerrarSesion}>
                Cerrar sesión
              </button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="as-page-title">Bienvenido de vuelta</h1>
              <p className="as-page-lead">
                Entra con tu cuenta de la organización para ver el catálogo y tus reservas.
              </p>
            </div>
            <div className="as-surface p-4 d-flex flex-column gap-3">
              <button type="button" className="btn btn-primary" onClick={iniciarSesion} disabled={ocupado}>
                {ocupado && <span className="spinner-border spinner-border-sm me-2 text-white" aria-hidden="true" />}
                {ocupado ? 'Conectando...' : 'Iniciar sesión con Microsoft'}
              </button>
              <p className="m-0 small as-muted text-center">Se abrirá una ventana para confirmar tu identidad.</p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
