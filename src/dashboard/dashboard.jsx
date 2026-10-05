import React, { useState, useEffect } from "react";
import CardGridMap from "./CardGridMap";
import BarListDash from "./BarListDash";
import ChartDonut from "./ChartDonut";
import { Grid } from "@tremor/react";
import { useApi } from "../useApi";

export default function Dashboard() {
  const { fetchWithToken } = useApi();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/`;

    const RESERVATIONS_API_URL = `${baseUrl}api/reservations`;

    fetchWithToken(RESERVATIONS_API_URL)
      .then((data) => {
        const rawList = Array.isArray(data)
          ? data
          : (data?.reservations ?? data?.data ?? data?.content ?? []);
        
        const byStatus = rawList.reduce((acc, item) => {
          const status = item.status || "DESCONOCIDO";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const summary = {
          totalReservations: rawList.length,
          byStatus: byStatus,
          activeStays: byStatus.EN_ESTADIA || 0,
        };

        setReportData(summary);
      })
      .catch((err) => {
        console.error("Error al obtener reservas para el dashboard:", err);
        setReportData({
          totalReservations: 0,
          byStatus: {},
          activeStays: 0,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="p-6 sm:p-10 min-h-screen flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-gray-500 font-medium">Cargando reporte...</p>
      </main>
    );
  }

  return (
    <main className="p-6 sm:p-10 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <CardGridMap summary={reportData} />

      <Grid numItemsSm={1} numItemsLg={2} className="gap-6 mt-6">
        <BarListDash summary={reportData} />
        <ChartDonut summary={reportData} />
      </Grid>
    </main>
  );
}