import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import './audit.css';
import { useState, useEffect } from 'react';
import { useApi } from '../useApi';

export default function Audit() {
  const { fetchWithToken } = useApi();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    usuario: '',
    fecha: '',
    tipoEvento: ''
  });

  // Consumo del backend
  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/`;

    // Endpoint según la documentación del microservicio
    const AUDIT_API_URL = `${baseUrl}api/audit/events?limit=50`;

    fetchWithToken(AUDIT_API_URL)
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener auditoría:", err);
        setError("Error al cargar la trazabilidad de eventos.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejo de filtros en frontend
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const resultado = events.filter((dato) => {
    const matchUsuario = (dato.usuario || dato.userId || '')
      .toLowerCase()
      .includes(filters.usuario.toLowerCase());

    const matchFecha = (dato.fecha || dato.createdAt || dato.timestamp || '')
      .toLowerCase()
      .includes(filters.fecha.toLowerCase());

    const matchTipoEvento = (dato.tipoEvento || dato.eventType || '')
      .toLowerCase()
      .includes(filters.tipoEvento.toLowerCase());

    return matchUsuario && matchFecha && matchTipoEvento;
  });

  return (
    <div className="m-5">
      <h1 className="mb-4">Trazabilidad de la reserva</h1>
      
      <Row className="g-4">
        {/* Tabla de Resultados */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              {loading && (
                <div className="text-center my-4">
                  <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Cargando eventos...</span>
                  </Spinner>
                </div>
              )}

              {error && <Alert variant="danger">{error}</Alert>}

              {!loading && !error && (
                <Table bordered hover responsive className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Usuario / ID</th>
                      <th>Fecha</th>
                      <th>Reserva ID / Unidad</th>
                      <th>Tipo Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.length > 0 ? (
                      resultado.map((item, index) => (
                        <tr key={item.eventId || item.id || index}>
                          <td>{item.usuario || item.userId || 'N/A'}</td>
                          <td>
                            {item.fecha || 
                             (item.timestamp ? new Date(item.timestamp).toLocaleString("es-CL") : 'N/A')}
                          </td>
                          <td>{item.reservationId || item.tipoUnidad || 'N/A'}</td>
                          <td>
                            <span className={`badge ${
                              (item.eventType || item.tipoEvento)?.includes('created') 
                                ? 'bg-success' 
                                : 'bg-info text-dark'
                            }`}>
                              {item.eventType || item.tipoEvento}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-muted py-3">
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

          <Col xs={6} md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Filtros</Card.Title>
                <Card.Text>
                  <label htmlFor="usuario">Por Nombre de Usuario</label>
                  <input name='usuario' value={filters.usuario} onChange={handleFilterChange} type='text' placeholder='Usuario' className='form-control mb-2'></input>
                  <label htmlFor="Fecha">Por Tipo de Evento</label>
                  <input name='tipoEvento' value={filters.tipoEvento} onChange={handleFilterChange} type='text' placeholder='Tipo Evento' className='form-control mb-2'></input>
                  <label htmlFor="Fecha">Por Fecha</label>
                  <input name='fecha' value={filters.fecha} onChange={handleFilterChange} type='date' placeholder='Fecha' className='form-control'></input>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
      </Row>
    </div>
  );
}

