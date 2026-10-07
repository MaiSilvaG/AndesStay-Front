import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './navbar/navbar';
import Catalog from './catalog/catalog'; 
import CatalogCliente from './catalog/catalogCliente';
import Dashboard from './dashboard/dashboard';
import RecepcionistaDashboard from './dashboard/dashboardRecepcionista';
import Audit from './audit/audit';
import Login from './login/login';
import Formulario from './reservations/formulario';
import ReservasEditar from './reservations/rerservasEditar';
import ReservasCliente from './reservations/reservasCliente';
import { ProtectedRoute } from './ProtectedRoute';
import { useMsal } from '@azure/msal-react';

function App() {
  const { instance, accounts } = useMsal();

  //obtener la cuenta activa
  const activeAccount = instance.getActiveAccount();
  const guestId =
    activeAccount?.idTokenClaims?.oid ||
    activeAccount?.idTokenClaims?.sub ||
    activeAccount?.localAccountId;

  return (
    <BrowserRouter>
      <Navigation />

      <Routes>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* login: publico */}
        <Route path="/login" element={<Login />} />

        {/* dashboard: admin*/}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        {/* dashboard: recepcionis*/}
        <Route 
          path="/dashboardRecepcionista" 
          element={
            <ProtectedRoute allowedRoles={['Recepcionista']}>
              <RecepcionistaDashboard />
            </ProtectedRoute>
          } 
        />

        {/* reservasCliente: vista de Cliente */}
        <Route 
          path="/reservasCliente" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <ReservasCliente guestIdAuth={guestId}/>
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

        {/* catalog: Recepcionista y Admin  */}
        <Route 
          path="/catalog" 
          element={
            <ProtectedRoute allowedRoles={['Recepcionista', 'Admin']}>
              <Catalog />
            </ProtectedRoute>
          } 
        />

        {/* catalog:  Cliente */}
        <Route 
          path="/catalogCliente" 
          element={
            <ProtectedRoute allowedRoles={['Cliente']}>
              <CatalogCliente/>
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
-admin@nuevoTenant.onmicrosoft.com -nombre:admin -contraseña: Sofa600432 
-recepcion@nuevoTenant.onmicrosoft.com -nombre:recepcion -contraseña: Lara928646 
-cliente1@nuevoTenant.onmicrosoft.com -nombre:cliente1 -contraseña: Lodo344245
-auditor@nuevoTenant.onmicrosoft.com -nombre:auditor -contraseña: Goha885056

  */}