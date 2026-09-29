import React from 'react';
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

const getBadgeColor = (status) => {
  switch (status) {
    case 'CONFIRMADA':
    case 'EN_ESTADIA':
      return 'emerald';
    case 'CREADA':
    case 'CHECKIN_PENDIENTE':
      return 'amber';
    case 'CANCELADA':
      return 'rose';
    default:
      return 'slate';
  }
};

const TablaEvento = ({ summary }) => {
  const reservas = summary?.reservas || summary?.projections || [];

  return (
    <Card className='borde'>
      <Title>Últimas Actualizaciones de Reservas</Title>
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeaderCell>ID Reserva</TableHeaderCell>
            <TableHeaderCell>Unidad ID</TableHeaderCell>
            <TableHeaderCell>Estado Actual</TableHeaderCell>
            <TableHeaderCell className="text-right">Última Actualización</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservas.length > 0 ? (
            reservas.map((item) => (
              <TableRow key={item.reservationId || item.id}>
                <TableCell>#{item.reservationId || item.id}</TableCell>
                <TableCell>Unidad {item.unitId}</TableCell>
                <TableCell>
                  <Badge color={getBadgeColor(item.status)}>
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{item.lastEventAt || item.checkInDate}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                No hay registros de reservas proyectadas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TablaEvento;