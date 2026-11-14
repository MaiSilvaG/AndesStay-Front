import { useEffect, useState } from 'react';
import { API, useApi } from '../useApi';
import { comoLista, normalizarReserva } from './dominio';

// Todas las reservas (vista del personal) y la acción para cambiarles el estado.
export function useReservas() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [ocupada, setOcupada] = useState(null);

  useEffect(() => {
    fetchWithToken(`${API}/reservations`)
      .then((data) => setReservas(comoLista(data).map(normalizarReserva).sort((a, b) => b.id - a.id)))
      .catch((err) => setError(err.message || 'No se pudieron cargar las reservas.'))
      .finally(() => setCargando(false));
  }, []);

  // PUT /status para avanzar; POST /cancel para cancelar
  const cambiar = async (r, destino) => {
    if (destino === 'CANCELADA' && !window.confirm(`¿Cancelar la reserva n° ${r.id}?`)) return;
    setOcupada(r.id);
    setError('');
    try {
      const actualizada =
        destino === 'CANCELADA'
          ? await fetchWithToken(`${API}/reservations/${r.id}/cancel`, { method: 'POST' })
          : await fetchWithToken(`${API}/reservations/${r.id}/status`, {
              method: 'PUT',
              body: JSON.stringify({ status: destino }),
            });
      // Si el back no devuelve la reserva, se limpian los campos derivados para recalcularlos
      const nueva = actualizada
        ? normalizarReserva(actualizada)
        : { ...r, status: destino, nextStatus: undefined, cancellable: undefined };
      setReservas((prev) => prev.map((x) => (x.id === r.id ? nueva : x)));
    } catch (err) {
      setError(err.message || `No se pudo actualizar la reserva n° ${r.id}.`);
    } finally {
      setOcupada(null);
    }
  };

  return { reservas, cargando, error, ocupada, cambiar };
}
