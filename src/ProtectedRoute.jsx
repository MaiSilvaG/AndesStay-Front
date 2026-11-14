import { useIsAuthenticated } from '@azure/msal-react';
import { Navigate } from 'react-router-dom';
import { rutaInicio, useUserRoles } from './useUserRoles';

export function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useIsAuthenticated();
  const userRoles = useUserRoles();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Sin el rol requerido, a su propia pantalla de inicio (el back también lo bloquea)
  if (allowedRoles?.length && !allowedRoles.some((rol) => userRoles.includes(rol))) {
    return <Navigate to={rutaInicio(userRoles)} replace />;
  }

  return children;
}
