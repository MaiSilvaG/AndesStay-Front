import { useMemo, useState } from "react";
import { API, useApi } from "../useApi";
import { useUnidades } from "../ui/useUnidades";
import { Cargando, Cupos } from "../ui/componentes";
import { TIPOS, formatoPrecio, fotoUnidad, tipoLabel } from "../ui/dominio";
import CrearUnidad from "./CrearUnidad";
import ReservaModal from "./ReservaModal";
import "./catalog.css";

const FILTROS_INICIALES = { texto: "", tipo: "", ubicacion: "", soloDisponibles: false };

/**
 * Catálogo de unidades. Cliente: tarjetas con filtros al costado.
 * Personal (`personal`): tabla, más el panel para crear unidades.
 */
export default function Catalog({ personal = false }) {
  const { fetchWithToken } = useApi();
  const { unidades, cargando, error, recargar } = useUnidades();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [reservando, setReservando] = useState(null);
  const [creando, setCreando] = useState(false);

  const ubicaciones = useMemo(
    () => [...new Set(unidades.map((u) => u.location).filter(Boolean))].sort(),
    [unidades]
  );

  const visibles = useMemo(() => {
    const texto = filtros.texto.trim().toLowerCase();
    return unidades.filter(
      (u) =>
        (!texto || u.name?.toLowerCase().includes(texto)) &&
        (!filtros.tipo || u.type === filtros.tipo) &&
        (!filtros.ubicacion || u.location === filtros.ubicacion) &&
        (!filtros.soloDisponibles || u.availableSlots > 0)
    );
  }, [unidades, filtros]);

  const setFiltro = (campo, valor) => setFiltros((prev) => ({ ...prev, [campo]: valor }));
  const hayFiltros = JSON.stringify(filtros) !== JSON.stringify(FILTROS_INICIALES);

  const crearUnidad = async (unidad) => {
    await fetchWithToken(`${API}/units`, { method: "POST", body: JSON.stringify(unidad) });
    await recargar();
    setCreando(false);
  };

  const filtrosUI = (
    <section aria-label="Filtros" className={`as-surface catalogo-filtros ${personal ? "en-fila" : "en-columna"}`}>
      <div className="filtro-buscar">
        <label htmlFor="f-buscar" className="form-label">Buscar por nombre</label>
        <input id="f-buscar" type="search" className="form-control" placeholder="Ej: Cabaña Cóndor"
          value={filtros.texto} onChange={(e) => setFiltro("texto", e.target.value)} />
      </div>
      <fieldset>
        <legend className="form-label">Tipo</legend>
        <div className="d-flex flex-wrap gap-2">
          {[["", "Todos"], ...Object.entries(TIPOS).map(([k, v]) => [k, v.label])].map(([valor, label]) => (
            <button key={valor} type="button" aria-pressed={filtros.tipo === valor}
              className={`as-chip ${filtros.tipo === valor ? "is-on" : ""}`} onClick={() => setFiltro("tipo", valor)}>
              {label}
            </button>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="f-ubic" className="form-label">Ubicación</label>
        <select id="f-ubic" className="form-select" value={filtros.ubicacion} onChange={(e) => setFiltro("ubicacion", e.target.value)}>
          <option value="">Todas</option>
          {ubicaciones.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <div className="form-check d-flex align-items-center gap-2 m-0">
        <input id="f-cupos" type="checkbox" className="form-check-input m-0" checked={filtros.soloDisponibles}
          onChange={(e) => setFiltro("soloDisponibles", e.target.checked)} />
        <label htmlFor="f-cupos" className="form-check-label">Solo con cupos disponibles</label>
      </div>
      <button type="button" className="btn btn-outline-secondary" disabled={!hayFiltros} onClick={() => setFiltros(FILTROS_INICIALES)}>
        Limpiar filtros
      </button>
    </section>
  );

  const reservarBtn = (u, clase) => (
    <button type="button" className={`btn btn-primary ${clase}`} disabled={!(u.availableSlots > 0)} onClick={() => setReservando(u)}>
      {u.availableSlots > 0 ? "Reservar" : "Sin cupos"}
    </button>
  );

  const resultado = cargando ? (
    <Cargando texto="Cargando catálogo..." />
  ) : error ? (
    <div className="alert alert-danger" role="alert">{error}</div>
  ) : visibles.length === 0 ? (
    <div className="as-surface as-empty">
      {unidades.length === 0 ? "Todavía no hay unidades en el catálogo." : "Ninguna unidad coincide con los filtros."}
    </div>
  ) : personal ? (
    <div className="as-table-wrap">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col">Unidad</th>
              <th scope="col">Tipo</th>
              <th scope="col" className="text-end">Tarifa / noche</th>
              <th scope="col" style={{ width: 200 }}>Cupos libres</th>
              <th scope="col" className="text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <img src={fotoUnidad(u.type)} alt="" width="56" height="44" className="rounded-3 object-fit-cover" />
                    <div><strong className="fw-semibold">{u.name}</strong><br /><span className="small as-muted">{u.location}</span></div>
                  </div>
                </td>
                <td>{tipoLabel(u.type)}</td>
                <td className="text-end">{formatoPrecio(u.pricePerNight)}</td>
                <td><Cupos unit={u} /></td>
                <td className="text-end">{reservarBtn(u, "btn-sm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : (
    <div className="as-grid-cards">
      {visibles.map((u) => (
        <article key={u.id} className="as-unit-card">
          <div className="position-relative">
            <img src={fotoUnidad(u.type)} alt="" />
            <span className="as-pill unidad-tipo">{tipoLabel(u.type)}</span>
          </div>
          <div className="as-unit-body">
            <h2 className="as-unit-name">{u.name}</h2>
            <p className="m-0 as-muted">{u.location}</p>
            <div className="mt-2"><Cupos unit={u} /></div>
            <div className="d-flex align-items-center justify-content-between gap-2 mt-auto pt-3">
              <p className="as-price"><strong>{formatoPrecio(u.pricePerNight)}</strong> / noche</p>
              {reservarBtn(u, "")}
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <main className="as-page">
      <div className="as-page-head">
        <div>
          <h1 className="as-page-title">{personal ? "Catálogo de unidades" : "¿Dónde te quedas esta vez?"}</h1>
          <p className="as-page-lead">
            {personal
              ? `${unidades.length} unidades activas.`
              : "Cabañas, lodges y hostales en la cordillera. Elige una y reserva tus fechas."}
          </p>
        </div>
        {personal && !creando && (
          <button type="button" className="btn btn-primary" onClick={() => setCreando(true)}>Crear unidad</button>
        )}
      </div>

      {personal ? (
        <>
          {filtrosUI}
          <div className="catalogo-cuerpo">
            <section aria-label="Unidades" className="catalogo-lista">{resultado}</section>
            {creando && <CrearUnidad onClose={() => setCreando(false)} onSubmit={crearUnidad} />}
          </div>
        </>
      ) : (
        <div className="catalogo-cuerpo">
          {filtrosUI}
          <section aria-label="Unidades" className="catalogo-lista">
            {!cargando && <p className="as-muted mb-3">Mostrando <strong>{visibles.length}</strong> de {unidades.length} unidades</p>}
            {resultado}
          </section>
        </div>
      )}

      <ReservaModal unit={reservando} personal={personal} onClose={() => setReservando(null)} onCreated={recargar} />
    </main>
  );
}
