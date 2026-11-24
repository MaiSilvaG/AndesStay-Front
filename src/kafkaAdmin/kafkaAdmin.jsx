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
import { API, useApi } from '../useApi';

const API_URL = `${API}/kafka`;
const POLL_MS = 10000;

const TOPICO_INICIAL = { name: '', partitions: 3, replicationFactor: 3, cleanupPolicy: 'delete', retentionMs: '' };
const RESET_INICIAL = { topic: '', to: 'EARLIEST', datetime: '' };

// Ayuda corta para cada configuración editable (misma lista blanca que el back)
const AYUDA_CONFIG = {
  'cleanup.policy': 'delete = borra por tiempo/tamaño · compact = deja el último valor por clave',
  'retention.ms': 'Cuánto se guardan los mensajes (ms). -1 = sin límite',
  'retention.bytes': 'Tamaño máximo por partición antes de borrar. -1 = sin límite',
  'segment.ms': 'Cada cuánto se cierra un segmento (la retención/compactación actúa sobre segmentos cerrados)',
  'min.insync.replicas': 'Réplicas que deben confirmar con acks=all',
  'max.message.bytes': 'Tamaño máximo de un lote de mensajes',
  'compression.type': 'producer = respeta la compresión del productor',
};

const DIA_MS = 86400000;
const formatMs = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return v === '-1' ? 'sin límite' : null;
  if (n % DIA_MS === 0) return `${n / DIA_MS} d`;
  if (n % 3600000 === 0) return `${n / 3600000} h`;
  return null;
};

const describirError = (err) => {
  const campos = err?.data?.errors;
  if (campos && Object.keys(campos).length > 0) {
    return `${err.message}: ${Object.entries(campos)
      .map(([campo, msg]) => `${campo} → ${msg}`)
      .join(' · ')}`;
  }
  return err?.message ?? 'Error desconocido';
};

function MetricCard({ titulo, valor, variante, detalle }) {
  return (
    <div className="as-stat h-100" style={variante ? { background: '#f5d9cc', color: '#7c3418' } : undefined}>
      <p className="m-0">{titulo}</p>
      <p className="as-stat-value" style={{ color: 'inherit' }}>{valor ?? '—'}</p>
      {detalle && <p className="m-0 mt-2 small">{detalle}</p>}
    </div>
  );
}

function Candado({ protegido }) {
  if (!protegido) return null;
  return <span title="Tópico del sistema: no se puede eliminar ni reparticionar" className="me-1">🔒</span>;
}

const colorEstado = (s) => (s === 'STABLE' ? 'success' : s === 'EMPTY' ? 'secondary' : 'warning');

// Página de administración de Kafka (solo Admin): tópicos, configuración y
// consumer groups vía ms-andesstay-kafka-admin.
export default function KafkaAdmin() {
  const { fetchWithToken } = useApi();

  const [cluster, setCluster] = useState(null);
  const [topics, setTopics] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const [tab, setTab] = useState('topicos');
  const [topico, setTopico] = useState(TOPICO_INICIAL);
  const [detalleTopico, setDetalleTopico] = useState(null);
  const [configs, setConfigs] = useState({});
  const [particiones, setParticiones] = useState('');
  const [detalleGrupo, setDetalleGrupo] = useState(null);
  const [reset, setReset] = useState(RESET_INICIAL);

  const cargarRef = useRef(() => {});

  useEffect(() => {
    let activo = true;
    const cargar = async () => {
      const [cl, ts, gs] = await Promise.allSettled([
        fetchWithToken(`${API_URL}/cluster`),
        fetchWithToken(`${API_URL}/topics`),
        fetchWithToken(`${API_URL}/groups`),
      ]);
      if (!activo) return;
      if (cl.status === 'fulfilled') setCluster(cl.value);
      if (ts.status === 'fulfilled') setTopics(Array.isArray(ts.value) ? ts.value : []);
      if (gs.status === 'fulfilled') setGroups(Array.isArray(gs.value) ? gs.value : []);
      const fallo = [cl, ts, gs].find((r) => r.status === 'rejected');
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

  const ejecutar = async (operacion, textoOk, alTerminar) => {
    setEnviando(true);
    setMensaje(null);
    try {
      const res = await operacion();
      setMensaje({ variant: 'success', text: textoOk });
      alTerminar?.(res);
      await cargarRef.current();
    } catch (err) {
      console.error('Error en operación de Kafka:', err);
      setMensaje({ variant: 'danger', text: describirError(err) });
    } finally {
      setEnviando(false);
    }
  };

  const enviarJson = (url, method, body) => fetchWithToken(url, { method, body: JSON.stringify(body) });
  const url = (...partes) => `${API_URL}/${partes.map(encodeURIComponent).join('/')}`;

  const mostrarTopico = (t) => {
    setDetalleTopico(t);
    setConfigs(Object.fromEntries(t.configs.map((c) => [c.name, c.value ?? ''])));
    setParticiones(String(t.partitions.length));
  };

  const abrirTopico = (name) =>
    fetchWithToken(url('topics', name))
      .then(mostrarTopico)
      .catch((err) => setMensaje({ variant: 'danger', text: describirError(err) }));

  const abrirGrupo = (groupId) =>
    fetchWithToken(url('groups', groupId))
      .then((g) => {
        setDetalleGrupo(g);
        setReset({ ...RESET_INICIAL, topic: g.offsets[0]?.topic ?? '' });
      })
      .catch((err) => setMensaje({ variant: 'danger', text: describirError(err) }));

  const crearTopico = (e) => {
    e.preventDefault();
    const configs = { 'cleanup.policy': topico.cleanupPolicy };
    if (topico.retentionMs !== '') configs['retention.ms'] = topico.retentionMs;
    const name = topico.name.trim();
    ejecutar(
      () =>
        enviarJson(`${API_URL}/topics`, 'POST', {
          name,
          partitions: Number(topico.partitions),
          replicationFactor: Number(topico.replicationFactor),
          configs,
        }),
      `Tópico '${name}' creado.`,
      (t) => {
        setTopico(TOPICO_INICIAL);
        mostrarTopico(t);
      }
    );
  };

  const guardarConfigs = (e) => {
    e.preventDefault();
    // Solo se envía lo que cambió; un valor vacío vuelve al default del broker
    const original = Object.fromEntries(detalleTopico.configs.map((c) => [c.name, c.value ?? '']));
    const cambios = Object.fromEntries(Object.entries(configs).filter(([k, v]) => v !== original[k]));
    if (Object.keys(cambios).length === 0) {
      setMensaje({ variant: 'info', text: 'No hay cambios en la configuración.' });
      return;
    }
    ejecutar(
      () => enviarJson(url('topics', detalleTopico.name, 'configs'), 'PUT', { configs: cambios }),
      `Configuración de '${detalleTopico.name}' actualizada: ${Object.keys(cambios).join(', ')}.`,
      mostrarTopico
    );
  };

  const aumentarParticiones = (e) => {
    e.preventDefault();
    ejecutar(
      () =>
        enviarJson(url('topics', detalleTopico.name, 'partitions'), 'POST', {
          totalPartitions: Number(particiones),
        }),
      `'${detalleTopico.name}' ahora tiene ${particiones} particiones.`,
      mostrarTopico
    );
  };

  const eliminarTopico = (name) => {
    if (!window.confirm(`¿Eliminar el tópico '${name}'? Se pierden todos sus mensajes.`)) return;
    ejecutar(
      () => fetchWithToken(url('topics', name), { method: 'DELETE' }),
      `Tópico '${name}' eliminado.`,
      () => setDetalleTopico((d) => (d?.name === name ? null : d))
    );
  };

  const resetearOffsets = (e) => {
    e.preventDefault();
    const { groupId } = detalleGrupo;
    const destino = reset.to === 'DATETIME' ? new Date(reset.datetime).toLocaleString('es-CL') : reset.to.toLowerCase();
    if (!window.confirm(`¿Mover los offsets de '${groupId}' en '${reset.topic}' a ${destino}? El grupo reprocesará o saltará mensajes.`)) return;
    ejecutar(
      () =>
        enviarJson(url('groups', groupId, 'reset-offsets'), 'POST', {
          topic: reset.topic,
          to: reset.to,
          datetime: reset.to === 'DATETIME' && reset.datetime ? new Date(reset.datetime).toISOString() : null,
        }),
      `Offsets de '${groupId}' en '${reset.topic}' movidos a ${destino}. Al reiniciar el micro consumirá desde ahí.`,
      () => abrirGrupo(groupId)
    );
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando el estado de Kafka...</p>
      </div>
    );
  }

  const lagTotal = groups.reduce((s, g) => s + g.totalLag, 0);
  const visibles = topics.filter((t) => !t.internal);

  return (
    <main className="as-page">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 pb-3 mb-4 border-bottom">
        <div>
          <h1 className="as-page-title">Kafka</h1>
          <small className="text-muted">
            Se actualiza cada {POLL_MS / 1000} s
            {lastUpdate && ` · última actualización ${lastUpdate.toLocaleTimeString('es-CL')}`}
          </small>
        </div>
        <Button variant="outline-secondary" onClick={() => cargarRef.current()}>
          Actualizar
        </Button>
      </div>

      {loadError && <Alert variant="warning">No se pudo cargar toda la información: {loadError}</Alert>}
      {mensaje && (
        <Alert variant={mensaje.variant} dismissible onClose={() => setMensaje(null)}>
          {mensaje.text}
        </Alert>
      )}

      {cluster?.brokers?.length > 0 && (
        <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
          <span className="fw-semibold">Clúster ({cluster.brokers.length} brokers):</span>
          {cluster.brokers.map((b) => (
            <Badge key={b.id} bg={b.controller ? 'primary' : 'success'} className="p-2" title={b.controller ? 'Controlador' : undefined}>
              ● {b.id} · {b.host}:{b.port}{b.controller ? ' (controlador)' : ''}
            </Badge>
          ))}
        </div>
      )}

      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <MetricCard titulo="Brokers" valor={cluster?.brokers?.length} detalle="Nodos del clúster" />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard titulo="Tópicos" valor={visibles.length} detalle="Sin contar los internos" />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard titulo="Consumer groups" valor={groups.length} detalle="Grupos registrados" />
        </Col>
        <Col xs={6} lg={3}>
          <MetricCard
            titulo="Lag total"
            valor={lagTotal}
            variante={lagTotal > 0 ? 'danger' : undefined}
            detalle={lagTotal > 0 ? 'Mensajes sin consumir' : 'Todo consumido'}
          />
        </Col>
      </Row>

      <Tabs activeKey={tab} onSelect={(k) => setTab(k)} className="mb-3">
        {/* ---------------- Tópicos ---------------- */}
        <Tab eventKey="topicos" title={`Tópicos (${visibles.length})`}>
          <Card className="shadow-sm border-0 mb-3">
            <Card.Body>
              <Card.Title className="h6">Crear tópico</Card.Title>
              <Form onSubmit={crearTopico}>
                <Row className="g-2 align-items-end">
                  <Col md={4}>
                    <Form.Label className="small mb-1">Nombre</Form.Label>
                    <Form.Control
                      placeholder="demo.eventos"
                      value={topico.name}
                      onChange={(e) => setTopico({ ...topico, name: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Particiones</Form.Label>
                    <Form.Control
                      type="number" min={1} max={50}
                      value={topico.partitions}
                      onChange={(e) => setTopico({ ...topico, partitions: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Réplicas</Form.Label>
                    <Form.Control
                      type="number" min={1} max={3}
                      value={topico.replicationFactor}
                      onChange={(e) => setTopico({ ...topico, replicationFactor: e.target.value })}
                    />
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Cleanup</Form.Label>
                    <Form.Select
                      value={topico.cleanupPolicy}
                      onChange={(e) => setTopico({ ...topico, cleanupPolicy: e.target.value })}
                    >
                      <option value="delete">delete</option>
                      <option value="compact">compact</option>
                    </Form.Select>
                  </Col>
                  <Col xs={6} md={2}>
                    <Form.Label className="small mb-1">Retención (ms)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="604800000"
                      value={topico.retentionMs}
                      onChange={(e) => setTopico({ ...topico, retentionMs: e.target.value })}
                    />
                  </Col>
                  <Col xs="auto" className="ms-auto">
                    <Button type="submit" disabled={enviando}>
                      {enviando ? 'Creando...' : 'Crear tópico'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>

          <Table responsive hover className="align-middle as-table-wrap">
            <thead className="table-light">
              <tr>
                <th>Tópico</th>
                <th className="text-end">Particiones</th>
                <th className="text-end">Réplicas</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {visibles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center text-muted py-3">No hay tópicos.</td>
                </tr>
              ) : (
                visibles.map((t) => (
                  <tr key={t.name} className={detalleTopico?.name === t.name ? 'table-active' : undefined}>
                    <td className="text-nowrap">
                      <Candado protegido={t.protectedTopic} />
                      <code>{t.name}</code>
                      {t.name.endsWith('.DLT') && <Badge bg="secondary" className="ms-2">DLT</Badge>}
                    </td>
                    <td className="text-end">{t.partitions}</td>
                    <td className="text-end">{t.replicationFactor}</td>
                    <td className="text-center text-nowrap">
                      <Button size="sm" variant="outline-primary" className="me-2" onClick={() => abrirTopico(t.name)}>
                        Ver / editar
                      </Button>
                      {t.protectedTopic ? (
                        <span className="small text-muted">Protegido</span>
                      ) : (
                        <Button size="sm" variant="outline-danger" disabled={enviando} onClick={() => eliminarTopico(t.name)}>
                          Eliminar
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {detalleTopico && (
            <Card className="shadow-sm border-0 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title className="h6 m-0">
                    <Candado protegido={detalleTopico.protectedTopic} />
                    <code>{detalleTopico.name}</code>
                  </Card.Title>
                  <Button size="sm" variant="link" onClick={() => setDetalleTopico(null)}>Cerrar</Button>
                </div>

                <Row className="g-4">
                  <Col lg={6}>
                    <h2 className="h6">Configuración</h2>
                    <Form onSubmit={guardarConfigs}>
                      {detalleTopico.configs.map((c) => (
                        <Form.Group key={c.name} className="mb-2">
                          <Form.Label className="small mb-1 d-flex justify-content-between">
                            <code>{c.name}</code>
                            <span className="text-muted">
                              {c.isDefault ? 'default del broker' : 'override del tópico'}
                              {formatMs(configs[c.name]) && c.name.endsWith('.ms') && ` · ${formatMs(configs[c.name])}`}
                            </span>
                          </Form.Label>
                          {c.name === 'cleanup.policy' ? (
                            <Form.Select
                              value={configs[c.name] ?? ''}
                              onChange={(e) => setConfigs({ ...configs, [c.name]: e.target.value })}
                            >
                              <option value="delete">delete</option>
                              <option value="compact">compact</option>
                              <option value="compact,delete">compact,delete</option>
                            </Form.Select>
                          ) : (
                            <Form.Control
                              size="sm"
                              value={configs[c.name] ?? ''}
                              onChange={(e) => setConfigs({ ...configs, [c.name]: e.target.value })}
                            />
                          )}
                          <Form.Text muted>{AYUDA_CONFIG[c.name]}</Form.Text>
                        </Form.Group>
                      ))}
                      <Button type="submit" size="sm" disabled={enviando}>Guardar configuración</Button>
                      {detalleTopico.protectedTopic && (
                        <Form.Text muted className="d-block mt-2">
                          Tópico del sistema: al reiniciar su micro dueño, la configuración vuelve a la definida en el código.
                        </Form.Text>
                      )}
                    </Form>
                  </Col>

                  <Col lg={6}>
                    <h2 className="h6">Particiones ({detalleTopico.partitions.length})</h2>
                    <Table size="sm" responsive className="align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Líder</th>
                          <th>Réplicas</th>
                          <th>ISR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detalleTopico.partitions.map((p) => {
                          const subReplicada = p.isr.length < p.replicas.length;
                          return (
                            <tr key={p.partition} className={subReplicada ? 'table-warning' : undefined}>
                              <td>{p.partition}</td>
                              <td>{p.leader ?? <Badge bg="danger">sin líder</Badge>}</td>
                              <td>{p.replicas.join(', ')}</td>
                              <td title={subReplicada ? 'Hay réplicas fuera de sincronía' : undefined}>{p.isr.join(', ')}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                    {!detalleTopico.protectedTopic && (
                      <Form onSubmit={aumentarParticiones} className="d-flex gap-2 align-items-end">
                        <div>
                          <Form.Label className="small mb-1">Total de particiones</Form.Label>
                          <Form.Control
                            size="sm" type="number"
                            min={detalleTopico.partitions.length + 1} max={50}
                            value={particiones}
                            onChange={(e) => setParticiones(e.target.value)}
                          />
                        </div>
                        <Button type="submit" size="sm" variant="outline-primary" disabled={enviando}>Aumentar</Button>
                      </Form>
                    )}
                    <Form.Text muted>
                      Kafka solo permite aumentar particiones; al hacerlo cambia a qué partición va cada clave.
                    </Form.Text>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </Tab>

        {/* ---------------- Consumer groups ---------------- */}
        <Tab eventKey="grupos" title={`Consumer groups (${groups.length})`}>
          <Table responsive hover className="align-middle as-table-wrap">
            <thead className="table-light">
              <tr>
                <th>Grupo</th>
                <th>Estado</th>
                <th className="text-end">Miembros</th>
                <th className="text-end">Lag</th>
                <th className="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3">No hay consumer groups.</td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.groupId} className={detalleGrupo?.groupId === g.groupId ? 'table-active' : undefined}>
                    <td><code>{g.groupId}</code></td>
                    <td><Badge bg={colorEstado(g.state)}>{g.state}</Badge></td>
                    <td className="text-end">{g.members}</td>
                    <td className="text-end">
                      {g.totalLag > 0 ? <Badge bg="warning" text="dark">{g.totalLag}</Badge> : 0}
                    </td>
                    <td className="text-center">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirGrupo(g.groupId)}>
                        Ver detalle
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          {detalleGrupo && (
            <Card className="shadow-sm border-0 mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <Card.Title className="h6 m-0">
                    <code>{detalleGrupo.groupId}</code>{' '}
                    <Badge bg={colorEstado(detalleGrupo.state)}>{detalleGrupo.state}</Badge>
                  </Card.Title>
                  <Button size="sm" variant="link" onClick={() => setDetalleGrupo(null)}>Cerrar</Button>
                </div>

                <h2 className="h6">Miembros ({detalleGrupo.members.length})</h2>
                {detalleGrupo.members.length === 0 ? (
                  <p className="small text-muted">Sin consumidores conectados.</p>
                ) : (
                  <ul className="small">
                    {detalleGrupo.members.map((m, i) => (
                      <li key={`${m.clientId}-${i}`}>
                        <code>{m.clientId}</code> ({m.host}): {m.assignments.join(', ') || 'sin particiones'}
                      </li>
                    ))}
                  </ul>
                )}

                <h2 className="h6">Offsets y lag por partición</h2>
                <Table size="sm" responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Tópico</th>
                      <th>Partición</th>
                      <th className="text-end">Confirmado</th>
                      <th className="text-end">Fin del log</th>
                      <th className="text-end">Lag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleGrupo.offsets.map((o) => (
                      <tr key={`${o.topic}-${o.partition}`} className={o.lag > 0 ? 'table-warning' : undefined}>
                        <td><code>{o.topic}</code></td>
                        <td>{o.partition}</td>
                        <td className="text-end">{o.committed ?? '—'}</td>
                        <td className="text-end">{o.logEnd}</td>
                        <td className="text-end">{o.lag}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <h2 className="h6 mt-3">Resetear offsets (replay)</h2>
                {detalleGrupo.members.length > 0 && (
                  <Alert variant="info" className="small py-2">
                    El grupo tiene consumidores conectados: detén el micro antes de resetear (Kafka lo rechaza si no).
                  </Alert>
                )}
                <Form onSubmit={resetearOffsets}>
                  <Row className="g-2 align-items-end">
                    <Col md={4}>
                      <Form.Label className="small mb-1">Tópico</Form.Label>
                      <Form.Select value={reset.topic} onChange={(e) => setReset({ ...reset, topic: e.target.value })}>
                        <option value="">Selecciona un tópico</option>
                        {[...new Set([...detalleGrupo.offsets.map((o) => o.topic), ...visibles.map((t) => t.name)])].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Label className="small mb-1">Mover a</Form.Label>
                      <Form.Select value={reset.to} onChange={(e) => setReset({ ...reset, to: e.target.value })}>
                        <option value="EARLIEST">Inicio (reprocesa todo)</option>
                        <option value="LATEST">Final (salta lo pendiente)</option>
                        <option value="DATETIME">Una fecha</option>
                      </Form.Select>
                    </Col>
                    {reset.to === 'DATETIME' && (
                      <Col md={3}>
                        <Form.Label className="small mb-1">Desde</Form.Label>
                        <Form.Control
                          type="datetime-local"
                          value={reset.datetime}
                          onChange={(e) => setReset({ ...reset, datetime: e.target.value })}
                        />
                      </Col>
                    )}
                    <Col xs="auto" className="ms-auto">
                      <Button
                        type="submit"
                        variant="outline-danger"
                        disabled={enviando || !reset.topic || (reset.to === 'DATETIME' && !reset.datetime)}
                      >
                        Resetear offsets
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Tab>
      </Tabs>
    </main>
  );
}
