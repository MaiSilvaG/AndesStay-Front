import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./catalog.css";
import { useApi } from "../useApi";

const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/units`;

export default function Catalog() {
  const { fetchWithToken } = useApi();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWithToken(API_URL)
      .then((data) => {
        setUnits(data.filter((unit) => unit.active !== false));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error conectando con el microservicio:", err);
        setError(err.message || "Error al obtener el catálogo de unidades");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container text-center my-5">Cargando catalogo...</div>;
  }

  if (error) {
    return <div className="container text-center my-5 text-danger">Error: {error}</div>;
  }

  return (
    <div className="container my-4">
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
        {units.map((unit) => (
          <div className="col" key={unit.id}>
            <div className="card h-100 shadow-sm border-0 catalog-card">
              <div className="card-body-catalog p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h3 className="card-title-catalog h5 mb-0">{unit.name}</h3>
                  <span className={`badge ${unit.type === 'LODGE' ? 'bg-primary' : unit.type === 'CABANA' ? 'bg-warning text-dark' : 'bg-success'}`}>
                    {unit.type}
                  </span>
                </div>

                <p className="card-text-catalog mb-1">
                  Ubicación: <strong>{unit.location}</strong>
                </p>

                <p className="card-price mb-1">
                  <strong>Tarifa:</strong> ${Number(unit.pricePerNight).toLocaleString("es-CL")} / noche
                </p>

                <p className="text-muted small mb-3">
                  Cupos disponibles: <strong>{unit.availableSlots}</strong> de {unit.totalSlots}
                </p>

                <hr className="my-3 text-muted" />

                <DisponibilidadCalendario unitName={unit.name} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisponibilidadCalendario({ unitName }) {
  const [fecha, setFecha] = useState(new Date());

  return (
    <div className="calendar-container">
      <h6 className="calendar-title text-center mb-2">Selecciona un día para {unitName}</h6>
      <div className="d-flex justify-content-center">
        <Calendar onChange={setFecha} value={fecha} className="custom-calendar" />
      </div>
      <p className="selected-date text-muted text-center mt-2 small">
        Fecha seleccionada: <strong>{fecha.toLocaleDateString("es-CL")}</strong>
      </p>
    </div>
  );
}