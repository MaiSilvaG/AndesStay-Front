import React from 'react';
import { Card, BarChart, Title } from '@tremor/react';

const TiempoCiclo = ({ summary }) => {
  const byUnit = summary?.byUnit || summary?.conteoPorUnidad || {
    "Unidad 1": 1, "Unidad 2": 1, "Unidad 3": 1, "Unidad 4": 1, "Unidad 5": 1
  };

  const data = Object.entries(byUnit).map(([unit, count]) => ({
    unidad: `Unidad ${unit.replace('Unidad ', '')}`,
    Cantidad: Number(count)
  }));

  return (
    <Card className='borde'>
      <Title>Reservas por Unidad</Title>
      <BarChart
        className="h-80 mt-4"
        data={data.length > 0 ? data : [{ unidad: "Unidad 1", Cantidad: 1 }]}
        index="unidad"
        categories={["Cantidad"]}
        colors={["indigo"]}
        valueFormatter={(number) => `${number}`}
        xAxisLabel="Unidades"
        yAxisLabel="Total Reservas"
      />
    </Card>
  );
};

export default TiempoCiclo;