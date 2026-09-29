import React from 'react';
import { Card, DonutChart, Title } from '@tremor/react';

const ChartDonutReport = ({ summary }) => {
  const statusMap = summary?.byStatus || summary?.conteoPorEstado || {};
  
  const formattedData = Object.entries(statusMap).map(([status, count]) => ({
    name: status,
    value: Number(count)
  }));

  return (
    <Card className='borde'>
      <Title>Reservas por Estado</Title>
      {formattedData.length > 0 ? (
        <DonutChart 
          data={formattedData}
          variant='pie'
          category='value'
          dataKey='name'
          marginTop='mt-6'
          colors={['blue', 'indigo', 'amber', 'emerald', 'slate', 'rose']}
        />
      ) : (
        <p className="text-gray-500 text-sm mt-4">Sin datos de estados</p>
      )}
    </Card>
  );
};

export default ChartDonutReport;