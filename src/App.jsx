import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './navbar/navbar';
import Home from './home/home';
import Catalog from './catalog/catalog';  
import Dashboard from './dashboard/dashboard';
import Audit from './audit/audit';
import Reservations from './reservations/reservations';
import Reports from './reports/reports';
import Login from './login/login';

function App() {
  return (
    <BrowserRouter>
      <Navigation />

      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/catalog" element={<Catalog/>}/>
        <Route path="/audit" element={<Audit/>}/>
        <Route path="/reservations" element={<Reservations/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;