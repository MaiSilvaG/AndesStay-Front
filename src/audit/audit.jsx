import Table from 'react-bootstrap/Table';
function Audit() {
  return (
    <div className='container mt-4'>
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
    </div>
    
  );
}

export default Audit;