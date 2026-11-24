import { useEffect, useMemo, useState } from "react";
import { API, useApi } from "../useApi";
import { comoLista } from "./dominio";

// Unidades del catálogo. Las reservas solo traen unitId: `porId` da el nombre.
export function useUnidades() {
  const { fetchWithToken } = useApi();
  const [todas, setTodas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const recargar = () =>
    fetchWithToken(`${API}/units`)
      .then((data) => {
        setTodas(comoLista(data).filter(Boolean));
        setError("");
      })
      .catch((err) => setError(err.message || "No se pudo cargar el catálogo."))
      .finally(() => setCargando(false));

  useEffect(() => {
    recargar();
  }, []);

  // DELETE desactiva (active=false): no se ofrecen, pero las reservas siguen mostrando su nombre
  const unidades = useMemo(() => todas.filter((u) => u.active !== false), [todas]);
  const porId = useMemo(() => new Map(todas.map((u) => [u.id, u])), [todas]);

  return { unidades, porId, cargando, error, recargar };
}
