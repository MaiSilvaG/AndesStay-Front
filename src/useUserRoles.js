import { useMsal } from '@azure/msal-react';

export function useUserRoles() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  if (!activeAccount || !activeAccount.idTokenClaims) {
    return [];
  }

  return activeAccount.idTokenClaims.roles || [];
}

// Pantalla de inicio según el rol de mayor privilegio
export const rutaInicio = (roles) =>
  roles.includes('Admin') ? '/dashboard'
  : roles.includes('Recepcionista') ? '/dashboardRecepcionista'
  : roles.includes('Cliente') ? '/catalogCliente'
  : roles.includes('Auditor') ? '/audit'
  : '/login';
