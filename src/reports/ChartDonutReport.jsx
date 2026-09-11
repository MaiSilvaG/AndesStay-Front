import React from 'react'
import { Card, DonutChart, Title } from '@tremor/react'

const unidades = [
  { name: "habitacion", value: 25},
  { name: "cabaña", value: 15}
];

const ChartDonutReport = () => {
  return (
    <Card>
        <Title>Unidad Mas demandada</Title>
        <DonutChart 
            data={unidades}
            variant='pie'
            category='value'
            dataKey='name'
            marginTop='mt-6'
            colors={['amber','indigo']}
        />
    </Card>
  )
}

export default ChartDonutReport