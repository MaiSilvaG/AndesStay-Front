import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import App from './App.jsx';

import 'bootstrap/dist/css/bootstrap.min.css';

// 1. Crear la instancia de MSAL
const msalInstance = new PublicClientApplication(msalConfig);

// 2. Inicializar la instancia (Requerido en versiones recientes de MSAL)
msalInstance.initialize().then(() => {
  // Establecer cuenta activa si existe una sesión previa
  if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
  }

  // Escuchar eventos de inicio de sesión exitoso
  msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload;
      msalInstance.setActiveAccount(payload.account);
    }
  });

  // 3. Renderizar la aplicación dentro de MsalProvider
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>
  );
});