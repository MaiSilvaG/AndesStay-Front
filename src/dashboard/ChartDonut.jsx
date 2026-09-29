import React from 'react';
import { Card, DonutChart, Title, Text } from '@tremor/react';
import './dashboard.css';

export default function ChartDonut({ summary }) {
  const byUnit = summary?.byUnit || summary?.reservationsByUnit || {};

  const chartData = Object.entries(byUnit).map(([unitId, count]) => ({
    name: `Unidad ${unitId}`,
    value: Number(count) || 0,
  }));

  return (
    <Card className="borde">
      <Title>Reservas por Unidad</Title>
      {chartData.length > 0 ? (
        <DonutChart
          data={chartData}
          category="value"
          index="name"
          className="mt-6 h-52"
          colors={['amber', 'indigo', 'emerald', 'rose', 'cyan', 'violet', 'fuchsia']}
        />
      ) : (
        <Text className="text-center text-muted my-6">Sin datos por unidad</Text>
      )}
    </Card>
  );
}