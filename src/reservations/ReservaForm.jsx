import { useState } from "react";
import { useMsal } from "@azure/msal-react";
import { API, useApi } from "../useApi";
import { formatoPrecio, tipoLabel } from "../ui/dominio";
import { hoyISO, noches, sumarDias } from "../ui/fechas";

/**
 * Formulario para crear una reserva. Lo usan el modal del catálogo (unidad fija)
 * y la página "Nueva reserva" (elige la unidad de `unidades`).
 * `personal`: quien reserva es recepción o admin, a nombre de un huésped.
 */
export default function ReservaForm({ unit, unidades = [], personal = false, entradaInicial, onCreated, onCancel }) {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() ?? accounts[0];
  const { fetchWithToken } = useApi();

  const entrada0 = entradaInicial ?? hoyISO();
  const [guestName, setGuestName] = useState(personal ? "" : account?.name ?? "");
  const [guestId, setGuestId] = useState("");
  const [unitId, setUnitId] = useState(unit?.id ?? "");
  const [checkIn, setCheckIn] = useState(entrada0);
  const [checkOut, setCheckOut] = useState(sumarDias(entrada0, 1));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const unidad = unit ?? unidades.find((u) => String(u.id) === String(unitId));
  const n = noches(checkIn, checkOut);
  const total = unidad && n > 0 ? n * Number(unidad.pricePerNight) : 0;

  const cambiarEntrada = (valor) => {
    setCheckIn(valor);
    if (valor && checkOut <= valor) setCheckOut(sumarDias(valor, 1));
  };

  const enviar = async (e) => {
    e.preventDefault();
    if (!unidad) return setError("Elige una unidad.");
    if (!guestName.trim()) return setError("Ingresa el nombre del huésped.");
    if (personal && !guestId.trim()) return setError("Ingresa el documento del huésped.");
    if (checkIn < hoyISO()) return setError("La llegada no puede ser anterior a hoy.");
    if (checkOut <= checkIn) return setError("La salida debe ser posterior a la llegada.");

    setSaving(true);
    setError("");
    try {
      const creada = await fetchWithToken(`${API}/reservations`, {
        method: "POST",
        body: JSON.stringify({
          // Cliente: el back toma el huésped del token. Personal: lo indica aquí.
          ...(personal && { guestId: guestId.trim() }),
          guestName: guestName.trim(),
          unitId: unidad.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
      });
      onCreated?.(creada);
    } catch (err) {
      setError(err.message || "No se pudo crear la reserva. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={enviar} className="d-flex flex-column gap-3">
      {error && <div className="alert alert-danger m-0" role="alert">{error}</div>}

      <div>
        <label htmlFor="r-nombre" className="form-label">Nombre del huésped</label>
        <input id="r-nombre" className="form-control" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
      </div>

      {personal && (
        <div>
          <label htmlFor="r-doc" className="form-label">Documento del huésped</label>
          <input id="r-doc" className="form-control" placeholder="Ej: 12.345.678-9" value={guestId} onChange={(e) => setGuestId(e.target.value)} required />
          <p className="form-text m-0 mt-1">Identifica al huésped en sus reservas y avisos.</p>
        </div>
      )}

      {unit ? (
        <p className="m-0 as-muted">
          {unit.name} · {tipoLabel(unit.type)} en {unit.location} · {formatoPrecio(unit.pricePerNight)} / noche
        </p>
      ) : (
        <div>
          <label htmlFor="r-unidad" className="form-label">Unidad</label>
          <select id="r-unidad" className="form-select" value={unitId} onChange={(e) => setUnitId(e.target.value)} required>
            <option value="">Elige una unidad</option>
            {unidades.map((u) => (
              <option key={u.id} value={u.id}>{u.name} · {u.location}</option>
            ))}
          </select>
        </div>
      )}

      <div className="row g-3">
        <div className="col-sm-6">
          <label htmlFor="r-in" className="form-label">Llegada (check-in)</label>
          <input id="r-in" type="date" className="form-control" value={checkIn} min={hoyISO()} onChange={(e) => cambiarEntrada(e.target.value)} required />
        </div>
        <div className="col-sm-6">
          <label htmlFor="r-out" className="form-label">Salida (check-out)</label>
          <input id="r-out" type="date" className="form-control" value={checkOut} min={sumarDias(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} required />
        </div>
      </div>

      {unidad && (
        <p className="m-0 px-3 py-2 rounded-3 fw-semibold" style={{ background: "var(--as-ground)" }}>
          {unidad.availableSlots > 0
            ? `Quedan ${unidad.availableSlots} de ${unidad.totalSlots} cupos en esta unidad.`
            : "Esta unidad no tiene cupos libres por ahora."}
        </p>
      )}

      {total > 0 && (
        <dl className="m-0 d-grid gap-1 pt-3 border-top" style={{ gridTemplateColumns: "1fr auto" }}>
          <dt className="fw-normal as-muted">{formatoPrecio(unidad.pricePerNight)} × {n} {n === 1 ? "noche" : "noches"}</dt>
          <dd className="m-0 text-end">{formatoPrecio(total)}</dd>
          <dt className="fs-5">Total</dt>
          <dd className="m-0 text-end fs-5 fw-bold">{formatoPrecio(total)}</dd>
        </dl>
      )}

      <div className="d-flex flex-wrap justify-content-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={saving}>Cancelar</button>
        )}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? "Reservando..." : "Confirmar reserva"}
        </button>
      </div>
    </form>
  );
}
