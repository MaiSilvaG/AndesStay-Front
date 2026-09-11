import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './navbar/navbar'
import Catalog from './catalog/catalog';  
import Dashboard from './dashboard/dashboard';
import Audit from './audit/audit';
import Reservations from './reservations/reservations';
import Reports from './reports/reports';
import Login from './login/login';
import Formulario from './reservations/formulario';


function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/catalog" element={<Catalog/>}/>
        <Route path="/audit" element={<Audit/>}/>
        <Route path="/reservations" element={<Reservations/>}/>
        <Route path="/formulario" element={<Formulario/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;