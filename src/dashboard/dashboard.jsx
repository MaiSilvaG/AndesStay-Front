import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUnidades } from '../ui/useUnidades';
import { useReservas } from '../ui/useReservas';
import { Cargando, EstadoBadge, Medidor } from '../ui/componentes';
import { ESTADOS } from '../ui/dominio';
import { fechaCorta } from '../ui/fechas';

// Color de cada estado en "Reservas por estado" (difieren también en luminosidad)
const COLOR_ESTADO = {
  CREADA: '#cdbb9c',
  CONFIRMADA: 'var(--as-forest)',
  CHECKIN_PENDIENTE: '#d9a441',
  EN_ESTADIA: 'var(--as-ink)',
  CHECKOUT: '#4a6378',
  CANCELADA: 'var(--as-clay)',
};

export default function Dashboard() {
  const { porId } = useUnidades();
  const { reservas, cargando, error } = useReservas();

  const porEstado = useMemo(
    () => reservas.reduce((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {}),
    [reservas]
  );
  const total = reservas.length;
  const ultimas = reservas.slice(0, 5); // el hook ya las ordena de la más nueva a la más antigua
  const maxEstado = Math.max(1, ...Object.values(porEstado));
  const pct = (n) => (total ? `${Math.round((n / total) * 100)} % del total` : '—');

  const cifras = [
    { titulo: 'Total de reservas', valor: total, nota: 'Todas las del sistema', color: 'var(--as-ink)', ratio: total },
    { titulo: 'Estadías activas', valor: porEstado.EN_ESTADIA ?? 0, color: 'var(--as-forest)' },
    { titulo: 'Completadas', valor: porEstado.CHECKOUT ?? 0, color: '#4a6378' },
    { titulo: 'Canceladas', valor: porEstado.CANCELADA ?? 0, color: 'var(--as-clay)' },
  ];

  if (cargando) return <main className="as-page"><Cargando texto="Cargando resumen..." /></main>;

  return (
    <main className="as-page">
      <div>
        <h1 className="as-page-title">Resumen de reservas</h1>
        <p className="as-page-lead">Todas las reservas registradas en AndesStay.</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="as-grid-stats">
        {cifras.map((c) => (
          <div key={c.titulo} className="as-stat d-flex flex-column gap-2">
            <p className="m-0 as-muted">{c.titulo}</p>
            <p className="as-stat-value m-0">{c.valor}</p>
            <Medidor valor={c.ratio ?? c.valor} total={total} texto={<span className="fw-normal small as-muted">{c.nota ?? pct(c.valor)}</span>} color={c.color} />
          </div>
        ))}
      </div>

      <section aria-label="Reservas por estado" className="as-surface p-4 d-flex flex-column gap-3">
        <h2 className="as-section-title">Reservas por estado</h2>
        {total === 0 ? (
          <p className="m-0 as-muted">Todavía no hay reservas.</p>
        ) : (
          <ul className="list-unstyled m-0 d-flex flex-column gap-3">
            {Object.entries(ESTADOS).map(([k, label]) => (
              <li key={k} className="d-grid align-items-center gap-3" style={{ gridTemplateColumns: 'minmax(140px, 200px) minmax(0, 1fr) 56px' }}>
                <span className="fw-semibold">{label}</span>
                <span className="as-meter-track" style={{ height: 28, borderRadius: 8, background: 'var(--as-ground)' }} aria-hidden="true">
                  <span className="as-meter-fill" style={{ borderRadius: 8, width: `${((porEstado[k] ?? 0) / maxEstado) * 100}%`, background: COLOR_ESTADO[k] }} />
                </span>
                <span className="text-end fw-semibold">{porEstado[k] ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-label="Últimas reservas" className="as-table-wrap">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 pt-4 pb-3">
          <h2 className="as-section-title">Últimas 5 reservas</h2>
          <Link to="/reservasEditar" className="fw-semibold">Ver todas las reservas</Link>
        </div>
        <div className="table-responsive">
          <table className="table" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th scope="col">Reserva</th>
                <th scope="col">Huésped</th>
                <th scope="col">Unidad</th>
                <th scope="col">Check-in</th>
                <th scope="col">Check-out</th>
                <th scope="col" className="text-end">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimas.map((r) => (
                <tr key={r.id}>
                  <td className="fw-semibold">n° {r.id}</td>
                  <td>{r.guestName ?? '—'}</td>
                  <td>{porId.get(r.unitId)?.name ?? `Unidad n° ${r.unitId}`}</td>
                  <td>{fechaCorta(r.checkInDate)}</td>
                  <td>{fechaCorta(r.checkOutDate)}</td>
                  <td className="text-end"><EstadoBadge status={r.status} /></td>
                </tr>
              ))}
              {ultimas.length === 0 && <tr><td colSpan="6" className="as-empty">No hay reservas registradas.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
