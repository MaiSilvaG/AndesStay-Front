import { useEffect, useState } from 'react';
import { API, useApi } from '../useApi';
import { Cargando, EstadoBadge } from '../ui/componentes';
import { ESTADOS } from '../ui/dominio';
import { diaISO, hoyISO } from '../ui/fechas';
import Button from 'react-bootstrap/Button';

const formatFecha = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return isNaN(d) ? 'N/A' : d.toLocaleString('es-CL');
};

const normalizeEvent = (e) => ({
  event_id: e.event_id ?? e.eventId,
  type: e.type,
  reservation_id: e.reservation_id ?? e.reservationId,
  unit_id: e.unit_id ?? e.unitId,
  guest_id: e.guest_id ?? e.guestId,
  status: e.status,
  occurred_at: e.occurred_at ?? e.occurredAt,
});

const toTime = (iso) => {
  const t = new Date(iso).getTime();
  return isNaN(t) ? 0 : t;
};

export default function Audit() {
  const { fetchWithToken } = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    guest: '',
    fecha: '',
    tipoEstado: '',
  });

  // Consumo del backend
  useEffect(() => {
    fetchWithToken(`${API}/audit/events?limit=50`)
      .then((data) => {
        const raw = Array.isArray(data)
          ? data
          : (data?.events ?? data?.data ?? data?.content ?? []);

        const list = raw
          .filter(Boolean)
          .map(normalizeEvent)
          .sort((a, b) => toTime(b.occurred_at) - toTime(a.occurred_at));

        setEvents(list);
      })
      .catch((err) => {
        console.error('Error al obtener auditoria:', err);
        setError(err.message || 'No se pudieron cargar los eventos de auditoría.');
        setEvents([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Manejo de filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resultado = events.filter((ev) => {
    const matchGuest = `${ev.guest_id ?? ''} ${ev.reservation_id ?? ''}`
      .toLowerCase()
      .includes(filters.guest.toLowerCase());

    const matchTipoEstado = !filters.tipoEstado || ev.status === filters.tipoEstado;

    const matchFecha = !filters.fecha || diaISO(ev.occurred_at) === filters.fecha;

    return matchGuest && matchTipoEstado && matchFecha;
  });

  //funcion para exportar csv
  const exportCSV = () => {
    if(resultado.length === 0) return;

    const headers = ['ID Evento', 'Huesped', 'Fecha', 'ID Reserva', 'ID Unidad', 'Tipo Evento', 'Estado'];

    const rows = resultado.map((ev) => [
      `"${ev.event_id ?? ''}"`,
      `"${ev.guest_id ?? 'N/A'}"`,
      `"${formatFecha(ev.occurred_at)}"`,
      `"${ev.reservation_id ?? 'N/A'}"`,
      `"${ev.unit_id ?? 'N/A'}"`,
      `"${ev.type ?? 'N/A'}"`,
      `"${ev.status ?? 'N/A'}"`,
    ]);

     //uFEFF permite caracteres especiales y tilde en excel
    const csvContenido = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContenido], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const fechaActual = hoyISO();
    link.href = url;
    link.setAttribute('download', `auditoria_${fechaActual}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const porDia = resultado.reduce((acc, ev) => {
    (acc[diaISO(ev.occurred_at)] ??= []).push(ev);
    return acc;
  }, {});
  const tituloDia = (iso) =>
    iso ? new Date(`${iso}T12:00`).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' }) : 'Sin fecha';

  return (
    <main className="as-page">
      <div className="as-page-head">
        <div>
          <h1 className="as-page-title">Trazabilidad de Reservas</h1>
        </div>
        <Button type="button" variant="outline-success" onClick={exportCSV} disabled={resultado.length === 0 || loading}>
          Exportar CSV
        </Button>
      </div>

      <form className="as-surface d-flex flex-wrap gap-3 align-items-end p-3" onSubmit={(e) => e.preventDefault()}>
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="fecha" className="form-label">Fecha</label>
          <input id="fecha" name="fecha" type="date" className="form-control" value={filters.fecha} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="guest" className="form-label">ID de huésped o reserva</label>
          <input id="guest" name="guest" type="text" className="form-control" value={filters.guest} onChange={handleFilterChange} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label htmlFor="tipoEstado" className="form-label">Estado</label>
          <select id="tipoEstado" name="tipoEstado" className="form-select" value={filters.tipoEstado} onChange={handleFilterChange}>
            <option value="">Todos</option>
            {Object.entries(ESTADOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={() => setFilters({ guest: '', fecha: '', tipoEstado: '' })}>
          Limpiar filtros
        </button>
      </form>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      {loading ? (
        <Cargando texto="Cargando eventos..." />
      ) : resultado.length === 0 ? (
        <div className="as-surface as-empty">No hay eventos con esos filtros. Solo se muestran los últimos 50.</div>
      ) : (
        <section aria-label="Eventos" className="as-surface px-4 pb-3">
          {Object.entries(porDia).map(([dia, lista]) => (
            <div key={dia} className="pt-3">
              <h2 className="as-day-title text-capitalize mb-2">{tituloDia(dia)}</h2>
              <ol className="list-unstyled m-0">
                {lista.map((ev, index) => (
                  <li key={ev.event_id ?? index} className="d-flex flex-wrap align-items-center gap-3 py-2 border-top">
                    <span className="small as-muted" style={{ flex: '0 0 48px', fontVariantNumeric: 'tabular-nums' }}>
                      {new Date(ev.occurred_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span style={{ flex: '1 1 260px' }}>
                      Reserva n° {ev.reservation_id ?? '—'} · Unidad n° {ev.unit_id ?? '—'}
                      <span className="small as-muted d-block">{ev.type}</span>
                    </span>
                    <span className="small as-muted text-break" style={{ flex: '0 1 280px' }}>Huésped {ev.guest_id || '—'}</span>
                    <EstadoBadge status={ev.status} />
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
