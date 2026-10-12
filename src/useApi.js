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
      const response = await instance.acquireTokenSilent({
        ...apiRequest,
        account: account,
      });

      const token = response.accessToken;

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
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error ${res.status}: Falló la petición a la API.`
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