import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { apiRequest } from "./authConfig";

export function useApi() {
  const { instance, accounts } = useMsal();

  // Pide el token de NUESTRA API. Si Azure exige interacción (p. ej. falta el
  // consentimiento del scope access_as_user), redirige al login para obtenerlo.
  const getToken = async (account) => {
    try {
      const response = await instance.acquireTokenSilent({ ...apiRequest, account });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        await instance.acquireTokenRedirect({ ...apiRequest, account });
      }
      throw error;
    }
  };

  const fetchWithToken = async (url, options = {}) => {
    const account = instance.getActiveAccount() || accounts[0];

    if (!account) {
      throw new Error("No hay una sesión activa de usuario.");
    }

    try {
      // 1. Solicitar token (silencioso, con fallback a redirect)
      const token = await getToken(account);

      const headers = {
        "Content-Type": "application/json",
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        // Spring devuelve los errores como ProblemDetail (campo "detail")
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail ||
            errorData.message ||
            `Error ${res.status}: Falló la petición a la API.`
        );
      }

      if (res.status === 204) {
        return null;
      }
      if (options.responseType === "blob") {
        return await res.blob();
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
