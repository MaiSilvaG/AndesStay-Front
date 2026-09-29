import React from 'react';
import { Card, BarChart, Title } from '@tremor/react';

const ReservasPorUnidad = ({ summary }) => {
  const byUnit = summary?.byUnit || summary?.conteoPorUnidad || {};

  const data = Object.entries(byUnit).map(([unitId, count]) => ({
    unidad: `Unidad ${unitId}`,
    Reservas: Number(count)
  }));

  return (
    <Card className='borde'>
      <Title>Reservas por Unidad</Title>
      {data.length > 0 ? (
        <BarChart
          className="h-80 mt-4"
          data={data}
          index="unidad"
          categories={["Reservas"]}
          colors={["indigo"]}
          valueFormatter={(number) => `${number} reservas`}
          xAxisLabel="Unidad ID"
          yAxisLabel="Cantidad"
        />
      ) : (
        <p className="text-gray-500 text-sm mt-4">Sin datos por unidad</p>
      )}
    </Card>
  );
};

export default ReservasPorUnidad;