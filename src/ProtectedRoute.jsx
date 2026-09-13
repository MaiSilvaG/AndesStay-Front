import { useIsAuthenticated } from '@azure/msal-react';
import { Navigate } from 'react-router-dom';
import { useUserRoles } from './useUserRoles';

export function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useIsAuthenticated();
  const userRoles = useUserRoles();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  return children;
}