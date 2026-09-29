import React, { useState, useEffect } from "react";
import CardGridMapReport from "./CardGridMapReport";
import ChartDonutReport from "./ChartDonutReport";
import ReservasPorHora from "./ReservasPorHora";
import TiempoCiclo from "./TiempoCiclo";
import TablaEvento from "./TablaEvento";
import { Grid } from "@tremor/react";
import { useApi } from "../useApi";

export default function Reports() {
  const { fetchWithToken } = useApi();
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/`;

    const SUMMARY_URL = `${baseUrl}api/reports/summary`;

    fetchWithToken(SUMMARY_URL)
      .then((data) => {
        setSummaryData(data || {});
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al obtener reportes:", err);
        setSummaryData({});
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="p-6 sm:p-10 min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-gray-500 font-medium">Cargando reporte de reservas...</p>
      </main>
    );
  }

  return (
    <main className="p-6 sm:p-10 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Reporte de Operaciones y Reservas</h1>

      <CardGridMapReport summary={summaryData} />

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <ChartDonutReport summary={summaryData} />
        <TiempoCiclo summary={summaryData} />
      </Grid>

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <ReservasPorHora summary={summaryData} />
        <TablaEvento summary={summaryData} />
      </Grid>
    </main>
  );
}