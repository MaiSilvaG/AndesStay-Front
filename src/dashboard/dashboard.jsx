import React, { useState, useEffect } from "react";
import CardGridMap from "./CardGridMap";
import BarListDash from "./BarListDash";
import TablaReservas from "./tablaReservas";
import { useApi } from "../useApi";

const normalizeReserva = (r) => ({
  id: r.id,
  guest_id: r.guest_id ?? r.guestId,
  guest_name: r.guest_name ?? r.guestName,
  unit_id: r.unit_id ?? r.unitId,
  check_in_date: r.check_in_date ?? r.checkInDate,
  check_out_date: r.check_out_date ?? r.checkOutDate,
  status: r.status,
});

export default function Dashboard() {
  const { fetchWithToken } = useApi();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ultimasReservas, setUltimasReservas] = useState([]);

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
        
        const listaNormalizada = rawList.filter(Boolean).map(normalizeReserva);

        const byStatus = listaNormalizada.reduce((acc, item) => {
          const status = item.status || "DESCONOCIDO";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        
        const summary = {
          totalReservations: listaNormalizada.length,
          byStatus: byStatus,
          activeStays: byStatus.EN_ESTADIA || 0,
        };

        const recientes = [...listaNormalizada]
            .sort((a,b) => b.id - a.id)
            .slice(0,5);

        setReportData(summary);
        setUltimasReservas(recientes);
      })
      .catch((err) => {
        console.error("Error al obtener reservas para el dashboard:", err);
        setReportData({
          totalReservations: 0,
          byStatus: {},
          activeStays: 0,
        });
        setUltimasReservas([]);
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

      <BarListDash summary={reportData} />

      <TablaReservas reservas={ultimasReservas} />

      
    </main>
  );
}