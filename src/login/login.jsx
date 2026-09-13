import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { loginRequest } from '../authConfig';
import { ProtectedData } from '../ProtectedData';
import './login.css';

export default function Login() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();

  const currentUser = instance.getActiveAccount() || accounts[0];
  const userName = currentUser?.name || currentUser?.username || "";

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogin = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (e) {
      console.error("Error al iniciar sesión:", e);
    }
  };

  const handleLogout = () => {
    instance.logoutRedirect({ postLogoutRedirectUri: '/login' }).catch((e) => console.error(e));
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Mi Cuenta</h2>
        </div>

        {isAuthenticated ? (
          <div className="login-body">
            <div className="user-profile-box">
              <div className="user-avatar">
                {getInitials(userName)}
              </div>
              <div className="user-info">
                <span className="user-greeting">Bienvenido/a</span>
                <strong className="user-name">{userName}</strong>
              </div>
            </div>

            <button className="btn-logout" onClick={handleLogout}>
              Cerrar Sesión
            </button>

            {/* <hr className="my-4" />
            <ProtectedData /> */}
          </div>
        ) : (
          <div className="login-body">
            <p className="login-description">
              Inicia sesión para acceder a la plataforma.
            </p>
            
            <button
              className="btn-inicio"
              onClick={handleLogin}
              disabled={inProgress !== InteractionStatus.None}
            >
              {inProgress !== InteractionStatus.None ? (
                <span className="d-flex align-items-center justify-content-center">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Conectando...
                </span>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}