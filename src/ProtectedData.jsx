import { useState } from 'react';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useApi } from './useApi';

export function ProtectedData() {
  const { fetchWithToken } = useApi();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchWithToken('https://graph.microsoft.com/v1.0/me');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error al consultar la API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border rounded">
      <AuthenticatedTemplate>
        <button 
          className="btn btn-primary mb-3" 
          onClick={handleFetchData} 
          disabled={loading}
        >
          {loading ? 'Consultando...' : 'Obtener Datos del Usuario vía API'}
        </button>

        {data && (
          <pre className="bg-light p-3 border rounded text-start">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </AuthenticatedTemplate>

      {/* Se muestra solo si el usuario NO ha iniciado sesión */}
      <UnauthenticatedTemplate>
        <div className="alert alert-warning m-0" role="alert">
          Acceso denegado. Debes iniciar sesión para consultar este recurso.
        </div>
      </UnauthenticatedTemplate>
    </div>
  );
}