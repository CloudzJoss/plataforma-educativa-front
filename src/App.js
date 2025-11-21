// src/App.js
import { useRoutes } from 'react-router-dom';
import axios from 'axios';
import routeConfig from './routeConfig.js'; 
import "./App.css"; 
import { useEffect } from 'react'; 

// --- LÓGICA DE LIMPIEZA MODIFICADA ---
const checkAuthAndCleanup = async () => {
  // 1. 🚨 CAMBIO: Ahora revisamos 'userRole' en lugar de 'authToken'
  const role = localStorage.getItem('userRole');
  
  if (!role) return; // Si no hay rol, no hay sesión, nada que revisar.

  try {
    // 2. 🚨 CAMBIO: URL relativa (baseURL está en index.js)
    const API_URL = "https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/usuarios/me/api/usuarios/me"; 
    
    // 3. 🚨 ELIMINADO: 'token' y 'config' ya no son necesarios
    // const token = localStorage.getItem('authToken');
    // const config = { ... };
      
    // 4. 🚨 CAMBIO: Petición "limpia". El navegador envía la cookie.
    await axios.get(API_URL); // <-- SIN 'config'
    // Si la petición tiene éxito, la sesión de la cookie es válida. No hacemos nada.
      
  } catch (error) {
    // 5. Si la cookie es inválida/expirada, el backend da 401/403
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("Sesión de cookie expirada o inválida detectada. Limpiando localStorage.");
      
      // 6. 🚨 CAMBIO: Limpiamos los items de UI (authToken ya no existe)
      // localStorage.removeItem('authToken'); // <-- ELIMINADO
      localStorage.removeItem('userRole');
      localStorage.removeItem('userName');
        
      window.location.reload(); 
    }
  }
};


function App() {
    useEffect(() => {
        checkAuthAndCleanup();
    }, []); 

    const element = useRoutes(routeConfig); 

    return element; 
}

export default App;
