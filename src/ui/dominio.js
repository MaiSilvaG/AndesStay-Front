import fotoCabana from "../assets/cabaña.jpg";
import fotoHostal from "../assets/habitacion.jpg";

// Estados de reserva (ReservationStatus del back) con su texto para el usuario
export const ESTADOS = {
  CREADA: "Creada",
  CONFIRMADA: "Confirmada",
  CHECKIN_PENDIENTE: "Check-in pendiente",
  EN_ESTADIA: "En estadía",
  CHECKOUT: "Check-out",
  CANCELADA: "Cancelada",
};

// Copia del flujo de ReservationStatus.allowedTransitions() para cuando el back
// aún no envía nextStatus/cancellable. shortcut: borrar cuando el back los envíe siempre.
const SIGUIENTE = {
  CREADA: "CONFIRMADA",
  CONFIRMADA: "CHECKIN_PENDIENTE",
  CHECKIN_PENDIENTE: "EN_ESTADIA",
  EN_ESTADIA: "CHECKOUT",
};
const CANCELABLES = ["CREADA", "CONFIRMADA", "CHECKIN_PENDIENTE"];

// Texto del botón que lleva a cada estado
export const ACCION_HACIA = {
  CONFIRMADA: "Confirmar",
  CHECKIN_PENDIENTE: "Marcar check-in pendiente",
  EN_ESTADIA: "Hacer check-in",
  CHECKOUT: "Hacer check-out",
};

export const siguienteEstado = (r) => r.nextStatus ?? SIGUIENTE[r.status] ?? null;
export const esCancelable = (r) => r.cancellable ?? CANCELABLES.includes(r.status);
export const esActiva = (r) => ["CREADA", "CONFIRMADA", "CHECKIN_PENDIENTE", "EN_ESTADIA"].includes(r.status);

// Tipos de unidad (UnitType del back). El back no guarda fotos: una fija por tipo.
export const TIPOS = {
  CABANA: { label: "Cabaña", foto: fotoCabana },
  LODGE: { label: "Lodge", foto: fotoCabana },
  HOSTAL: { label: "Hostal", foto: fotoHostal },
};
export const tipoLabel = (type) => TIPOS[type]?.label ?? type ?? "";
export const fotoUnidad = (type) => TIPOS[type]?.foto ?? fotoCabana;

export const formatoPrecio = (n) => `$${Number(n ?? 0).toLocaleString("es-CL")}`;

// Acepta camelCase (contrato actual) y snake_case (versiones antiguas del back)
export const normalizarReserva = (r) => ({
  ...r,
  guestId: r.guestId ?? r.guest_id,
  guestName: r.guestName ?? r.guest_name,
  unitId: r.unitId ?? r.unit_id,
  checkInDate: r.checkInDate ?? r.check_in_date,
  checkOutDate: r.checkOutDate ?? r.check_out_date,
});

// Las respuestas de lista a veces vienen envueltas
export const comoLista = (data) =>
  Array.isArray(data) ? data : data?.content ?? data?.data ?? data?.reservations ?? [];
