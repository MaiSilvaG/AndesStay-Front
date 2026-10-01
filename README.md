# AndesStay - Frontend

Interfaz web de **AndesStay**, una plataforma de reservas de hospedaje. Desarrollada con React y Vite y con los estilos de Tailwind CSS y componentes de Tremor.

## Instalación de Dependencias

- Instalador librerías (Vite, React)
```
npm install
```

- Autenticación con Azure Msal
```
npm install @azure/msal-browser @azure/msal-react
```

- Bootstrap `https://react-bootstrap.netlify.app/docs/getting-started/introduction`
```
npm install react-bootstrap bootstrap
```
- Importar en `main.jsx`
```
import 'bootstrap/dist/css/bootstrap.min.css'
```

- Tremor libreria 
```
npm install @tremor/react --legacy-peer-deps
```

- Tailwind CSS
```
npm install -D tailwindcss@3.4.17 postcss autoprefixer --legacy-peer-deps
```

- Tanto Tremor (funciona con una versión mas abajo que el Node que tengo) como Tailwind CSS me presentaron problemas de versión con Node, así que ocupe: --legacy-peer-dep

## Configuración de Tailwind CSS y Tremor
- Crea e inicializa los archivos de Tailwind
```
npx tailwindcss init -p
```

- Verifica la versión instalada
```
npm list tailwindcss
```

- Agregar lo siguiente en el archivo `tailwind.config.js`
```
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@tremor/react/**/*.{js,ts,jsx,tsx}",
  ],
```

## Ejecución del proyecto
```
npm run dev
```

## Roles Azure
- Admin
- Recepcionista
- Cliente
- Auditor
  
## Credenciales Autenticación Msal
- dominio tenant: nuevoTenant.onmicrosoft.com
nuevos usuarios:
- admin@nuevoTenant.onmicrosoft.com -nombre: admin -contraseña: Sofa600432 
- recepcion@nuevoTenant.onmicrosoft.com -nombre: recepcion -contraseña: Lara928646 
- cliente1@nuevoTenant.onmicrosoft.com -nombre: cliente1 -contraseña: Lodo344245
- auditor@nuevoTenant.onmicrosoft.com -nombre: auditor -contraseña: Goha885056
