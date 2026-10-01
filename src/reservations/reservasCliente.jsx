import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/reservations`;

const formatDate = (value) => {
  if (!value) return 'N/A';
  const [y, m, d] = String(value).slice(0, 10).split('-');
  return y && m && d ? `${d}-${m}-${y}` : 'N/A';
};

// Acepta snake_case y camelCase, y devuelve siempre snake_case
const normalizeReserva = (r) => ({
  id: r.id,
  guest_id: r.guest_id ?? r.guestId,
  guest_name: r.guest_name ?? r.guestName,
  unit_id: r.unit_id ?? r.unitId,
  check_in_date: r.check_in_date ?? r.checkInDate,
  check_out_date: r.check_out_date ?? r.checkOutDate,
  status: r.status,
});

function ReservasCliente() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithToken(API_URL)
      .then((data) => {
        const raw = Array.isArray(data)
          ? data
          : (data?.reservations ?? data?.data ?? data?.content ?? []);

        const list = raw
          .filter(Boolean)
          .map(normalizeReserva)
          .sort((a, b) => a.id - b.id);

        setReservas(list);
      })
      .catch((err) => {
        console.error('Error al obtener reservas:', err);
        setErrorMsg('No se pudieron cargar tus reservas.');
        setReservas([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getBadgeVariant = (status) => {
    if (status === 'CANCELADA') return 'danger';
    if (status === 'EN_ESTADIA' || status === 'CONFIRMADA') return 'success';
    return 'primary';
  };

  return (
    <div className="m-5">
      <h2>Mis Reservas</h2>

      {errorMsg && <Alert variant="danger" className="mt-3">{errorMsg}</Alert>}

      <Row className="mt-4">
        <Col sm={10}>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table bordered hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th># ID</th>
                      <th>Huésped</th>
                      <th>Unidad</th>
                      <th>Check-In</th>
                      <th>Check-Out</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.length > 0 ? (
                      reservas.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td>{item.guest_name ?? 'N/A'}</td>
                          <td>Unidad #{item.unit_id ?? 'N/A'}</td>
                          <td>{formatDate(item.check_in_date)}</td>
                          <td>{formatDate(item.check_out_date)}</td>
                          <td>
                            <Badge bg={getBadgeVariant(item.status)}>{item.status}</Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-3">
                          Aún no tienes reservas.
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
          <Button variant="primary" className="w-100" onClick={() => navigate('/formulario')}>
            Realizar Reserva
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default ReservasCliente;