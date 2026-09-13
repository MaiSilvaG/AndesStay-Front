import { useState } from "react";
import habitacionImg from "../assets/habitacion.jpg";
import cabanaImg from "../assets/cabaña.jpg";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import './catalog.css';

const unidadesIniciales = [
  {
    id: 1,
    nombre: "Habitación",
    imagen: habitacionImg,
    tarifa: 100,
    descripcion: "Habitación doble con vista al mar.",
    diasDisponibles: [
      "2026-09-10",
      "2026-09-12",
      "2026-09-15"
    ],
  },
  {
    id: 2,
    nombre: "Cabaña",
    imagen: cabanaImg,
    tarifa: 200,
    descripcion: "Cabaña suite con vista al bosque.",
    diasDisponibles: [
      "2026-09-20",
      "2026-09-22",
      "2026-09-25"
    ],
  },
];

export default function Catalog({ unidades = unidadesIniciales }) {
  return (
    <div className="container my-4">
      <div className="row row-cols-1 row-cols-md-2 g-4 justify-content-center">
        {unidades.map((unidad) => (
          <div className="col" key={unidad.id}>
            <div className="card h-100 shadow-sm border-0 catalog-card">
              <img 
                src={unidad.imagen} 
                className="card-img-top catalog-img" 
                alt={unidad.nombre} 
              />
              <div className="card-body-catalog">
                <h3 className="card-title-catalog">{unidad.nombre}</h3>
                <p className="card-text-catalog">{unidad.descripcion}</p>
                <p className="card-price">
                  <strong>Tarifa:</strong> ${unidad.tarifa} / noche
                </p>
                
                <hr className="my-3 text-muted" />

                <DisponibilidadCalendario
                  diasDisponibles={unidad.diasDisponibles}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisponibilidadCalendario({ diasDisponibles }) {
  const [fecha, setFecha] = useState(new Date());

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const deshabilitarDiasNoDisponibles = ({ date, view }) => {
    if (view === 'month') {
      const fechaLocal = formatLocalDate(date);
      return !diasDisponibles.includes(fechaLocal);
    }
    return false;
  };

  return (
    <div className="calendar-container">
      <h5 className="calendar-title">Selecciona un día disponible</h5>
      <div className="d-flex justify-content-center">
        <Calendar
          onChange={setFecha}
          value={fecha}
          tileDisabled={deshabilitarDiasNoDisponibles}
        />
      </div>
      <p className="selected-date text-muted mt-2">
        Fecha seleccionada: <strong>{fecha.toLocaleDateString()}</strong>
      </p>
    </div>
  );
}