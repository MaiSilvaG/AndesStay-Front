import { useEffect, useState } from 'react';
import { API, useApi } from '../useApi';
import { Cargando } from '../ui/componentes';
import { diaISO, fechaHora, hoyISO, sumarDias } from '../ui/fechas';
import './notificaciones.css';

const POLL_MS = 30000;

// Tono del ícono según el tipo de aviso (tipos de ms-andesstay-notify)
const tono = (type = '') =>
  type.includes('cancel') ? 'malo' : type.includes('confirmed') || type.includes('checkout') ? 'bueno' : 'info';

const ICONO = {
  bueno: 'M20 6 9 17l-5-5',
  malo: 'M18 6 6 18M6 6l12 12',
  info: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
};

const tieneVoucher = (n) =>
  !!n.reservationId &&
  (n.type === 'notification.confirmed' || n.type?.includes('voucher') || n.type?.startsWith('housekeeping.prepare'));

const tituloDia = (iso) =>
  iso === hoyISO() ? 'Hoy'
  : iso === sumarDias(hoyISO(), -1) ? 'Ayer'
  : new Date(`${iso}T12:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

// Avisos del usuario (cliente o personal: el back filtra por audiencia)
export default function Notificaciones() {
  const { fetchWithToken } = useApi();
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = (silencioso) =>
    fetchWithToken(`${API}/notifications`)
      .then((data) => setAvisos(Array.isArray(data) ? data : data?.notifications ?? []))
      .catch((err) => !silencioso && setError(err.message || 'No se pudo conectar con el servicio de notificaciones.'))
      .finally(() => setCargando(false));

  useEffect(() => {
    cargar(false);
    const id = setInterval(() => cargar(true), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const marcarLeida = async (id) => {
    try {
      await fetchWithToken(`${API}/notifications/${id}/read`, { method: 'PATCH' });
      setAvisos((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setError(err.message || 'No se pudo marcar el aviso como leído.');
    }
  };

  const marcarTodas = async () => {
    try {
      await fetchWithToken(`${API}/notifications/read-all`, { method: 'PATCH' });
      setAvisos((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      setError(err.message || 'No se pudieron marcar los avisos como leídos.');
    }
  };

  const descargarVoucher = async (reservationId) => {
    try {
      const blob = await fetchWithToken(`${API}/vouchers/${reservationId}`, {
        headers: { Accept: 'application/pdf' },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), {
        href: url,
        download: `voucher-AS-${String(reservationId).padStart(6, '0')}.pdf`,
      });
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || 'No se pudo descargar el voucher. Intenta nuevamente.');
    }
  };

  const sinLeer = avisos.filter((n) => !n.read).length;
  const grupos = [...avisos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .reduce((acc, n) => {
      const dia = diaISO(n.createdAt);
      (acc[dia] ??= []).push(n);
      return acc;
    }, {});

  return (
    <main className="as-page" style={{ maxWidth: 820 }}>
      <div className="as-page-head">
        <div>
          <h1 className="as-page-title">Notificaciones</h1>
          {!cargando && <p className="as-page-lead">{sinLeer ? `${sinLeer} sin leer` : 'Estás al día.'}</p>}
        </div>
        {sinLeer > 0 && (
          <button type="button" className="btn btn-outline-secondary" onClick={marcarTodas}>Marcar todas como leídas</button>
        )}
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {cargando ? (
        <Cargando texto="Cargando notificaciones..." />
      ) : avisos.length === 0 ? (
        <div className="as-surface as-empty">No tienes notificaciones.</div>
      ) : (
        Object.entries(grupos).map(([dia, lista]) => (
          <section key={dia} className="d-flex flex-column gap-2">
            <h2 className="as-day-title">{tituloDia(dia)}</h2>
            <ul className="list-unstyled m-0 d-flex flex-column gap-2">
              {lista.map((n) => (
                <li key={n.id} className={`aviso ${n.read ? '' : 'sin-leer'}`}>
                  <span className={`aviso-icono ${tono(n.type)}`} aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={ICONO[tono(n.type)]} />
                    </svg>
                  </span>
                  <div className="flex-grow-1 min-w-0">
                    <p className="m-0 fw-semibold">
                      {n.title}
                      {!n.read && <span className="visually-hidden"> (sin leer)</span>}
                    </p>
                    {n.message && <p className="m-0 mt-1 as-muted">{n.message}</p>}
                    <p className="m-0 mt-1 small as-muted">
                      {fechaHora(n.createdAt)}{n.reservationId && ` · Reserva n° ${n.reservationId}`}
                    </p>
                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {tieneVoucher(n) && (
                        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => descargarVoucher(n.reservationId)}>
                          Descargar voucher
                        </button>
                      )}
                      {!n.read && (
                        <button type="button" className="btn btn-link btn-sm p-0" onClick={() => marcarLeida(n.id)}>
                          Marcar como leída
                        </button>
                      )}
                    </div>
                  </div>
                  {!n.read && <span className="aviso-punto" aria-hidden="true" />}
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
