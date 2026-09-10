import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useState, useEffect, use } from 'react';

function Audit() {
    //datos de la tabla
  const reservasIniciales = [
    {usuario: 'Mark', fecha: '2026-09-10', tipoUnidad: 'habitacion', tipoEvento: 'a' },
    {usuario: 'Jacob', fecha: '2026-09-25', tipoUnidad: 'cabana', tipoEvento: 'd' }
  ];

  const [filters, setFilters] = useState({
    usuario: '',
    fecha: '',
    tipoEvento: ''
  });

  //metodo de filtrado
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  
  //metodo de filtrado
  const resultado = reservasIniciales.filter((dato) => {
      return (
        dato.usuario.toLowerCase().includes(filters.usuario.toLowerCase()) &&
        dato.fecha.toLowerCase().includes(filters.fecha.toLowerCase()) &&
        dato.tipoEvento.toLowerCase().includes(filters.tipoEvento.toLowerCase())
      );
  });

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
                    {resultado.map((item) => (
                      <tr key={item.id}>
                        <td>{item.usuario}</td>
                        <td>{item.fecha}</td>
                        <td>{item.tipoUnidad}</td>
                        <td>{item.tipoEvento}</td>
                    </tr>
                    ))}
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

export default Audit;
