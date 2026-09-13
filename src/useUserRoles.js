import { useMsal } from '@azure/msal-react';

export function useUserRoles() {
  const { instance } = useMsal();
  const activeAccount = instance.getActiveAccount();

  if (!activeAccount || !activeAccount.idTokenClaims) {
    return [];
  }


  return activeAccount.idTokenClaims.roles || [];
}