import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../useApi';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/reservations`;

function ReservasCliente() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithToken(API_URL)
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        safeData.sort((a, b) => a.id - b.id);
        setReservas(safeData);
      })
      .catch((err) => {
        console.error('Error al obtener reservas:', err);
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
      <Row className="mt-4">
        <Col sm={10}>
          <Card>
            <Card.Body>
              {loading ? (
                <div className="text-center my-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <Table bordered hover responsive align="middle">
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
                    {reservas.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{item.guestName || item.guest_name}</td>
                        <td>Unidad #{item.unitId || item.unit_id}</td>
                        <td>{item.checkInDate || item.check_in_date}</td>
                        <td>{item.checkOutDate || item.check_out_date}</td>
                        <td>
                          <Badge bg={getBadgeVariant(item.status)}>{item.status}</Badge>
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
          <Button variant="primary" className="w-100" onClick={() => navigate('/formulario')}>
            Realizar Reserva
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default ReservasCliente;