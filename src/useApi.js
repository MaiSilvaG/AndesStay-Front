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
      // 1. Solicitar token silenciosamente
      const response = await instance.acquireTokenSilent({
        ...apiRequest,
        account: account,
      });

      const token = response.accessToken;

      // 2. Mezclar encabezados con el token Bearer
      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      // 3. Realizar la petición
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        // Intentar obtener el mensaje de error que devuelva el backend
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${res.status}: Falló la petición a la API.`
        );
      }

      // 4. Si la respuesta es 204 No Content o no tiene cuerpo, retornar objeto/array vacío
      if (res.status === 204) {
        return null;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await res.json();
      }

      return await res.text();
    } catch (error) {
      console.error("Error en fetchWithToken (useApi):", error);
      throw error;
    }
  };

  return { fetchWithToken };
}