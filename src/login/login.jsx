import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../authConfig';
import { ProtectedData } from '../ProtectedData';

export default function Login() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const currentUser = accounts[0];

  const handleLogin = () => {
    if (inProgress === InteractionStatus.None) {
      instance.loginRedirect(loginRequest).catch((e) => console.error(e));
    }
  };

  const handleLogout = () => {
    if (inProgress === InteractionStatus.None) {
      instance.logoutRedirect({ postLogoutRedirectUri: '/' }).catch((e) => console.error(e));
    }
  };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: '500px' }}>
      <div className="card shadow-sm p-4">
        <h2 className="mb-4">Portal de Autenticación</h2>

        {isAuthenticated ? (
          <div>
            <div className="alert alert-success" role="alert">
              Bienvenido, <strong>{currentUser?.name || currentUser?.username}</strong>
            </div>
            
            <div className="d-grid gap-2 mb-3">
              <button className="btn btn-danger" onClick={handleLogout}>
                Cerrar Sesión
              </button>
            </div>

            <hr className="my-4" />
            
            <ProtectedData />
          </div>
        ) : (
          <div>
            <p className="text-muted mb-4">
              Debes iniciar sesión con tu cuenta institucional de Microsoft para continuar.
            </p>
            <button
              className="btn btn-primary btn-lg w-100"
              onClick={handleLogin}
              disabled={inProgress !== InteractionStatus.None}
            >
              {inProgress !== InteractionStatus.None ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Cargando...
                </span>
              ) : (
                'Iniciar Sesión con Microsoft'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}