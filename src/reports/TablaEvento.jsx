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

// Fecha de referencia de cada reserva: última actualización, o check-in si no existe
const getFecha = (item) => item.lastEventAt || item.checkInDate;

const toTime = (value) => {
  const t = new Date(value).getTime();
  return isNaN(t) ? 0 : t;
};

const formatFecha = (value) => {
  if (!value) return 'N/A';
  const d = new Date(value);
  return isNaN(d) ? 'N/A' : d.toLocaleString('es-CL');
};

const LIMITE = 5;

const TablaEvento = ({ summary }) => {
  const todas = summary?.reservas || summary?.projections || [];

  // Copia antes de ordenar para no mutar el array original de las props
  const reservas = [...todas]
    .filter(Boolean)
    .sort((a, b) => toTime(getFecha(b)) - toTime(getFecha(a)))
    .slice(0, LIMITE);

  return (
    <Card className="borde">
      <Title>Últimas {LIMITE} Actualizaciones de Reservas</Title>
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
                <TableCell className="text-right">{formatFecha(getFecha(item))}</TableCell>
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