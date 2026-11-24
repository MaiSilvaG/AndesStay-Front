import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { API, useApi } from '../useApi';
import { useUnidades } from '../ui/useUnidades';
import { Cargando, EstadoBadge } from '../ui/componentes';
import { comoLista, esActiva, esCancelable, fotoUnidad, normalizarReserva, tipoLabel } from '../ui/dominio';
import { fechaCorta, hoyISO, noches } from '../ui/fechas';
import './reservas.css';

export default function ReservasCliente() {
  const { fetchWithToken } = useApi();
  const { instance } = useMsal();
  const { porId } = useUnidades();
  const [reservas, setReservas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [cancelando, setCancelando] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      let data;
      try {
        data = await fetchWithToken(`${API}/reservations/mine`);
      } catch (err) {
        // shortcut: back sin /mine todavía; filtra la lista completa. Borrar cuando el back esté desplegado.
        if (err.status !== 404 && err.status !== 405) throw err;
        const cuenta = instance.getActiveAccount();
        const yo = cuenta?.idTokenClaims?.oid ?? cuenta?.localAccountId;
        data = comoLista(await fetchWithToken(`${API}/reservations`)).filter(
          (r) => String(r.guestId ?? r.guest_id) === String(yo)
        );
      }
      setReservas(comoLista(data).map(normalizarReserva).sort((a, b) => b.id - a.id));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar tus reservas.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cancelar = async (r) => {
    if (!window.confirm(`¿Cancelar la reserva n° ${r.id}?`)) return;
    setCancelando(r.id);
    setError('');
    try {
      const actualizada = await fetchWithToken(`${API}/reservations/${r.id}/cancel`, { method: 'POST' });
      setReservas((prev) =>
        prev.map((x) => (x.id === r.id ? normalizarReserva(actualizada ?? { ...x, status: 'CANCELADA', cancellable: false }) : x))
      );
    } catch (err) {
      setError(err.message || 'No se pudo cancelar la reserva.');
    } finally {
      setCancelando(null);
    }
  };

  const activas = reservas.filter(esActiva);
  const proxima = activas
    .filter((r) => r.checkInDate >= hoyISO() && r.status !== 'EN_ESTADIA')
    .sort((a, b) => a.checkInDate.localeCompare(b.checkInDate))[0];
  const unidadDe = (r) => porId.get(r.unitId);

  return (
    <main className="as-page">
      <div className="as-page-head">
        <div>
          <h1 className="as-page-title">Mis reservas</h1>
          {!cargando && (
            <p className="as-page-lead">
              Tienes {activas.length} {activas.length === 1 ? 'reserva activa' : 'reservas activas'} y {reservas.length} en total.
            </p>
          )}
        </div>
        <Link to="/formulario" className="btn btn-primary">Nueva reserva</Link>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {proxima && (
        <section aria-label="Tu próxima estadía" className="proxima">
          <img src={fotoUnidad(unidadDe(proxima)?.type)} alt="" />
          <div className="proxima-cuerpo">
            <p className="m-0 proxima-suave">Tu próxima estadía</p>
            <h2 className="m-0 proxima-titulo">
              {unidadDe(proxima)?.name ?? `Unidad n° ${proxima.unitId}`}
              {unidadDe(proxima)?.location && `, ${unidadDe(proxima).location}`}
            </h2>
            <div className="d-flex flex-wrap gap-4">
              <p className="m-0"><span className="proxima-suave">Llegada</span><br /><strong>{fechaCorta(proxima.checkInDate)}</strong></p>
              <p className="m-0"><span className="proxima-suave">Salida</span><br /><strong>{fechaCorta(proxima.checkOutDate)}</strong></p>
              <p className="m-0"><span className="proxima-suave">Faltan</span><br /><strong>{noches(hoyISO(), proxima.checkInDate)} días</strong></p>
            </div>
          </div>
        </section>
      )}

      <section aria-label="Todas tus reservas" className="d-flex flex-column gap-3">
        <h2 className="as-section-title">Todas tus reservas</h2>
        {cargando ? (
          <Cargando texto="Cargando tus reservas..." />
        ) : reservas.length === 0 ? (
          <div className="as-surface as-empty">
            Aún no tienes reservas. <Link to="/catalogCliente">Mira el catálogo</Link> para hacer la primera.
          </div>
        ) : (
          <ul className="list-unstyled m-0 d-flex flex-column gap-2">
            {reservas.map((r) => {
              const n = noches(r.checkInDate, r.checkOutDate);
              const u = unidadDe(r);
              return (
                <li key={r.id} className="reserva-fila as-surface">
                  <div className="reserva-unidad">
                    <h3 className="m-0 fs-5">{u?.name ?? `Unidad n° ${r.unitId}`}</h3>
                    <p className="m-0 small as-muted">Reserva n° {r.id}{u && ` · ${tipoLabel(u.type)}`}</p>
                  </div>
                  <p className="m-0 reserva-fechas">
                    {fechaCorta(r.checkInDate)} – {fechaCorta(r.checkOutDate)}{' '}
                    <span className="as-muted">· {n} {n === 1 ? 'noche' : 'noches'}</span>
                  </p>
                  <div className="reserva-estado"><EstadoBadge status={r.status} /></div>
                  <div className="reserva-accion">
                    {esCancelable(r) && (
                      <button type="button" className="btn btn-outline-danger btn-sm" disabled={cancelando === r.id} onClick={() => cancelar(r)}>
                        {cancelando === r.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
