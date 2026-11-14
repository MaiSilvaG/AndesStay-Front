import { useState } from "react";
import { TIPOS } from "../ui/dominio";

const FORM_INICIAL = { name: "", type: "CABANA", location: "", pricePerNight: "", totalSlots: "4" };

// Panel lateral del catálogo del personal para crear una unidad
export default function CrearUnidad({ onClose, onSubmit }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const setCampo = (campo) => (e) => setForm((prev) => ({ ...prev, [campo]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    const precio = Number(form.pricePerNight);
    const cupos = Number(form.totalSlots);

    if (!form.name.trim() || !form.location.trim()) return setError("Nombre y ubicación son obligatorios.");
    if (!(precio > 0)) return setError("La tarifa debe ser mayor a 0.");
    if (!Number.isInteger(cupos) || cupos < 1) return setError("Los cupos totales deben ser un número entero desde 1.");

    setSaving(true);
    setError("");
    try {
      await onSubmit({
        name: form.name.trim(),
        type: form.type,
        location: form.location.trim(),
        pricePerNight: precio,
        totalSlots: cupos,
      });
      setForm(FORM_INICIAL);
    } catch (err) {
      setError(err.message || "No se pudo crear la unidad. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside aria-label="Crear unidad" className="as-surface p-4 crear-unidad">
      <form onSubmit={enviar} className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="as-section-title">Crear unidad</h2>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" />
        </div>

        {error && <div className="alert alert-danger m-0" role="alert">{error}</div>}

        <div>
          <label htmlFor="u-nombre" className="form-label">Nombre</label>
          <input id="u-nombre" className="form-control" placeholder="Ej: Cabaña Ñirre" value={form.name} onChange={setCampo("name")} required />
        </div>

        <fieldset>
          <legend className="form-label">Tipo</legend>
          <div className="d-flex flex-wrap gap-2">
            {Object.entries(TIPOS).map(([valor, { label }]) => (
              <label key={valor} className={`as-chip ${form.type === valor ? "is-on" : ""}`}>
                <input type="radio" name="tipo" value={valor} checked={form.type === valor} onChange={setCampo("type")} className="visually-hidden" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="u-ubic" className="form-label">Ubicación</label>
          <input id="u-ubic" className="form-control" placeholder="Ej: Pucón" value={form.location} onChange={setCampo("location")} required />
        </div>

        <div className="row g-3">
          <div className="col-6">
            <label htmlFor="u-tarifa" className="form-label">Tarifa por noche</label>
            <input id="u-tarifa" type="number" min="1" className="form-control" placeholder="$ 0" value={form.pricePerNight} onChange={setCampo("pricePerNight")} required />
          </div>
          <div className="col-6">
            <label htmlFor="u-cupos" className="form-label">Cupos totales</label>
            <input id="u-cupos" type="number" min="1" step="1" className="form-control" value={form.totalSlots} onChange={setCampo("totalSlots")} required />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Creando..." : "Crear unidad"}
        </button>
      </form>
    </aside>
  );
}
