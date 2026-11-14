import { Modal } from "react-bootstrap";
import ReservaForm from "../reservations/ReservaForm";

export default function ReservaModal({ unit, personal, onClose, onCreated }) {
  return (
    <Modal show={!!unit} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title className="h4">Reservar {unit?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {unit && (
          <ReservaForm
            key={unit.id}
            unit={unit}
            personal={personal}
            onCancel={onClose}
            onCreated={() => {
              onCreated?.();
              onClose();
            }}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}
