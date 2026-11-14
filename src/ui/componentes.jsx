import { ESTADOS } from "./dominio";

export function EstadoBadge({ status }) {
  return <span className={`as-pill as-estado-${status}`}>{ESTADOS[status] ?? status ?? "—"}</span>;
}

// Barra de proporción con su texto encima. Terracota cuando queda un 25 % o menos.
export function Medidor({ valor, total, texto, color }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, valor / total)) : 0;
  const tono = color ?? (ratio <= 0.25 ? "var(--as-clay-ink)" : "var(--as-forest-ink)");
  return (
    <div className="as-meter">
      <span className="as-meter-label" style={{ color: tono }}>{texto}</span>
      <span className="as-meter-track" aria-hidden="true">
        <span className="as-meter-fill" style={{ width: `${ratio * 100}%`, background: tono }} />
      </span>
    </div>
  );
}

export function Cupos({ unit }) {
  const { availableSlots: libres = 0, totalSlots: total = 0 } = unit;
  const texto =
    libres === 0 ? "Sin cupos" : `${libres === 1 ? "Queda" : "Quedan"} ${libres} de ${total} cupos`;
  return <Medidor valor={libres} total={total} texto={texto} />;
}

export function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="as-empty" role="status">
      <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />
      {texto}
    </div>
  );
}
