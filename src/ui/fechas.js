// Fechas YYYY-MM-DD en hora LOCAL. No usar toISOString(): en Chile, desde las
// 20-21 h ya devuelve el día siguiente (UTC).

export const aISO = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const hoyISO = () => aISO(new Date());

const desdeISO = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const sumarDias = (iso, n) => {
  const d = desdeISO(iso);
  d.setDate(d.getDate() + n);
  return aISO(d);
};

export const noches = (entrada, salida) =>
  entrada && salida ? Math.round((desdeISO(salida) - desdeISO(entrada)) / 86400000) : 0;

// "18 dic 2026"
export const fechaCorta = (iso) =>
  iso
    ? desdeISO(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })
    : "—";

// Para Instant (createdAt, occurredAt): "13 nov 2026, 10:24"
export const fechaHora = (instant) => {
  const d = new Date(instant);
  return isNaN(d) ? "—" : d.toLocaleString("es-CL", { dateStyle: "medium", timeStyle: "short" });
};

// Día local de un Instant, para agrupar
export const diaISO = (instant) => {
  const d = new Date(instant);
  return isNaN(d) ? "" : aISO(d);
};
