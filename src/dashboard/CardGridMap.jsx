import React from "react";
import { Card, Grid, Flex, Text, Metric, ProgressBar } from "@tremor/react";

const data = [
  {
    title: 'Ocupación',
    metric: '25',
    progress: 25,
    target: '100',
    color: 'red'
  },
  {
    title: 'Check-In',
    metric: '10',
    progress: 10,
    target: '100',
    color: 'emerald'
  },
  {
    title: 'Check-Out',
    metric: '5',
    progress: 5,
    target: '100',
    color: 'amber'
  },
  {
    title: 'Disponibles',
    metric: '75',
    progress: 75,
    target: '100',
    color: 'indigo'
  }
];

const CardGridMap = () => {
    return(
        <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
            {data.map((item) => (
                <Card key={item.title}>
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

export default CardGridMap