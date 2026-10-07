import React from "react";
import { BarList, Card, Title, Text } from "@tremor/react";
import './dashboard.css';

export default function BarListDash({ summary }) {
  const byStatus = summary?.byStatus || summary?.reservationsByStatus || {};

  const labelMap = {
    CREADA: "Creada",
    CONFIRMADA: "Confirmada",
    CHECKIN_PENDIENTE: "Check-in Pendiente",
    EN_ESTADIA: "En Estadía",
    CHECKOUT: "Check-out (Finalizada)",
    CANCELADA: "Cancelada"
  };

  const listData = Object.entries(byStatus).map(([key, val]) => ({
    name: labelMap[key] || key,
    value: Number(val) || 0,
  }));

  return (
    <Card className="borde">
      <Title>Reservas por Estado</Title>
      <div className="mt-6">
        {listData.length > 0 ? (
          <BarList data={listData} sortOrder="descending" className="barra" />
        ) : (
          <Text className="text-center text-muted my-6">Sin datos de estados</Text>
        )}
      </div>
    </Card>
  );
}