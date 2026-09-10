import { useMsal } from '@azure/msal-react';
import { loginRequest } from './authConfig';

export function useApi() {
  const { instance, accounts } = useMsal();

  const fetchWithToken = async (url, options = {}) => {
    const account = instance.getActiveAccount() || accounts[0];
    if (!account) {
      throw new Error('No hay una cuenta activa');
    }

    try {
      // Solicitar token silenciosamente
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      // Mezclar las opciones/headers personalizados con el Bearer Token
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${response.accessToken}`,
      };

      return fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Si el token falló al renovarse silenciosamente, puedes manejar una re-autenticación si es necesario
      console.error('Error al obtener el token silenciosamente:', error);
      throw error;
    }
  };

  return { fetchWithToken };
}