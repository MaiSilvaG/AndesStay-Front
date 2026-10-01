import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import { useApi } from "../useApi";
import './formulario.css';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/reservations`;
const UNITS_URL = `${baseUrl}api/units`;
const getToday = () => {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};

function Formulario() {
  const { fetchWithToken } = useApi();
  const { accounts } = useMsal();
  const account = accounts[0];
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [units, setUnits] = useState([]);
  const [unitsError, setUnitsError] = useState(false);

  const [formData, setFormData] = useState({
    guestName: account?.name || "",
    unitId: "",
    checkInDate: "",
    checkOutDate: ""
  });

  const today = getToday();
  useEffect(() => {
    fetchWithToken(UNITS_URL)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setUnits(list.filter((u) => u && u.active !== false));
      })
      .catch((err) => {
        console.error("Error al cargar unidades:", err);
        setUnitsError(true);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "checkInDate" && next.checkOutDate && next.checkOutDate <= value) {
        next.checkOutDate = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (formData.checkInDate < today) {
      setErrorMsg("La fecha de Check-In no puede ser anterior a hoy.");
      return;
    }

    // Las fechas YYYY-MM-DD se pueden comparar directamente como texto
    if (formData.checkOutDate <= formData.checkInDate) {
      setErrorMsg("La fecha de Check-Out debe ser posterior a la fecha de Check-In.");
      return;
    }

    if (!account) {
      setErrorMsg("Debes iniciar sesión para crear una reserva.");
      return;
    }

    setLoading(true);

    const payload = {
      guestId: account.localAccountId, // ID real del usuario logueado (ajusta si tu backend espera otro, ej. account.username)
      guestName: formData.guestName.trim(),
      unitId: parseInt(formData.unitId, 10),
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate
    };

    try {
      await fetchWithToken(API_URL, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      navigate("/reservations");
    } catch (error) {
      console.error("Error al crear la reserva:", error);
      setErrorMsg("No se pudo registrar la reserva. Verifica que la unidad tenga cupo y que tu sesión siga activa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor">
      <form onSubmit={handleSubmit} className="formulario">
        <h2>Crear Nueva Reserva</h2>

        {errorMsg && (
          <div className="alert alert-danger" role="alert">
            {errorMsg}
          </div>
        )}

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
          {units.length > 0 && !unitsError ? (
            <>
              <label htmlFor="unitId">Unidad</label>
              <select
                id="unitId"
                name="unitId"
                value={formData.unitId}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona una unidad</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div>
          <label htmlFor="checkInDate">Fecha Check-In</label>
          <input
            type="date"
            id="checkInDate"
            name="checkInDate"
            min={today}
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
            min={formData.checkInDate || today}
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