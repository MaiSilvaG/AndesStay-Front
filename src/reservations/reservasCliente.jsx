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

const normalizeReserva = (r) => ({
  id: r.id,
  guest_id: r.guest_id ?? r.guestId,
  guest_name: r.guest_name ?? r.guestName,
  unit_id: r.unit_id ?? r.unitId,
  check_in_date: r.check_in_date ?? r.checkInDate,
  check_out_date: r.check_out_date ?? r.checkOutDate,
  status: r.status,
});

function ReservasCliente({ guestIdAuth }) {
  const navigate = useNavigate();
  const { fetchWithToken } = useApi();
  const currentGuestId = guestIdAuth || localStorage.getItem('guest_id');

  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [cancelar, setCancelar] = useState(null);

  const fetchReservasCliente = async () => {
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
        .filter((r) => String(r.guest_id) === String(currentGuestId))
        .sort((a, b) => b.id - a.id);

      setReservas(list);
    } catch (err) {
      console.error('Error al cargar las reservas:', err);
      setErrorMsg('No se pudieron obtener sus reservas. Intente mas tarde.');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentGuestId) {
      fetchReservasCliente();
    } else {
      setLoading(false);
      setErrorMsg('No se identifico la sesion .');
    }
  }, [currentGuestId]);

  const cancelarReserva = async(id) => {
    const confirmacion = window.confirm(`¿Esta seguro que desea cancelar la reserva #${id}?`);
    if(!confirmacion) return;

    try{
      setCancelar(id);
      setErrorMsg('');

      await fetchWithToken(`${API_URL}/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({status: 'CANCELADA'}),
      });

      //actualiza el estado local no recarla toda lista
      setReservas((prev) =>
        prev.map((res) => (res.id === id ? { ...res, status:'CANCELADA'}:res))
      );
    } catch(err){
      setErrorMsg('No se pudo cancelar la reserva');
    }
    finally{
      setCancelar(null);
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'CONFIRMADA': return 'success';
      case 'EN_ESTADIA': return 'primary';
      case 'CREADA': return 'secondary';
      case 'CHECKIN_PENDIENTE': return 'warning';
      case 'CANCELADA': return 'danger';
      case 'CHECKOUT': return 'info';
      default: return 'secondary';
    }
  };

  const reservasActivas = reservas.filter((r) =>
    ['CREADA', 'CONFIRMADA', 'CHECKIN_PENDIENTE', 'EN_ESTADIA'].includes(r.status)
  ).length;

  const puedeCancelar = (status) => 
    ['CREADA', 'CONFIRMADA', 'CHECKIN_PENDIENTE'].includes(status);

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Mis Reservas</h2>
        </div>
        <Button variant="primary" className="shadow-sm" onClick={() => navigate('/formulario')}>
          + Nueva Reserva
        </Button>
      </div>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      {/* Tarjetas de Resumen */}
      <Row className="mb-4">
        <Col md={3} className="mb-3 mb-md-0">
          <Card className="shadow-sm border-0 bg-primary text-white">
            <Card.Body>
              <h5>Reservas Activas</h5>
              <h2 className="display-6 fw-bold mb-0">{reservasActivas}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <h5>Total de Reservas</h5>
              <h2 className="display-6 fw-bold mb-0">{reservas.length}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de Reservas */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando tus reservas...</p>
            </div>
          ) : reservas.length > 0 ? (
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>N° Reserva</th>
                  <th>Unidad</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Estado</th>
                  <th className="text-center">Accion</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((item) => {
                  const cancelable = puedeCancelar(item.status);
                  const EsCacelar = cancelar === item.id;

                  return (
                    <tr key={item.id}>
                      <td><strong>#{item.id}</strong></td>
                      <td>Unidad #{item.unit_id ?? 'N/A'}</td>
                      <td>{formatDate(item.check_in_date)}</td>
                      <td>{formatDate(item.check_out_date)}</td>
                      <td>
                        <Badge bg={getBadgeVariant(item.status)} className="p-2">
                          {item.status}
                        </Badge>
                      </td>
                      <td className='text-center'>
                        {cancelable ? (
                          <Button
                            variant='danger'
                            size='sm'
                            disabled={EsCacelar}
                            onClick={() => cancelarReserva(item.id)}
                          >
                            {EsCacelar ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-1"
                                />
                                Cancelando...
                              </>
                            ) : (
                              'Cancelar Reserva'
                            )}
                          </Button>
                        ) : (
                          <span className="text-muted small">N/A</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No tienes reservas registradas a tu nombre.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default ReservasCliente;