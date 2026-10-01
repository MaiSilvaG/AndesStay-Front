import { useState } from "react";

const FORM_INICIAL = {
  name: "",
  type: "LODGE",
  location: "",
  pricePerNight: "",
  totalSlots: "",
};

export default function CrearUnidad({ show, onClose, onSubmit }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!show) return null;

  const setCampo = (campo, valor) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const cerrar = () => {
    if (saving) return;
    setForm(FORM_INICIAL);
    setError("");
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const precio = Number(form.pricePerNight);
    const cupos = Number(form.totalSlots);

    if (!form.name.trim() || !form.location.trim()) {
      setError("Nombre y ubicación son obligatorios.");
      return;
    }
    if (!(precio > 0)) {
      setError("La tarifa debe ser mayor a 0.");
      return;
    }
    if (!Number.isInteger(cupos) || cupos < 1) {
      setError("Los cupos totales deben ser un entero mayor o igual a 1.");
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        type: form.type,
        location: form.location.trim(),
        pricePerNight: precio,
        totalSlots: cupos,
        availableSlots: cupos, 
        active: true,
      });
      setForm(FORM_INICIAL);
      onClose();
    } catch (err) {
      console.error("Error creando unidad:", err);
      setError("No se pudo crear la unidad. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Crear unidad</h5>
              <button type="button" className="btn-close" onClick={cerrar} aria-label="Cerrar" />
            </div>

            <div className="modal-body">
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setCampo("name", e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label">Tipo</label>
                  <select
                    className="form-select"
                    value={form.type}
                    onChange={(e) => setCampo("type", e.target.value)}
                  >
                    <option value="LODGE">LODGE</option>
                    <option value="CABANA">CABANA</option>
                    <option value="CAMPING">CAMPING</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Ubicación</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.location}
                    onChange={(e) => setCampo("location", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label">Tarifa por noche (CLP)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={form.pricePerNight}
                    onChange={(e) => setCampo("pricePerNight", e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label">Cupos totales</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-control"
                    value={form.totalSlots}
                    onChange={(e) => setCampo("totalSlots", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={cerrar}
                disabled={saving}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? "Guardando..." : "Crear unidad"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}