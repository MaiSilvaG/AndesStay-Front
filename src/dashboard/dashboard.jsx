import React from "react";
import CardGridMap from "./CardGridMap";
import BarListDash from "./BarListDash";
import ChartDonut from "./ChartDonut";
import {Grid,} from "@tremor/react";

const Dashboard = () => {
  return (
    <main className="p-6 sm:p-10 min-h-screen">
      <h1>Dashboard</h1>

      <CardGridMap/>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <BarListDash />
        <ChartDonut />
      </Grid>
    </main>
  );
};

export default Dashboard;