import React from "react";
import {Card, Title, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Badge,} from "@tremor/react";
import './dashboard.css';

const formatDate = (value) => {
  if (!value) return "N/A";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : "N/A";
};

const getBadgeColor = (status) => {
  switch (status) {
    case "CONFIRMADA":
      return "green";
    case "EN_ESTADIA":
      return "blue";
    case "CREADA":
      return "indigo";
    case "CHECKIN_PENDIENTE":
      return "amber";
    case "CANCELADA":
      return "red";
    case "CHECKOUT":
      return "slate";
    default:
      return "slate";
  }
};

export default function TablaReservas({ reservas = [] }) {
  return (
    <Card className="mt-6 borde">
      <Title>Últimas 5 Reservas Realizadas</Title>
      <Table className="mt-4 tabla_custom">
        <TableHead className="color_header">
          <TableRow >
            <TableHeaderCell className="bordes">ID</TableHeaderCell>
            <TableHeaderCell className="bordes">ID Huésped</TableHeaderCell>
            <TableHeaderCell className="bordes">Nombre</TableHeaderCell>
            <TableHeaderCell className="bordes">Unidad</TableHeaderCell>
            <TableHeaderCell className="bordes">Check-In</TableHeaderCell>
            <TableHeaderCell className="bordes">Check-Out</TableHeaderCell>
            <TableHeaderCell className="bordes">Estado</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservas.length > 0 ? (
            reservas.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium bordes">#{item.id}</TableCell>
                <TableCell className="bordes">{item.guest_id ?? "N/A"}</TableCell>
                <TableCell className="bordes">{item.guest_name ?? "N/A"}</TableCell>
                <TableCell className="bordes">Unidad #{item.unit_id ?? "N/A"}</TableCell>
                <TableCell className="bordes">{formatDate(item.check_in_date)}</TableCell>
                <TableCell className="bordes">{formatDate(item.check_out_date)}</TableCell>
                <TableCell className="bordes">
                  <Badge color={getBadgeColor(item.status)}>
                    {item.status ?? "N/A"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-gray-500">
                No hay reservas registradas.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
}