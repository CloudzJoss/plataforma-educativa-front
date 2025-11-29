// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import axios from 'axios'; 

// --- CONFIGURACIÓN GLOBAL DE AXIOS (SEGURIDAD) ---

// 1. URL Base
axios.defaults.baseURL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

// 2. Permitir Cookies (VITAL)
axios.defaults.withCredentials = true;

// 3. INTERCEPTOR GLOBAL (El Guardia de Seguridad)
// Se configura aquí para asegurar que exista ANTES de que cargue cualquier página.
axios.interceptors.response.use(
  (response) => {
    // Si todo sale bien, deja pasar la respuesta
    return response;
  },
  (error) => {
    // Si el servidor responde con error
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // Verificamos si ya estamos en el login para no hacer bucles infinitos
      if (window.location.pathname !== '/') {
        console.warn("🔒 Sesión expirada (401/403). Limpiando y redirigiendo...");
        
        // A. Destruir datos del LocalStorage
        localStorage.clear(); 

        // B. Forzar recarga y envío al Login
        window.location.href = '/'; 
      }
    }
    // Rechazamos el error para que la página actual sepa que falló (y quite el loading)
    return Promise.reject(error);
  }
);

// --- FIN CONFIGURACIÓN ---

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter> 
      <App />
    </BrowserRouter>
);