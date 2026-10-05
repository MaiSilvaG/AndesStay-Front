import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/reservations`;

const ESTADOS = [
  'CREADA',
  'CONFIRMADA',
  'CHECKIN_PENDIENTE',
  'EN_ESTADIA',
  'CHECKOUT',
  'CANCELADA',
];

const formatDate = (value) => {
  if (!value) return 'N/A';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return y && m && d ? `${d}-${m}-${y}` : 'N/A';
};

const normalizeReserva = (r) => ({
  id: r.id,
  guest_id: r.guest_id ?? r.guestId,
  guest_name: r.guest_name ?? r.guestName,
  unit_id: r.unit_id ?? r.unitId,
  check_in_date: r.check_in_date ?? r.checkInDate,
  check_out_date: r.check_out_date ?? r.checkOutDate,
  status: r.status,
});

function ReservasEditar() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const navigate = useNavigate();

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      const data = await fetchWithToken(API_URL);
      const raw = Array.isArray(data)
        ? data
        : (data?.reservations ?? data?.data ?? data?.content ?? []);

      const list = raw
        .filter(Boolean)
        .map(normalizeReserva)
        .sort((a, b) => a.id - b.id);

      setReservas(list);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setErrorMsg('No se pudo conectar con el microservicio de reservas.');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      setUpdatingId(id);
      setErrorMsg('');

      await fetchWithToken(`${API_URL}/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nuevoEstado }),
      });

      setReservas((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status: nuevoEstado } : res))
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setErrorMsg(`No se pudo actualizar el estado de la reserva #${id}.`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'CONFIRMADA':
        return 'success';
      case 'EN_ESTADIA':
        return 'primary';
      case 'CREADA':
        return 'secondary';
      case 'CHECKIN_PENDIENTE':
        return 'warning';
      case 'CANCELADA':
        return 'danger';
      case 'CHECKOUT':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="m-5">
      <h2>Administración de Reservas</h2>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="mt-4">
        <Col sm={10}>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Cargando reservas...</p>
                </div>
              ) : (
                <Table bordered hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>ID Huésped</th>
                      <th>Nombre</th>
                      <th>Unidad</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Estado</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.length > 0 ? (
                      reservas.map((item) => (
                        <tr key={item.id}>
                          <td><strong>#{item.id}</strong></td>
                          <td><code>{item.guest_id ?? 'N/A'}</code></td>
                          <td>{item.guest_name ?? 'N/A'}</td>
                          <td>Unidad #{item.unit_id ?? 'N/A'}</td>
                          <td>{formatDate(item.check_in_date)}</td>
                          <td>{formatDate(item.check_out_date)}</td>
                          <td>
                            <Badge bg={getBadgeVariant(item.status)}>{item.status}</Badge>
                          </td>
                          <td>
                            <Form.Select
                              size="sm"
                              value={item.status}
                              disabled={updatingId === item.id}
                              onChange={(e) => handleEstadoChange(item.id, e.target.value)}
                            >
                              {ESTADOS.map((estado) => (
                                <option key={estado} value={estado}>
                                  {estado}
                                </option>
                              ))}
                            </Form.Select>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-3">
                          No hay reservas registradas.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col sm={2}>
          <Button
            variant="primary"
            className="w-100 shadow-sm"
            onClick={() => navigate('/formulario')}
          >
            + Nueva Reserva
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default ReservasEditar;