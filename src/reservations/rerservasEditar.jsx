import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUnidades } from '../ui/useUnidades';
import { useReservas } from '../ui/useReservas';
import { Cargando, EstadoBadge } from '../ui/componentes';
import { ACCION_HACIA, ESTADOS, esCancelable, siguienteEstado } from '../ui/dominio';
import { fechaCorta } from '../ui/fechas';

export default function ReservasEditar() {
  const { porId } = useUnidades();
  const { reservas, cargando, error, ocupada, cambiar } = useReservas();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState('');

  const nombreUnidad = (r) => porId.get(r.unitId)?.name ?? `Unidad n° ${r.unitId}`;

  const t = texto.trim().toLowerCase();
  const visibles = reservas.filter(
    (r) =>
      (!estado || r.status === estado) &&
      (!t || `${r.guestName} ${nombreUnidad(r)} ${r.id}`.toLowerCase().includes(t))
  );

  return (
    <main className="as-page">
      <div className="as-page-head">
        <div>
          <h1 className="as-page-title">Reservas</h1>
          <p className="as-page-lead">Avanza o cancela una reserva desde su fila.</p>
        </div>
        <Link to="/formulario" className="btn btn-primary">Nueva reserva</Link>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <label htmlFor="r-buscar" className="visually-hidden">Buscar huésped, unidad o número</label>
        <input id="r-buscar" type="search" className="form-control" style={{ flex: '2 1 260px' }}
          placeholder="Buscar huésped, unidad o número" value={texto} onChange={(e) => setTexto(e.target.value)} />
        <label htmlFor="r-estado" className="visually-hidden">Estado</label>
        <select id="r-estado" className="form-select" style={{ flex: '1 1 180px' }} value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {cargando ? (
        <Cargando texto="Cargando reservas..." />
      ) : (
        <section aria-label="Listado de reservas" className="as-table-wrap">
          <div className="table-responsive">
            <table className="table table-hover" style={{ minWidth: 880 }}>
              <thead>
                <tr>
                  <th scope="col">Huésped</th>
                  <th scope="col">Unidad</th>
                  <th scope="col">Fechas</th>
                  <th scope="col">Estado</th>
                  <th scope="col">Cambiar a</th>
                  <th scope="col" className="text-end"><span className="visually-hidden">Cancelar</span></th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((r) => {
                  const siguiente = siguienteEstado(r);
                  const bloqueada = ocupada === r.id;
                  return (
                    <tr key={r.id}>
                      <td>
                        <strong className="fw-semibold">{r.guestName ?? '—'}</strong><br />
                        <span className="small as-muted">Reserva n° {r.id}</span>
                      </td>
                      <td>{nombreUnidad(r)}</td>
                      <td className="text-nowrap">{fechaCorta(r.checkInDate)} – {fechaCorta(r.checkOutDate)}</td>
                      <td><EstadoBadge status={r.status} /></td>
                      <td>
                        {siguiente ? (
                          <button type="button" className="btn btn-dark btn-sm text-nowrap" disabled={bloqueada} onClick={() => cambiar(r, siguiente)}>
                            {ACCION_HACIA[siguiente] ?? ESTADOS[siguiente]}
                          </button>
                        ) : (
                          <span className="small as-muted">Sin cambios posibles</span>
                        )}
                      </td>
                      <td className="text-end">
                        {esCancelable(r) && (
                          <button type="button" className="btn btn-outline-danger btn-sm" disabled={bloqueada} onClick={() => cambiar(r, 'CANCELADA')}>
                            Cancelar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {visibles.length === 0 && (
                  <tr><td colSpan="6" className="as-empty">No hay reservas que coincidan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="m-0 px-4 py-3 small as-muted border-top">
            {visibles.length} de {reservas.length} reservas
          </p>
        </section>
      )}
    </main>
  );
}
