import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';

import { useNavigate } from 'react-router-dom';

function Reservations() {

  const navigate = useNavigate();
  const handleClick = () => {
    navigate('./formulario.jsx');
  };

  return (
    <div className='m-5'>
      <h1>Mis reservas</h1>
      <Row >
          <Col sm={8}>
            <Card>
              <Card.Body>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Unidad</th>
                      <th>Tipo Evento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
          
          <Col sm={2}>
            <Button variant="primary" size="lg" onClick={handleClick}> Crear Reserva</Button>
          </Col>
      </Row>
    </div>
  );
}

export default Reservations;