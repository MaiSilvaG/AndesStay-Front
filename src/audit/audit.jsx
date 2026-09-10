import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

function Audit() {
  return (
    <div className='m-5'>
      <Row>
          <Col sm={8}>
            <Card>
              <Card.Body>
                <Table bordered hover>
                  <thead>
                    <tr>
                      <th>Usuarios</th>
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
                    <tr>
                      <td>3</td>
                      <td>@twitter</td>
                      <td>@qsq</td>
                      <td>@qsq</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={6} md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Filtros</Card.Title>
                <Card.Text>
                  tengo que poner filtros por
                  * Usuarios
                  * Fecha
                  * tipo de evento
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
      </Row>
    </div>
  );
}

export default Audit;
