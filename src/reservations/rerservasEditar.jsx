import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ReservasEditar() {
  const reservasIniciales = [
    { id: 1, usuario: 'Mark', fecha: '2026-09-10', tipoUnidad: 'habitacion', tipoEvento: 'a', estado: 'En espera' },
    { id: 2, usuario: 'Jacob', fecha: '2026-09-25', tipoUnidad: 'cabana', tipoEvento: 'd', estado: 'Confirmada' }
  ];

  const [reservas, setReservas] = useState(reservasIniciales);
  
  const navigate = useNavigate();
  
  const handleClickCrear = () => {
    navigate('/formulario');
  };

  const handleEstadoChange = (id, nuevoEstado) => {
    setReservas(prevReservas =>
      prevReservas.map(reserva =>
        reserva.id === id ? { ...reserva, estado: nuevoEstado } : reserva
      )
    );
  };

  const getBadgeVariant = (estado) => {
    switch (estado) {
      case 'Confirmada': return 'success';
      case 'En espera': return 'warning';
      case 'Pendiente': return 'secondary';
      case 'Cancelada': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className='m-5'>
      <h1>Lista reservas</h1>
      <Row>
        <Col sm={10}>
          <Card>
            <Card.Body>
              <Table bordered hover>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Usuario</th>
                    <th>Fecha</th>
                    <th>Unidad</th>
                    <th>Tipo Evento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.usuario}</td>
                      <td>{item.fecha}</td>
                      <td>{item.tipoUnidad}</td>
                      <td>{item.tipoEvento}</td>
                      <td>
                        <Badge bg={getBadgeVariant(item.estado)}>{item.estado}</Badge>
                      </td>
                      <td>
                        <Form.Select size="sm" value={item.estado} onChange={(e) => handleEstadoChange(item.id, e.target.value)}>
                          <option value="Pendiente">Pendiente</option>
                          <option value="Confirmada">Confirmada</option>
                          <option value="En espera">En espera</option>
                          <option value="Cancelada">Cancelada</option>
                        </Form.Select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col sm={2}>
          <Button variant="primary" onClick={handleClickCrear}>Realizar Reserva</Button>
        </Col>
      </Row>
    </div>
  );
}

export default ReservasEditar;