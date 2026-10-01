import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./catalog.css";
import { useApi } from "../useApi";
import ReservaModal, { toISODate } from "./ReservaModal";

const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/units`;

const FILTROS_INICIALES = {
  texto: "",
  tipo: "TODOS",
  ubicacion: "TODAS",
  soloDisponibles: false,
};

export default function CatalogCliente() {
  const { fetchWithToken } = useApi();
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [reserva, setReserva] = useState(null); // { unit, checkInDate } | null

  const cargarUnidades = () =>
    fetchWithToken(API_URL)
      .then((data) => {
        const safeData = Array.isArray(data) ? data : [];
        setUnits(safeData.filter((unit) => unit && unit.active !== false));
      })
      .catch((err) => {
        console.error("Error conectando con el microservicio:", err);
        setUnits([]);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    cargarUnidades();
  }, []);

  const tipos = useMemo(
    () => [...new Set(units.map((u) => u.type).filter(Boolean))],
    [units]
  );
  const ubicaciones = useMemo(
    () => [...new Set(units.map((u) => u.location).filter(Boolean))],
    [units]
  );

  const unitsFiltradas = useMemo(() => {
    const texto = filtros.texto.trim().toLowerCase();
    return units.filter((u) => {
      if (texto && !u.name?.toLowerCase().includes(texto)) return false;
      if (filtros.tipo !== "TODOS" && u.type !== filtros.tipo) return false;
      if (filtros.ubicacion !== "TODAS" && u.location !== filtros.ubicacion) return false;
      if (filtros.soloDisponibles && !(u.availableSlots > 0)) return false;
      return true;
    });
  }, [units, filtros]);

  const setFiltro = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const hayFiltrosActivos =
    JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  if (loading) {
    return <div className="container text-center my-5">Cargando catalogo...</div>;
  }

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="h4 mb-0">Catálogo de unidades</h2>
      </div>

      {/* Barra de filtros */}
      <div className="card shadow-sm border-0 p-3 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-4">
            <label className="form-label small mb-1">Buscar por nombre</label>
            <input
              type="text"
              className="form-control"
              placeholder="Ej: Cabaña Cóndor"
              value={filtros.texto}
              onChange={(e) => setFiltro("texto", e.target.value)}
            />
          </div>

          <div className="col-6 col-md-2">
            <label className="form-label small mb-1">Tipo</label>
            <select
              className="form-select"
              value={filtros.tipo}
              onChange={(e) => setFiltro("tipo", e.target.value)}
            >
              <option value="TODOS">Todos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-3">
            <label className="form-label small mb-1">Ubicación</label>
            <select
              className="form-select"
              value={filtros.ubicacion}
              onChange={(e) => setFiltro("ubicacion", e.target.value)}
            >
              <option value="TODAS">Todas</option>
              {ubicaciones.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          <div className="col-6 col-md-auto">
            <div className="form-check">
              <input
                id="soloDisponibles"
                type="checkbox"
                className="form-check-input"
                checked={filtros.soloDisponibles}
                onChange={(e) => setFiltro("soloDisponibles", e.target.checked)}
              />
              <label htmlFor="soloDisponibles" className="form-check-label small">
                Solo con cupos
              </label>
            </div>
          </div>

          <div className="col-12 col-md-auto ms-md-auto">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              disabled={!hayFiltrosActivos}
              onClick={() => setFiltros(FILTROS_INICIALES)}
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        <p className="text-muted small mt-3 mb-0">
          Mostrando <strong>{unitsFiltradas.length}</strong> de {units.length} unidades
        </p>
      </div>

      {unitsFiltradas.length === 0 ? (
        <div className="text-center my-5 p-4 bg-light rounded shadow-sm">
          <h4 className="text-muted mb-2">
            {units.length === 0
              ? "No hay unidades disponibles"
              : "Ninguna unidad coincide con los filtros"}
          </h4>
          <p className="text-secondary mb-0">Total registrados: {units.length}</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 justify-content-center">
          {unitsFiltradas.map((unit) => (
            <div className="col" key={unit.id}>
              <div className="card h-100 shadow-sm border-0 catalog-card">
                <div className="card-body-catalog p-3">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="card-title-catalog h5 mb-0">{unit.name}</h3>
                    <span
                      className={`badge ${
                        unit.type === "LODGE"
                          ? "bg-primary"
                          : unit.type === "CABANA"
                          ? "bg-warning text-dark"
                          : "bg-success"
                      }`}
                    >
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

                  <DisponibilidadCalendario
                    unit={unit}
                    onReservar={(fecha) => setReserva({ unit, checkInDate: fecha })}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ReservaModal
        show={!!reserva}
        unit={reserva?.unit}
        checkInDate={reserva?.checkInDate}
        onClose={() => setReserva(null)}
        onCreated={() => {
          cargarUnidades(); // refresca los cupos
          navigate("/reservations");
        }}
      />
    </div>
  );
}

function DisponibilidadCalendario({ unit, onReservar }) {
  const [fecha, setFecha] = useState(new Date());

  if (!unit) return null;

  const sinCupos = !(unit.availableSlots > 0);

  return (
    <div className="calendar-container">
      <h6 className="calendar-title text-center mb-2">Selecciona un día para {unit.name}</h6>
      <div className="d-flex justify-content-center">
        <Calendar
          onChange={setFecha}
          value={fecha}
          minDate={new Date()}
          className="custom-calendar"
        />
      </div>
      <p className="selected-date text-muted text-center mt-2 small">
        Fecha seleccionada: <strong>{fecha.toLocaleDateString("es-CL")}</strong>
      </p>

      <button
        type="button"
        className="btn btn-primary w-100"
        onClick={() => onReservar(toISODate(fecha))}
        disabled={sinCupos}
      >
        {sinCupos ? "Sin cupos disponibles" : "Reservar hora"}
      </button>
    </div>
  );
}