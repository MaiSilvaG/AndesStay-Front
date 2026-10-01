import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import './audit.css';
import { useState, useEffect } from 'react';
import { useApi } from '../useApi';

// Devuelve YYYY-MM-DD en hora local (para comparar con <input type="date">)
const toLocalDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

const formatFecha = (iso) => {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return isNaN(d) ? 'N/A' : d.toLocaleString('es-CL');
};

const estadoBadge = (status) => {
  switch (status) {
    case 'CANCELADA':
      return 'bg-danger';
    case 'CHECKOUT':
      return 'bg-secondary';
    case 'EN_ESTADIA':
      return 'bg-success';
    default:
      return 'bg-primary';
  }
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
    const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/`;

    const AUDIT_API_URL = `${baseUrl}api/audit/events?limit=50`;

    fetchWithToken(AUDIT_API_URL)
      .then((data) => {
        const raw = Array.isArray(data)
          ? data
          : (data?.events ?? data?.data ?? data?.content ?? []);

        const list = raw
          .filter(Boolean)
          .map(normalizeEvent)
          .sort((a, b) => toTime(b.occurred_at) - toTime(a.occurred_at)); // más recientes primero

        setEvents(list);
      })
      .catch((err) => {
        console.error('Error al obtener auditoria:', err);
        setError('No se pudieron cargar los eventos de auditoria.');
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

    const matchTipoEstado = `${ev.type ?? ''} ${ev.status ?? ''}`
      .toLowerCase()
      .includes(filters.tipoEstado.toLowerCase());

    const matchFecha = !filters.fecha || toLocalDate(ev.occurred_at) === filters.fecha;

    return matchGuest && matchTipoEstado && matchFecha;
  });

  return (
    <div className="m-5">
      <h1 className="mb-4">Trazabilidad de la reserva</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <Row className="g-4">
        {/* Tabla de Resultados */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando eventos...</span>
                  </Spinner>
                </div>
              ) : (
                <Table bordered hover responsive className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Huésped</th>
                      <th>Fecha</th>
                      <th>Reserva / Unidad</th>
                      <th>Evento</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.length > 0 ? (
                      resultado.map((ev, index) => (
                        <tr key={ev.event_id ?? index}>
                          <td>{ev.guest_id || 'N/A'}</td>
                          <td>{formatFecha(ev.occurred_at)}</td>
                          <td>
                            #{ev.reservation_id ?? 'N/A'} / Unidad {ev.unit_id ?? 'N/A'}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                ev.type?.includes('created') ? 'bg-success' : 'bg-info text-dark'
                              }`}
                            >
                              {ev.type || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${estadoBadge(ev.status)}`}>
                              {ev.status || 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-3">
                          No se encontraron registros de auditoría.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Filtros */}
        <Col xs={6} md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Filtros</Card.Title>

              <label htmlFor="guest">Por ID de huesped o reserva</label>
              <input
                id="guest"
                name="guest"
                value={filters.guest}
                onChange={handleFilterChange}
                type="text"
                placeholder="Ej: u-201"
                className="form-control mb-2"
              />

              <label htmlFor="tipoEstado">Por Tipo de Estado</label>
              <input
                id="tipoEstado"
                name="tipoEstado"
                value={filters.tipoEstado}
                onChange={handleFilterChange}
                type="text"
                placeholder="Tipo Estado"
                className="form-control mb-2"
              />

              <label htmlFor="fecha">Por Fecha</label>
              <input
                id="fecha"
                name="fecha"
                value={filters.fecha}
                onChange={handleFilterChange}
                type="date"
                className="form-control"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}