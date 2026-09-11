import React from 'react'
import { Card, DonutChart, Title } from '@tremor/react'

const unidades = [
  { name: "habitacion", value: 25},
  { name: "cabaña", value: 15}
];

const ChartDonut = () => {
  return (
    <Card>
        <Title>Tipos de Hospedajes</Title>
        <DonutChart 
            data={unidades}
            category='value'
            dataKey='name'
            marginTop='mt-6'
            colors={['amber','indigo']}
        />
    </Card>
  )
}

export default ChartDonut