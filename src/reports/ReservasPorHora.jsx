import {LineChart, Card, Title, Metric} from '@tremor/react'

const reservas = [
  { date: "2026-09-10", hour: "08:00", Habitacion: 2, Cabaña: 1 },
  { date: "2026-09-10", hour: "10:00", Habitacion: 6, Cabaña: 3 },
  { date: "2026-09-10", hour: "12:00", Habitacion: 11, Cabaña: 5 },
  { date: "2026-09-10", hour: "14:00", Habitacion: 14, Cabaña: 8 },
  { date: "2026-09-10", hour: "16:00", Habitacion: 10, Cabaña: 6 },
  { date: "2026-09-10", hour: "18:00", Habitacion: 7, Cabaña: 4 },
  { date: "2026-09-10", hour: "20:00", Habitacion: 3, Cabaña: 2 }
];

const ReservasPorHora = () => {
    return(
        <Card className='borde'>
            <Title>Reservas Por Hora</Title>
            <LineChart
            className="h-80"
            data={reservas}
            index="hour"
            categories={["Habitacion", "Cabaña"]}
            colors={["amber", "indigo"]}
            valueFormatter={(number) => `${number}`}
            onValueChange={(v) => console.log(v)}
            xAxisLabel="Horas"
            yAxisLabel="Cantidad Reservas"
            />
        </Card>
        
    );
};

export default ReservasPorHora