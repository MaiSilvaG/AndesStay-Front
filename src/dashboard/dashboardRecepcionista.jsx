import React, { useState, useEffect } from "react";
import {Container, Row, Col, Card, Table, Badge, Spinner, Alert,} from "react-bootstrap";
import { useApi } from "../useApi";
import './dashboard.css';

const formatDate = (value) => {
  if (!value) return "N/A";
  const [y, m, d] = String(value).slice(0, 10).split("-");
  return y && m && d ? `${d}-${m}-${y}` : "N/A";
};

const normalizeReserva = (r) => ({
  id: r.id,
  guest_id: r.guest_id ?? r.guestId,
  guest_name: r.guest_name ?? r.guestName,
  unit_id: r.unit_id ?? r.unitId,
  check_in_date: r.check_in_date ?? r.checkInDate,
  check_out_date: r.check_out_date ?? r.checkOutDate,
  status: r.status,
});

const getBadgeVariant = (status) => {
  switch (status) {
    case "EN_ESTADIA":
      return "success";
    case "CHECKOUT":
      return "danger";
    default:
      return "secondary";
  }
};

export default function RecepcionistaDashboard() {
  const { fetchWithToken } = useApi();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_API_URL?.endsWith("/")
      ? import.meta.env.VITE_API_URL
      : `${import.meta.env.VITE_API_URL}/`;

    const API_URL = `${baseUrl}api/reservations`;

    fetchWithToken(API_URL)
      .then((data) => {
        const rawList = Array.isArray(data)
          ? data
          : (data?.reservations ?? data?.data ?? data?.content ?? []);

        const normalizedList = rawList.filter(Boolean).map(normalizeReserva);

        const reservasRecepcion = normalizedList.filter(
          (r) => r.status === "EN_ESTADIA" || r.status === "CHECKOUT"
        );
        setReservas(reservasRecepcion);
      })
      .catch((err) => {
        console.error("Error al obtener las reservas:", err);
        setErrorMsg("No se pudieron cargar las reservas.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const enEstadiaCount = reservas.filter((r) => r.status === "EN_ESTADIA").length;
  const checkoutCount = reservas.filter((r) => r.status === "CHECKOUT").length;

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-medium">Cargando reservas de recepción...</p>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <div className="mb-4">
        <h2>Dashboard</h2>
      </div>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Row className="g-4 mb-4">
        <Col sm={12} md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-success">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">
                Reservas Activas
              </Card.Subtitle>
              <Card.Title className="fs-2 fw-bold m-0 text-success">
                {enEstadiaCount}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={12} md={6}>
          <Card className="border-0 shadow-sm border-start border-4 border-danger">
            <Card.Body>
              <Card.Subtitle className="text-muted mb-2">
                Check-Out
              </Card.Subtitle>
              <Card.Title className="fs-2 fw-bold m-0 text-danger">
                {checkoutCount}
              </Card.Title>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* tabla reservas filtrada*/}
      <Card className="border-0">
        <Card.Header className="bg-white py-3">
          <h5 className="m-0 font-weight-bold">
            Reservas Activas y Check-Out ({reservas.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <Table bordered hover responsive className="m-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>ID Huésped</th>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th className="text-center">Estado</th>
              </tr>
            </thead>
            <tbody>
              {reservas.length > 0 ? (
                reservas.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>#{item.id}</strong>
                    </td>
                    <td>
                      <code>{item.guest_id ?? "N/A"}</code>
                    </td>
                    <td>{item.guest_name ?? "N/A"}</td>
                    <td>Unidad #{item.unit_id ?? "N/A"}</td>
                    <td>{formatDate(item.check_in_date)}</td>
                    <td>{formatDate(item.check_out_date)}</td>
                    <td className="text-center">
                      <Badge
                        bg={getBadgeVariant(item.status)}
                        className="rounded-pill px-3 py-2 text-uppercase"
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No hay reservas activas en estadia ni en check-out actualmente.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}