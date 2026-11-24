import { Link, useNavigate } from 'react-router-dom';
import { useUserRoles } from '../useUserRoles';
import { useUnidades } from '../ui/useUnidades';
import { Cargando } from '../ui/componentes';
import ReservaForm from './ReservaForm';
import './reservas.css';

export default function Formulario() {
  const navigate = useNavigate();
  const roles = useUserRoles();
  const personal = roles.includes('Admin') || roles.includes('Recepcionista');
  const { unidades, cargando, error } = useUnidades();
  const volver = personal ? '/reservasEditar' : '/reservasCliente';

  return (
    <main className="as-page" style={{ maxWidth: 820 }}>
      <Link to={volver} className="fw-semibold text-decoration-none">← Volver a las reservas</Link>
      <h1 className="as-page-title">{personal ? 'Nueva reserva' : 'Reserva tus fechas'}</h1>

      <div className="as-surface nueva-reserva-form">
        {cargando ? (
          <Cargando texto="Cargando unidades..." />
        ) : error ? (
          <div className="alert alert-danger m-0" role="alert">{error}</div>
        ) : (
          <ReservaForm
            unidades={unidades}
            personal={personal}
            onCancel={() => navigate(volver)}
            onCreated={() => navigate(volver)}
          />
        )}
      </div>
    </main>
  );
}
