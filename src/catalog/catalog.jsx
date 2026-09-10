import { useState } from "react";
import habitacionImg from "../assets/habitacion.jpg";
import cabanaImg from "../assets/cabaña.jpg";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import "@daypicker/react/style.css";
// cambiar por base de datos
const unidadesIniciales = [
  {
    id: 1,
    nombre: "Habitación",
    tipo: "Doble",
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
    tipo: "Suite",
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
    <div className="container mt-4">
      <div className="row row-cols-1 row-cols-md-2 g-4">
        {unidades.map((unidad) => (
          <div className="col" key={unidad.id}>
            <div className="card">
              <img src={unidad.imagen} className="card-img-top" alt={unidad.nombre} />
              <div className="card-body">
                <h3 className="card-title text-center">{unidad.nombre}</h3>
                <p className="card-text">{unidad.tipo}</p>
                <p className="card-text">{unidad.descripcion}</p>
                <p className="card-text">Tarifa: {unidad.tarifa}</p>
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

function DisponibilidadCalendario({diasDisponibles}) {
  const [fecha, setFecha] = useState(new Date());

  // Función para deshabilitar los días que NO están en la lista
  const deshabilitarDiasNoDisponibles = ({ date, view }) => {
    if (view === 'month') { 
      const fechaIso = date.toISOString().split('T')[0];
      return !diasDisponibles.includes(fechaIso);
    }
    return false;
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h3>Selecciona un día disponible</h3>
      <Calendar
        onChange={setFecha}
        value={fecha}
        tileDisabled={deshabilitarDiasNoDisponibles}
      />
      <p>Fecha seleccionada: {fecha.toLocaleDateString()}</p>
    </div>
  );
}
