import React from "react";
import { Card, Grid, Flex, Text, Metric, ProgressBar } from "@tremor/react";

const CardGridMapReport = ({ summary }) => {
  const cardsData = [
    {
      title: 'Ocupación Activa',
      metric: summary?.ocupacion ? `${summary.ocupacion}%` : '0%',
      progress: summary?.ocupacion || 0,
      color: 'emerald'
    },
    {
      title: 'Tiempo de Ciclo Promedio',
      metric: summary?.tiempoPromedio || '0m',
      progress: summary?.cumplimientoCiclo || 0,
      color: 'amber'
    },
    {
      title: 'Reservas Hoy',
      metric: `${summary?.totalReservasHoy || 0}`,
      progress: summary?.porcentajeReservas || 0,
      color: 'indigo'
    },
    {
      title: 'Tickets Housekeeping',
      metric: `${summary?.ticketsPendientes || 0} Pendientes`,
      progress: summary?.porcentajeTickets || 0,
      color: 'red'
    }
  ];

  return (
    <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
      {cardsData.map((item) => (
        <Card key={item.title} className="borde">
          <Flex>
            <div>
              <Text className="text-lg font-medium text-gray-600">{item.title}</Text>
              <Metric className="text-3xl font-bold mt-1">{item.metric}</Metric>
            </div>
          </Flex>

          <Flex className="mt-4">
            <Text>{`${item.progress}% (${item.metric})`}</Text>
            <Text>{item.target}</Text>
          </Flex>

          <ProgressBar value={item.progress} color={item.color} className="mt-2" />
        </Card>
      ))}
    </Grid>
  );
};

export default CardGridMapReport;