import React from "react";
import { Card, Grid, Flex, Text, Metric, ProgressBar } from "@tremor/react";

export const data = [
  {
    title: 'Ocupación Activa',
    metric: '78%',
    progress: 78,
    target: '100%',
    color: 'emerald'
  },
  {
    title: 'Tiempo de Ciclo Promedio',
    metric: '1h 25m',
    progress: 85, // 85% de cumplimiento dentro de la meta (< 1h 30m)
    target: '1h 15m',
    color: 'amber'
  },
  {
    title: 'Reservas Hoy',
    metric: '42',
    progress: 84, // 42 reservas alcanzadas de una meta diaria de 50
    target: '50',
    color: 'indigo'
  },
  {
    title: 'Tickets Housekeeping',
    metric: '6 Pendientes',
    progress: 30, // 30% del volumen crítico máximo (ej. 20 habitaciones)
    target: '0',
    color: 'red'
  }
];

const CardGridMapReport = () => {
    return(
        <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
            {data.map((item) => (
                <Card key={item.title} className="borde">
                    <Flex >
                        <div>
                            <Text className="text-lg font-medium text-gray-600">{item.title}</Text>
                            <Metric className="text-3xl font-bold mt-1">{item.metric}</Metric>
                        </div>
                    </Flex>

                    <Flex>
                        <Text>{`${item.progress}% (${item.metric})`}</Text>
                        <Text>{item.target}</Text>
                    </Flex>

                    <ProgressBar value={item.progress} color={item.color} className="mt-2"/>
                </Card>
            ))}
        </Grid> 
    )
}

export default CardGridMapReport