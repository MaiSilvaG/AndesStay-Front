import React from 'react';
import { Card, DonutChart, Title } from '@tremor/react';

const ChartDonut = ({ summary }) => {
  const statusMap = summary?.byStatus || summary?.conteoPorEstado || {};
  
  const formattedData = Object.entries(statusMap).map(([status, count]) => ({
    name: status,
    value: Number(count) || 0
  }));

  return (
    <Card className="borde">
      <Title>Reservas por Estado</Title>
      {formattedData.length > 0 ? (
        <DonutChart 
          className="mt-6 h-52"
          data={formattedData}
          category="value"
          index="name"
          variant="pie"
          colors={['red','amber', 'indigo', 'emerald', 'blue', 'green']}
        />
      ) : (
        <p className="text-gray-500 text-sm mt-4 text-center">Sin datos de estados</p>
      )}
    </Card>
  );
};

export default ChartDonut;