import {
  Card,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow, 
  Title
} from '@tremor/react';

const data = [
  {
    timestamp: "23/09/2026 13:00",
    usuario: "John Doe",
    evento: "check-in",
    unidad: "Cabaña",
    detalle: "reserva confirmada"
  },
  {
    timestamp: "23/09/2026 13:15",
    usuario: "Maria Gomez",
    evento: "check-out",
    unidad: "Habitación",
    detalle: "reserva confirmada"
  },
  {
    timestamp: "23/09/2026 13:30",
    usuario: "Carlos Perez",
    evento: "check-in",
    unidad: "Habitación",
    detalle: "en espera"
  },
  {
    timestamp: "23/09/2026 14:05",
    usuario: "Admin System",
    evento: "check-in",
    unidad: "Cabaña",
    detalle: "cancelada"
  },
  {
    timestamp: "23/09/2026 14:20",
    usuario: "John Doe",
    evento: "check-out",
    unidad: "Habitación",
    detalle: "reserva confirmada"
  }
];

const getBadgeColor = (detalle) => {
  switch (detalle) {
    case 'Confirmada':
      return 'success';
    case 'en espera':
      return 'amber';
    case 'cancelada':
      return 'red';
    default:
      return 'slate';
  }
};

const TablaEvento = () => {
  return (
    <Card className='borde'>
      <div>
        <Title>Tabla de Eventos</Title>
      </div>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Usuario</TableHeaderCell>
            <TableHeaderCell>Evento</TableHeaderCell>
            <TableHeaderCell>Unidad</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
            <TableHeaderCell className="text-right">Timestamp</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={`${item.timestamp}-${item.usuario}-${index}`}>
              <TableCell>{item.usuario}</TableCell>
              <TableCell className="capitalize">{item.evento}</TableCell>
              <TableCell>{item.unidad}</TableCell>
              <TableCell>
                <Badge color={getBadgeColor(item.detalle)}>
                  {item.detalle}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{item.timestamp}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TablaEvento;