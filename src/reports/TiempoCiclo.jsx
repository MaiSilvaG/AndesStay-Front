import { Card, BarChart , Title } from '@tremor/react'

const data = [
  {
    categoria: "Habitación",
    tiempoPromedio: 45, // minutos reales
    tiempoMeta: 60      // meta límite
  },
  {
    categoria: "Cabaña",
    tiempoPromedio: 110, // minutos reales (alerta / cuello de botella)
    tiempoMeta: 90       // meta límite
  }
];

const TiempoCiclo = () => {
    return(
        <Card className='borde'>
            <Title>Reservas Por Hora</Title>
            <BarChart
            className="h-80"
            data={data}
            index="hour"
            categories={["tiempoPromedio", "tiempoMeta"]}
            colors={["amber", "indigo"]}
            valueFormatter={(number) => `${number}`}
            onValueChange={(v) => console.log(v)}
            xAxisLabel="Tipo Unidad"
            yAxisLabel="Tiempo minutos"
            />
        </Card>
        
    );
};

export default TiempoCiclo