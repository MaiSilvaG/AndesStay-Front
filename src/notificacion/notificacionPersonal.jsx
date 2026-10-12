import React, { useState, useEffect, useCallback } from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';
import { useApi } from '../useApi';

const baseUrl = import.meta.env.VITE_API_URL?.endsWith('/')
  ? import.meta.env.VITE_API_URL
  : `${import.meta.env.VITE_API_URL}/`;

const API_URL = `${baseUrl}api/notifications`;
const POLL_MS = 30000;

const tieneVoucher = (notif) =>
  !!notif.reservationId &&
  (notif.type === 'notification.confirmed' ||
    notif.type === 'voucher.gen' ||
    notif.type?.includes('voucher') ||
    notif.type?.startsWith('housekeeping.prepare'));

export default function NotificacionPersonal() {
  const { fetchWithToken } = useApi();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchNotificaciones = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setLoading(true);
        setErrorMsg('');

        const data = await fetchWithToken(API_URL);
        const list = Array.isArray(data)
          ? data
          : (data?.notifications ?? data?.data ?? []);

        setNotificaciones(list);
      } catch (err) {
        console.error('Error al cargar notificaciones:', err);
        if (showLoading) {
          setErrorMsg('No se pudo conectar con el servicio de notificaciones.');
          setNotificaciones([]);
        }
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [fetchWithToken]
  );

  useEffect(() => {
    fetchNotificaciones(true);
    const id = setInterval(() => fetchNotificaciones(false), POLL_MS);
    return () => clearInterval(id);
  }, []);

  const marcarComoLeida = async (id) => {
    try {
      await fetchWithToken(`${API_URL}/${id}/read`, { method: 'PATCH' });
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      setErrorMsg('No se pudo marcar el aviso como leído.');
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      await fetchWithToken(`${API_URL}/read-all`, { method: 'PATCH' });
      setNotificaciones((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      setErrorMsg('No se pudieron marcar todos los avisos como leídos.');
    }
  };

  const descargarVoucher = async (reservationId) => {
    if (!reservationId) {
      console.error('ID de reserva no válido para descargar el voucher.');
      return;
    }

    try {
      const blob = await fetchWithToken(`${baseUrl}api/vouchers/${reservationId}`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
        responseType: 'blob'
      });

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `voucher-AS-${String(reservationId).padStart(6, '0')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Error al descargar el voucher:', err);
      setErrorMsg('No se pudo descargar el voucher. Intenta nuevamente.');
    }
  };

  const sinLeerCount = notificaciones.filter((n) => !n.read).length;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center pb-3 mb-4 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <h1 className="mb-0">Mis Notificaciones</h1>
          {sinLeerCount > 0 && (
            <Badge bg="primary" pill className="fs-6">
              {sinLeerCount} nueva(s)
            </Badge>
          )}
        </div>
        {sinLeerCount > 0 && (
          <Button variant="outline-primary" size="sm" onClick={marcarTodasComoLeidas}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {errorMsg && (
        <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      )}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando notificaciones...</p>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="text-center py-5 bg-light rounded border">
          <p className="text-muted mb-0">No tienes notificaciones registradas.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notificaciones.map((notif) => {
            const conVoucher = tieneVoucher(notif);

            return (
              <Card
                key={notif.id}
                onClick={() => !notif.read && marcarComoLeida(notif.id)}
                className={`shadow-sm ${!notif.read ? 'border-primary bg-light' : 'border-light-subtle'}`}
                style={{ cursor: !notif.read ? 'pointer' : 'default' }}
              >
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs={12} md={conVoucher ? 8 : 12}>
                      <div className="d-flex align-items-center gap-2">
                        <h2 className="h6 card-title mb-1 text-dark">{notif.title}</h2>
                        {!notif.read && (
                          <span
                            className="bg-primary rounded-circle d-inline-block"
                            style={{ width: '8px', height: '8px' }}
                          ></span>
                        )}
                        <Badge bg={notif.audience === 'STAFF' ? 'dark' : 'info'} className="ms-1">
                          {notif.audience === 'STAFF' ? 'Personal' : 'Mi reserva'}
                        </Badge>
                      </div>

                      {notif.message && (
                        <p className="card-text text-secondary small mb-2">{notif.message}</p>
                      )}

                      <div className="d-flex align-items-center gap-3 text-muted small">
                        <span>
                          {new Date(notif.createdAt).toLocaleString('es-ES', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                        {notif.reservationId && (
                          <Badge bg="secondary-subtle" className="text-secondary font-monospace">
                            #{notif.reservationId}
                          </Badge>
                        )}
                      </div>
                    </Col>

                    {conVoucher && (
                      <Col xs={12} md={4} className="d-flex flex-column gap-2 mt-3 mt-md-0">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            descargarVoucher(notif.reservationId);
                          }}
                        >
                          Descargar PDF
                        </Button>
                      </Col>
                    )}
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}