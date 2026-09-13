import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ReservasEditar() {
  //datos de la tabla
  const reservasIniciales = [
    { id: 1, usuario: 'Mark', fecha: '2026-09-10', tipoUnidad: 'habitacion', tipoEvento: 'a' },
    { id: 2, usuario: 'Jacob', fecha: '2026-09-25', tipoUnidad: 'cabana', tipoEvento: 'd' }
  ];

  const [reservas] = useState(reservasIniciales);
  
  //formulario
  const navigate = useNavigate();
  const handleClickCrear = () => {
    navigate('/formulario');
  };

  return (
    <div className='m-5'>
      <h1>Lista reservas</h1>
      <Row >
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
                      <th></th>
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
                        <Button variant="primary" onClick={() => handleEdit(item)}>
                          Editar
                        </Button>
                      </td>
                    </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          
          <Col sm={2}>
            <Button variant="primary"  onClick={handleClickCrear}>Realizar Reserva</Button>
          </Col>
      </Row>
    </div>
  );
}

export default ReservasEditar;