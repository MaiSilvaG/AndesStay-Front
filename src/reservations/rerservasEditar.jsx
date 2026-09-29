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

function ReservasEditar() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchReservas = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      
      const data = await fetchWithToken(API_URL);
      const safeData = Array.isArray(data) ? data : [];
      safeData.sort((a, b) => a.id - b.id);
      setReservas(safeData);
    } catch (err) {
      console.error('Error al cargar reservas:', err);
      setErrorMsg('No se pudo conectar con el microservicio de reservas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  const handleEstadoChange = async (id, nuevoEstado) => {
    try {
      await fetchWithToken(`${API_URL}/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: nuevoEstado }),
      });

      setReservas((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status: nuevoEstado } : res))
      );
    } catch (error) {
      alert('Error al actualizar el estado de la reserva.');
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'CONFIRMADA':
      case 'EN_ESTADIA':
        return 'success';
      case 'CREADA':
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
                  <p className="mt-2 text-muted">Cargando reservas desde AWS...</p>
                </div>
              ) : (
                <Table bordered hover responsive align="middle">
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
                    {reservas.map((item) => (
                      <tr key={item.id}>
                        <td><strong>#{item.id}</strong></td>
                        <td><code>{item.guestId || item.guest_id}</code></td>
                        <td>{item.guestName || item.guest_name}</td>
                        <td>Unidad #{item.unitId || item.unit_id}</td>
                        <td>{item.checkInDate || item.check_in_date}</td>
                        <td>{item.checkOutDate || item.check_out_date}</td>
                        <td>
                          <Badge bg={getBadgeVariant(item.status)}>{item.status}</Badge>
                        </td>
                        <td>
                          <Form.Select
                            size="sm"
                            value={item.status}
                            onChange={(e) => handleEstadoChange(item.id, e.target.value)}
                          >
                            <option value="CREADA">CREADA</option>
                            <option value="CONFIRMADA">CONFIRMADA</option>
                            <option value="CHECKIN_PENDIENTE">CHECKIN_PENDIENTE</option>
                            <option value="EN_ESTADIA">EN_ESTADIA</option>
                            <option value="CHECKOUT">CHECKOUT</option>
                            <option value="CANCELADA">CANCELADA</option>
                          </Form.Select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col sm={2}>
          <Button variant="primary" className="w-100 shadow-sm" onClick={() => navigate('/formulario')}>
            + Nueva Reserva
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default ReservasEditar;