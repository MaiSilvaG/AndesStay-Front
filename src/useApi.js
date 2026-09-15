import { useMsal } from "@azure/msal-react";
import { apiRequest } from "./authConfig";

export function useApi() {
  const { instance, accounts } = useMsal();

  const fetchWithToken = async (url, options = {}) => {
    const account = instance.getActiveAccount() || accounts[0];

    if (!account) {
      throw new Error("No hay una sesión activa de usuario.");
    }

    try {
      // Solicita el token de acceso para la API expuesta usando apiRequest
      const response = await instance.acquireTokenSilent({
        ...apiRequest,
        account: account,
      });

      const token = response.accessToken;

      // Adjunta la cabecera Authorization con el token Bearer
      const headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo obtener el catálogo`);
      }

      return await res.json();
    } catch (error) {
      console.error("Error en fetchWithToken (useApi):", error);
      throw error;
    }
  };

  return { fetchWithToken };
}