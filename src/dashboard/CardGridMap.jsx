import React from "react";
import { Card, Grid, Flex, Text, Metric, ProgressBar } from "@tremor/react";
import './dashboard.css';

export default function CardGridMap({ summary }) {
  const statusMap = summary?.byStatus || summary?.reservationsByStatus || {};
  
  const creadas = Number(statusMap.CREADA || 0);
  const confirmadas = Number(statusMap.CONFIRMADA || 0);
  const checkinPendiente = Number(statusMap.CHECKIN_PENDIENTE || 0);
  const enEstadia = Number(summary?.activeStays ?? statusMap.EN_ESTADIA ?? 0);
  const checkout = Number(statusMap.CHECKOUT || 0);
  const canceladas = Number(statusMap.CANCELADA || 0);

  const totalReservas = Number(
    summary?.totalReservations ?? 
    summary?.total ?? 
    (creadas + confirmadas + checkinPendiente + enEstadia + checkout + canceladas)
  );

  const cardsData = [
    {
      title: "Total Reservas",
      metric: String(totalReservas),
      progress: totalReservas > 0 ? 100 : 0,
      target: "Total registradas",
      color: "indigo"
    },
    {
      title: "Estadías Activas",
      metric: String(enEstadia),
      progress: totalReservas > 0 ? Math.round((enEstadia / totalReservas) * 100) : 0,
      target: `${totalReservas} total`,
      color: "emerald"
    },
    {
      title: "Completadas (Check-Out)",
      metric: String(checkout),
      progress: totalReservas > 0 ? Math.round((checkout / totalReservas) * 100) : 0,
      target: `${totalReservas} total`,
      color: "amber"
    },
    {
      title: "Canceladas",
      metric: String(canceladas),
      progress: totalReservas > 0 ? Math.round((canceladas / totalReservas) * 100) : 0,
      target: `${totalReservas} total`,
      color: "red"
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
            <Text>{`${item.progress}%`}</Text>
            <Text>{item.target}</Text>
          </Flex>

          <ProgressBar value={item.progress} color={item.color} className="mt-2" />
        </Card>
      ))}
    </Grid>
  );
}