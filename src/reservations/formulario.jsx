import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../useApi";
import './formulario.css';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/reservations`;

function Formulario() {
  const { fetchWithToken } = useApi();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    guestName: "",
    unitId: "",
    checkInDate: "",
    checkOutDate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
      alert("La fecha de Check-Out debe ser posterior a la fecha de Check-In.");
      return;
    }

    setLoading(true);

    const generatedGuestId = `u-${Math.floor(216 + Math.random() * 800)}`;

    const payload = {
      guestId: generatedGuestId,
      guestName: formData.guestName,
      unitId: parseInt(formData.unitId, 10),
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate
    };

    try {
      await fetchWithToken(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      alert(`Reserva creada con éxito para ${formData.guestName}`);
      navigate("/reservas");
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("Error al registrar la reserva. Verifique la conexión o autenticación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor">
      <form onSubmit={handleSubmit} className="formulario">
        <h2>Crear Nueva Reserva</h2>

        <div>
          <label htmlFor="guestName">Nombre del Huésped</label>
          <input
            type="text"
            id="guestName"
            name="guestName"
            placeholder="Ej: Ana Soto"
            value={formData.guestName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="unitId">Número / ID de Unidad (1 al 19)</label>
          <input
            type="number"
            id="unitId"
            name="unitId"
            min="1"
            max="19"
            placeholder="Ej: 5"
            value={formData.unitId}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="checkInDate">Fecha Check-In</label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="checkOutDate">Fecha Check-Out</label>
          <input
            type="date"
            id="checkOutDate"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="boton" disabled={loading}>
          {loading ? "Registrando..." : "Crear Reserva"}
        </button>
      </form>
    </div>
  );
}

export default Formulario;