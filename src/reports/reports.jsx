import ChartDonutReport from "./ChartDonutReport";
import {Grid,} from "@tremor/react";  
import ReservasPorHora from "./ReservasPorHora";
import CardGridMapReport from "./CardGridMapReport";
import TiempoCiclo from "./TiempoCiclo";
import TablaEvento from "./TablaEvento";

const Reports = () => {
  return (
    <main className="p-6 sm:p-10 min-h-screen">
      <h1>Report</h1>

      <CardGridMapReport/>
      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <ChartDonutReport/>
        <ReservasPorHora/>
        
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <TiempoCiclo/>
        <TablaEvento/>
      </Grid>
    </main>
  );
};

export default Reports;