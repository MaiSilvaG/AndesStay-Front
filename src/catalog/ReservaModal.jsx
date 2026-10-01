import { useEffect, useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { useMsal } from "@azure/msal-react";
import { useApi } from "../useApi";

const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const RESERVATIONS_URL = `${baseUrl}api/reservations`;

export const toISODate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const addDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  return toISODate(new Date(y, m - 1, d + n));
};

export default function ReservaModal({ show, onClose, onCreated, unit, checkInDate }) {
  const { instance, accounts } = useMsal();
  const account = instance.getActiveAccount() ?? accounts[0];
  const { fetchWithToken } = useApi();

  const [guestName, setGuestName] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!show) return;
    const inicio = checkInDate || toISODate(new Date());
    setGuestName(account?.name ?? "");
    setCheckIn(inicio);
    setCheckOut(addDays(inicio, 1));
    setError("");
  }, [show, checkInDate, unit?.id]);

  const handleCheckIn = (valor) => {
    setCheckIn(valor);
    if (valor && checkOut <= valor) setCheckOut(addDays(valor, 1));
  };

  const noches =
    checkIn && checkOut
      ? Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000)
      : 0;
  const total = noches > 0 ? noches * Number(unit?.pricePerNight ?? 0) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!unit) return;
    if (!guestName.trim()) return setError("Ingresa el nombre del huésped.");
    if (checkOut <= checkIn)
      return setError("La salida debe ser posterior a la entrada.");

    setSaving(true);
    setError("");
    try {
      await fetchWithToken(RESERVATIONS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId: account?.localAccountId,
          guestName: guestName.trim(),
          unitId: unit.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
        }),
      });
      onCreated?.();
      onClose();
    } catch (err) {
      console.error("Error creando reserva:", err);
      setError("No se pudo crear la reserva. Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={saving ? undefined : onClose} centered>
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton={!saving}>
          <Modal.Title className="h5">Reservar hora</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Unidad</Form.Label>
            <Form.Control value={unit?.name ?? ""} readOnly disabled />
            {unit && (
              <Form.Text className="text-muted">
                {unit.location} · ${Number(unit.pricePerNight).toLocaleString("es-CL")} / noche
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre del huésped</Form.Label>
            <Form.Control
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              required
            />
          </Form.Group>

          <div className="row g-3">
            <Form.Group className="col-6">
              <Form.Label>Entrada</Form.Label>
              <Form.Control
                type="date"
                value={checkIn}
                min={toISODate(new Date())}
                onChange={(e) => handleCheckIn(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="col-6">
              <Form.Label>Salida</Form.Label>
              <Form.Control
                type="date"
                value={checkOut}
                min={checkIn ? addDays(checkIn, 1) : undefined}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </Form.Group>
          </div>

          {total > 0 && (
            <p className="mt-3 mb-0 small">
              {noches} {noches === 1 ? "noche" : "noches"} ·{" "}
              <strong>Total: ${total.toLocaleString("es-CL")}</strong>
            </p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={saving || !unit}>
            {saving ? "Reservando..." : "Confirmar reserva"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}