import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './navbar/navbar';
import Catalog from './catalog/catalog';  
import Dashboard from './dashboard/dashboard';
import Audit from './audit/audit';
import Reports from './reports/reports';
import Login from './login/login';
import Formulario from './reservations/formulario';
import ReservasEditar from './reservations/rerservasEditar';
import ReservasCliente from './reservations/reservasCliente';
import { ProtectedRoute } from './ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        {/* login: publico */}
        <Route path="/login" element={<Login />} />

        {/* dashboard: todos los autenticados*/}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* reservasCliente: vista de Cliente */}
        <Route 
          path="/reservasCliente" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <ReservasCliente />
            </ProtectedRoute>
          } 
        />

        {/* reservasEditar: vista de Recepcionista y Admin */}
        <Route 
          path="/reservasEditar" 
          element={
            <ProtectedRoute allowedRoles={['Recepcionista', 'Admin']}>
              <ReservasEditar />
            </ProtectedRoute>
          } 
        />

        {/* formulario: formulario para crear reservas*/}
        <Route 
          path="/formulario" 
          element={
            <ProtectedRoute allowedRoles={['Cliente', 'Recepcionista', 'Admin']}>
              <Formulario />
            </ProtectedRoute>
          } 
        />

        {/* catalog: Recepcionista y Admin */}
        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute allowedRoles={['Recepcionista', 'Admin']}>
              <Catalog />
            </ProtectedRoute>
          } 
        />

        {/* reports: Admin */}
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Reports />
            </ProtectedRoute>
          } 
        />

        {/* audit: Auditor */}
        <Route 
          path="/audit" 
          element={
            <ProtectedRoute allowedRoles={['Admin', 'Auditor']}>
              <Audit />
            </ProtectedRoute>
          } 
        />

        {/* por defecto */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

{/*dominio tenant: nuevoTenant.onmicrosoft.com
nuevos usuarios:
-recepcion@nuevoTenant.onmicrosoft.com -nombre:recepcion -contraseña: Lara928646 
-cliente1@nuevoTenant.onmicrosoft.com -nombre:cliente1 -contraseña: Lodo344245
-auditor@nuevoTenant.onmicrosoft.com -nombre:auditor -contraseña: Goha885056

  */}