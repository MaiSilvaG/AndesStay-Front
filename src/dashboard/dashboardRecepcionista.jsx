import { useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { useUnidades } from '../ui/useUnidades';
import { useReservas } from '../ui/useReservas';
import { Cargando, EstadoBadge } from '../ui/componentes';
import { ACCION_HACIA, siguienteEstado } from '../ui/dominio';
import { fechaCorta, hoyISO } from '../ui/fechas';

// Pestañas del día. "Hoy" se calcula con la fecha local del navegador.
const PESTANAS = [
  { id: 'llegan', label: 'Llegan hoy', filtro: (r, hoy) => r.checkInDate === hoy && ['CONFIRMADA', 'CHECKIN_PENDIENTE'].includes(r.status) },
  { id: 'estadia', label: 'En estadía', filtro: (r) => r.status === 'EN_ESTADIA' },
  { id: 'salen', label: 'Salen hoy', filtro: (r, hoy) => r.checkOutDate === hoy && r.status === 'EN_ESTADIA' },
];

export default function RecepcionistaDashboard() {
  const { instance } = useMsal();
  const { porId } = useUnidades();
  const { reservas, cargando, error, ocupada, cambiar } = useReservas();
  const [pestana, setPestana] = useState('llegan');
  const hoy = hoyISO();

  const contar = (id) => reservas.filter((r) => PESTANAS.find((p) => p.id === id).filtro(r, hoy)).length;
  const filas = reservas.filter((r) => PESTANAS.find((p) => p.id === pestana).filtro(r, hoy));
  const nombre = instance.getActiveAccount()?.name?.split(' ')[0];
  const fechaLarga = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });

  if (cargando) return <main className="as-page"><Cargando texto="Cargando el día..." /></main>;

  return (
    <main className="as-page">
      <div>
        <h1 className="as-page-title">Hola{nombre ? `, ${nombre}` : ''}</h1>
        <p className="as-page-lead">Así están los huéspedes hoy, {fechaLarga}.</p>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <div className="as-grid-stats">
        <div className="as-stat" style={{ background: 'var(--as-forest)', color: 'var(--as-surface)' }}>
          <p className="m-0">En estadía</p>
          <p className="as-stat-value" style={{ color: 'inherit' }}>{contar('estadia')}</p>
        </div>
        <div className="as-stat">
          <p className="m-0 as-muted">Llegan hoy</p>
          <p className="as-stat-value">{contar('llegan')}</p>
        </div>
        <div className="as-stat">
          <p className="m-0 as-muted">Salen hoy</p>
          <p className="as-stat-value">{contar('salen')}</p>
        </div>
      </div>

      <section aria-label="Huéspedes" className="as-table-wrap">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-4 pt-4 pb-3">
          <h2 className="as-section-title">Huéspedes</h2>
          <div role="group" aria-label="Filtrar" className="as-segmentado">
            {PESTANAS.map((p) => (
              <button key={p.id} type="button" aria-pressed={pestana === p.id}
                className={`btn btn-sm ${pestana === p.id ? 'btn-dark' : 'btn-link text-decoration-none'}`}
                onClick={() => setPestana(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div className="table-responsive">
          <table className="table" style={filas.length ? { minWidth: 760 } : undefined}>
            <thead>
              <tr>
                <th scope="col">Huésped</th>
                <th scope="col">Unidad</th>
                <th scope="col">Check-in</th>
                <th scope="col">Check-out</th>
                <th scope="col">Estado</th>
                <th scope="col" className="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((r) => {
                const siguiente = siguienteEstado(r);
                return (
                  <tr key={r.id}>
                    <td><strong className="fw-semibold">{r.guestName ?? '—'}</strong><br /><span className="small as-muted">Reserva n° {r.id}</span></td>
                    <td>{porId.get(r.unitId)?.name ?? `Unidad n° ${r.unitId}`}</td>
                    <td>{fechaCorta(r.checkInDate)}</td>
                    <td>{fechaCorta(r.checkOutDate)}</td>
                    <td><EstadoBadge status={r.status} /></td>
                    <td className="text-end">
                      {siguiente && (
                        <button type="button" className="btn btn-primary btn-sm text-nowrap" disabled={ocupada === r.id} onClick={() => cambiar(r, siguiente)}>
                          {ACCION_HACIA[siguiente]}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filas.length === 0 && <tr><td colSpan="6" className="as-empty">No hay huéspedes en esta lista.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
