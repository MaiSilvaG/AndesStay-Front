import { useEffect, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import Tab from 'react-bootstrap/Tab';
import Table from 'react-bootstrap/Table';
import Tabs from 'react-bootstrap/Tabs';
import { useApi } from '../useApi';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/admin`;

// Cada cuánto se refrescan las métricas y los listados
const POLL_MS = 10000;

const COLA_INICIAL = {
  name: '',
  durable: true,
  withDlq: true,
  messageTtlMs: '',
  maxLength: '',
  overflow: '',
};
const EXCHANGE_INICIAL = { name: '', type: 'direct', durable: true };
const BINDING_INICIAL = { exchange: '', queue: '', routingKey: '' };

// "" -> null y números como número (el back valida que sean > 0)
const numeroONull = (valor) => (valor === '' ? null : Number(valor));

const formatTtl = (ms) => {
  if (ms == null) return null;
  return ms % 1000 === 0 ? `${ms / 1000} s` : `${ms} ms`;
};

// Mensaje del back + detalle por campo de un 400 ("errors")
const describirError = (err) => {
  const campos = err?.data?.errors;
  if (campos && Object.keys(campos).length > 0) {
    return `${err.message}: ${Object.entries(campos)
      .map(([campo, msg]) => `${campo} → ${msg}`)
      .join(' · ')}`;
  }
  return err?.message ?? 'Error desconocido';
};

function Candado({ protegido }) {
  if (!protegido) return null;
  return (
    <span title="Recurso protegido de la topología del sistema" className="me-1">
      🔒
    </span>
  );
}

// Botón de eliminar, o "Protegido" si es parte de la topología del sistema
function AccionEliminar({ protegido, deshabilitado, texto = 'Eliminar', onClick }) {
  if (protegido) {
    return (
      <span className="small text-muted" title="Recurso protegido de la topología del sistema">
        Protegido
      </span>
    );
  }
  return (
    <Button size="sm" variant="outline-danger" disabled={deshabilitado} onClick={onClick}>
      {texto}
    </Button>
  );
}

function MetricCard({ titulo, valor, variante, detalle }) {
  return (
    <Card className={`shadow-sm border-0 h-100 ${variante ? `bg-${variante} text-white` : 'bg-light'}`}>
      <Card.Body>
        <div className="small text-uppercase fw-semibold opacity-75">{titulo}</div>
        <div className="display-6 fw-bold">{valor ?? '—'}</div>
        {detalle && <div className="small opacity-75">{detalle}</div>}
      </Card.Body>
    </Card>
  );
}

// Página de administración de RabbitMQ (solo Admin): métricas del clúster y
// creación/eliminación de colas, exchanges y bindings vía ms-andesstay-rabbit-admin.
export default function RabbitAdmin() {
  const { fetchWithToken } = useApi();

  const [overview, setOverview] = useState(null);
  const [queues, setQueues] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [bindings, setBindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [mensaje, setMensaje] = useState(null); // { variant, text }
  const [enviando, setEnviando] = useState(false);

  const [cola, setCola] = useState(COLA_INICIAL);
  const [exchange, setExchange] = useState(EXCHANGE_INICIAL);
  const [binding, setBinding] = useState(BINDING_INICIAL);

  const cargarRef = useRef(() => {});

  useEffect(() => {
    let activo = true;

    const cargar = async () => {
      const [ov, qs, exs, bs] = await Promise.allSettled([
        fetchWithToken(`${API_URL}/overview`),
        fetchWithToken(`${API_URL}/queues`),
        fetchWithToken(`${API_URL}/exchanges`),
        fetchWithToken(`${API_URL}/bindings`),
      ]);
      if (!activo) return;

      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (qs.status === 'fulfilled') setQueues(Array.isArray(qs.value) ? qs.value : []);
      if (exs.status === 'fulfilled') setExchanges(Array.isArray(exs.value) ? exs.value : []);
      if (bs.status === 'fulfilled') setBindings(Array.isArray(bs.value) ? bs.value : []);

      const fallo = [ov, qs, exs, bs].find((r) => r.status === 'rejected');
      setLoadError(fallo ? describirError(fallo.reason) : '');
      setLastUpdate(new Date());
      setLoading(false);
    };

    cargarRef.current = cargar;
    cargar();
    const intervalo = setInterval(cargar, POLL_MS);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  // Ejecuta una operación de escritura, muestra el resultado y refresca
  const ejecutar = async (operacion, textoOk, alTerminar) => {
    setEnviando(true);
    setMensaje(null);
    try {
      await operacion();
      setMensaje({ variant: 'success', text: textoOk });
      alTerminar?.();
      await cargarRef.current();
    } catch (err) {
      console.error('Error en operación de administración:', err);
      setMensaje({ variant: 'danger', text: describirError(err) });
    } finally {
      setEnviando(false);
    }
  };

  const enviarJson = (url, method, body) =>
    fetchWithToken(url, { method, body: JSON.stringify(body) });

  const crearCola = (e) => {
    e.preventDefault();
    ejecutar(
      () =>
        enviarJson(`${API_URL}/queues`, 'POST', {
          name: cola.name.trim(),
          durable: cola.durable,
          withDlq: cola.withDlq,
          messageTtlMs: numeroONull(cola.messageTtlMs),
          maxLength: numeroONull(cola.maxLength),
          overflow: cola.overflow || null,
        }),
      `Cola '${cola.name.trim()}' creada${cola.withDlq ? ` (con su DLQ '${cola.name.trim()}.dlq')` : ''}.`,
      () => setCola(COLA_INICIAL)
    );
  };

  const crearExchange = (e) => {
    e.preventDefault();
    ejecutar(
      () => enviarJson(`${API_URL}/exchanges`, 'POST', { ...exchange, name: exchange.name.trim() }),
      `Exchange '${exchange.name.trim()}' (${exchange.type}) creado.`,
      () => setExchange(EXCHANGE_INICIAL)
    );
  };

  const crearBinding = (e) => {
    e.preventDefault();
    ejecutar(
      () => enviarJson(`${API_URL}/bindings`, 'POST', binding),
      `Binding ${binding.exchange} → ${binding.queue} creado.`,
      () => setBinding(BINDING_INICIAL)
    );
  };

  const eliminarCola = (name) => {
    if (!window.confirm(`¿Eliminar la cola '${name}'? Se pierden sus mensajes.`)) return;
    ejecutar(
      () => fetchWithToken(`${API_URL}/queues/${encodeURIComponent(name)}`, { method: 'DELETE' }),
      `Cola '${name}' eliminada.`
    );
  };

  const eliminarExchange = (name) => {
    if (!window.confirm(`¿Eliminar el exchange '${name}'?`)) return;
    ejecutar(
      () => fetchWithToken(`${API_URL}/exchanges/${encodeURIComponent(name)}`, { method: 'DELETE' }),
      `Exchange '${name}' eliminado.`
    );
  };

  const eliminarBinding = (b) => {
    if (!window.confirm(`¿Quitar el binding ${b.exchange} → ${b.queue} (${b.routingKey || 'sin routing key'})?`)) return;
    ejecutar(
      () =>
        enviarJson(`${API_URL}/bindings`, 'DELETE', {
          exchange: b.exchange,
          queue: b.queue,
          routingKey: b.routingKey ?? '',
        }),
      `Binding ${b.exchange} → ${b.queue} eliminado.`
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando el estado de RabbitMQ...</p>
      </div>
    );
  }

  const nodosArriba = overview?.nodes?.filter((n) => n.running).length ?? 0;
  const dlqConMensajes = (overview?.dlqMessages ?? 0) > 0;

  return (
    <div className="container my-4">
      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-4 border-bottom">
        <div>
          <h1 className="mb-0">Administración RabbitMQ</h1>
          <small className="text-muted">
            Se actualiza cada {POLL_MS / 1000} s
            {lastUpdate && ` · última actualización ${lastUpdate.toLocaleTimeString('es-CL')}`}
          </small>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => cargarRef.current()}>
            Actualizar
          </Button>
          {overview?.managementUrl && (
            <Button
              variant="warning"
              href={overview.managementUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Pide el usuario y la contraseña de RabbitMQ"
            >
              Abrir Management UI ↗
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <Alert variant="warning">
          No se pudo cargar toda la información: {loadError}
        </Alert>
      )}

      {mensaje && (
        <Alert variant={mensaje.variant} dismissible onClose={() => setMensaje(null)}>
          {mensaje.text}
        </Alert>
      )}

      {/* Nodos del clúster */}
      {overview?.nodes?.length > 0 && (
        <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
          <span className="fw-semibold">Clúster ({nodosArriba}/{overview.nodes.length} nodos):</span>
          {overview.nodes.map((n) => (
            <Badge key={n.name} bg={n.running ? 'success' : 'danger'} className="p-2">
              {n.running ? '●' : '○'} {n.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Métricas */}
      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <MetricCard titulo="Colas activas" valor={overview?.activeQueues} detalle="Topología existente" />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard
            titulo="Mensajes pendientes"
            valor={overview?.pendingMessages}
            detalle="Listos + sin confirmar"
          />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard titulo="Consumidores" valor={overview?.consumers} detalle="Conectados a las colas" />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard
            titulo="Mensajes en DLQ"
            valor={overview?.dlqMessages}
            variante={dlqConMensajes ? 'danger' : undefined}
            detalle={dlqConMensajes ? 'Hay mensajes que fallaron' : 'Sin mensajes fallidos'}
          />
        </Col>
      </Row>

      <Tabs defaultActiveKey="colas" className="mb-3">
        {/* ---------------- Colas ---------------- */}
        <Tab eventKey="colas" title={`Colas (${queues.length})`}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <Card.Title className="h6">Crear cola</Card.Title>
              <Form onSubmit={crearCola}>
                <Row className="g-2 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small mb-1">Nombre</Form.Label>
                    <Form.Control
                      placeholder="q.demo.reportes"
                      value={cola.name}
                      onChange={(e) => setCola({ ...cola, name: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">TTL (ms)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="60000"
                      value={cola.messageTtlMs}
                      onChange={(e) => setCola({ ...cola, messageTtlMs: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Largo máximo</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="1000"
                      value={cola.maxLength}
                      onChange={(e) => setCola({ ...cola, maxLength: e.target.value })}
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small mb-1">Al llenarse (overflow)</Form.Label>
                    <Form.Select
                      value={cola.overflow}
                      onChange={(e) => setCola({ ...cola, overflow: e.target.value })}
                    >
                      <option value="">Por defecto (descarta el más antiguo)</option>
                      <option value="drop-head">drop-head: descarta el más antiguo</option>
                      <option value="reject-publish">reject-publish: rechaza lo nuevo</option>
                      <option value="reject-publish-dlx">reject-publish-dlx: lo rechazado va a la DLQ</option>
                    </Form.Select>
                  </Col>
                  <Col xs="auto">
                    <Form.Check
                      id="cola-durable"
                      label="Durable"
                      checked={cola.durable}
                      onChange={(e) => setCola({ ...cola, durable: e.target.checked })}
                    />
                  </Col>
                  <Col xs="auto">
                    <Form.Check
                      id="cola-dlq"
                      label="Crear su DLQ"
                      checked={cola.withDlq}
                      onChange={(e) => setCola({ ...cola, withDlq: e.target.checked })}
                    />
                  </Col>
                  <Col xs="auto" className="ms-auto">
                    <Button type="submit" disabled={enviando}>
                      {enviando ? 'Creando...' : 'Crear cola'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Table responsive hover className="align-middle bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Cola</th>
                <th className="text-end">Listos</th>
                <th className="text-end">Sin confirmar</th>
                <th className="text-end">Consumidores</th>
                <th>DLQ</th>
                <th>Retención</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {queues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-3">No hay colas.</td>
                </tr>
              ) : (
                queues.map((q) => {
                  const sinConsumidor = !q.dlq && q.consumers === 0;
                  const dlqConMsgs = q.dlq && q.messages > 0;
                  const retencion = [
                    formatTtl(q.messageTtlMs) && `TTL ${formatTtl(q.messageTtlMs)}`,
                    q.maxLength != null && `máx ${q.maxLength}`,
                    q.overflow,
                  ].filter(Boolean);
                  return (
                    <tr key={q.name} className={dlqConMsgs ? 'table-danger' : undefined}>
                      <td className="text-nowrap">
                        <Candado protegido={q.protectedResource} />
                        <code>{q.name}</code>
                        {q.dlq && <Badge bg="secondary" className="ms-2">DLQ</Badge>}
                      </td>
                      <td className="text-end">{q.messagesReady}</td>
                      <td className="text-end">{q.messagesUnacknowledged}</td>
                      <td className="text-end">
                        {sinConsumidor ? (
                          <Badge bg="warning" text="dark" title="Nadie está consumiendo esta cola">
                            0
                          </Badge>
                        ) : (
                          q.consumers
                        )}
                      </td>
                      <td className="text-nowrap">{q.deadLetterQueue ? <code className="small">{q.deadLetterQueue}</code> : '—'}</td>
                      <td className="small">{retencion.length > 0 ? retencion.join(' · ') : '—'}</td>
                      <td className="text-center">
                        <AccionEliminar
                          protegido={q.protectedResource}
                          deshabilitado={enviando}
                          onClick={() => eliminarCola(q.name)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Tab>

        {/* ---------------- Exchanges ---------------- */}
        <Tab eventKey="exchanges" title={`Exchanges (${exchanges.length})`}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <Card.Title className="h6">Crear exchange</Card.Title>
              <Form onSubmit={crearExchange}>
                <Row className="g-2 align-items-end">
                  <Col md={5}>
                    <Form.Label className="small mb-1">Nombre</Form.Label>
                    <Form.Control
                      placeholder="ex.demo"
                      value={exchange.name}
                      onChange={(e) => setExchange({ ...exchange, name: e.target.value })}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small mb-1">Tipo</Form.Label>
                    <Form.Select
                      value={exchange.type}
                      onChange={(e) => setExchange({ ...exchange, type: e.target.value })}
                    >
                      <option value="direct">direct (routing key exacta)</option>
                      <option value="topic">topic (patrones * y #)</option>
                      <option value="fanout">fanout (a todas las colas)</option>
                    </Form.Select>
                  </Col>
                  <Col xs="auto">
                    <Form.Check
                      id="exchange-durable"
                      label="Durable"
                      checked={exchange.durable}
                      onChange={(e) => setExchange({ ...exchange, durable: e.target.checked })}
                    />
                  </Col>
                  <Col xs="auto" className="ms-auto">
                    <Button type="submit" disabled={enviando}>
                      {enviando ? 'Creando...' : 'Crear exchange'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Table responsive hover className="align-middle bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Exchange</th>
                <th>Tipo</th>
                <th>Durable</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {exchanges.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">No hay exchanges.</td>
                </tr>
              ) : (
                exchanges.map((x) => (
                  <tr key={x.name}>
                    <td className="text-nowrap">
                      <Candado protegido={x.protectedResource} />
                      <code>{x.name}</code>
                    </td>
                    <td>
                      <Badge bg={x.type === 'topic' ? 'info' : x.type === 'direct' ? 'primary' : 'dark'}>
                        {x.type}
                      </Badge>
                    </td>
                    <td>{x.durable ? 'Sí' : 'No'}</td>
                    <td className="text-center">
                      <AccionEliminar
                        protegido={x.protectedResource}
                        deshabilitado={enviando}
                        onClick={() => eliminarExchange(x.name)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Tab>

        {/* ---------------- Bindings ---------------- */}
        <Tab eventKey="bindings" title={`Bindings (${bindings.length})`}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <Card.Title className="h6">Crear binding</Card.Title>
              <Form onSubmit={crearBinding}>
                <Row className="g-2 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small mb-1">Exchange</Form.Label>
                    <Form.Select
                      value={binding.exchange}
                      onChange={(e) => setBinding({ ...binding, exchange: e.target.value })}
                    >
                      <option value="">Selecciona un exchange</option>
                      {exchanges.map((x) => (
                        <option key={x.name} value={x.name}>
                          {x.name} ({x.type})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small mb-1">Cola</Form.Label>
                    <Form.Select
                      value={binding.queue}
                      onChange={(e) => setBinding({ ...binding, queue: e.target.value })}
                    >
                      <option value="">Selecciona una cola</option>
                      {queues
                        .filter((q) => !q.protectedResource)
                        .map((q) => (
                          <option key={q.name} value={q.name}>
                            {q.name}
                          </option>
                        ))}
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Form.Label className="small mb-1">Routing key</Form.Label>
                    <Form.Control
                      placeholder="reporte.*"
                      value={binding.routingKey}
                      onChange={(e) => setBinding({ ...binding, routingKey: e.target.value })}
                    />
                  </Col>
                  <Col xs="auto" className="ms-auto">
                    <Button type="submit" disabled={enviando}>
                      {enviando ? 'Creando...' : 'Crear binding'}
                    </Button>
                  </Col>
                </Row>
                <Form.Text muted>
                  Solo se listan colas propias: los bindings de las colas del sistema están protegidos.
                </Form.Text>
              </Form>
            </Card.Body>
          </Card>

          <Table responsive hover className="align-middle bg-white shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Exchange</th>
                <th>Routing key</th>
                <th>Cola</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {bindings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">No hay bindings.</td>
                </tr>
              ) : (
                bindings.map((b) => (
                  <tr key={`${b.exchange}|${b.routingKey}|${b.queue}`}>
                    <td><code>{b.exchange}</code></td>
                    <td>{b.routingKey ? <code>{b.routingKey}</code> : <span className="text-muted">(vacía)</span>}</td>
                    <td className="text-nowrap">
                      <Candado protegido={b.protectedResource} />
                      <code>{b.queue}</code>
                    </td>
                    <td className="text-center">
                      <AccionEliminar
                        protegido={b.protectedResource}
                        deshabilitado={enviando}
                        texto="Quitar"
                        onClick={() => eliminarBinding(b)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Tab>
      </Tabs>
    </div>
  );
}
