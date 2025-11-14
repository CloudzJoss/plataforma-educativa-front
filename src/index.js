// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import axios from 'axios'; // 1. IMPORTAR AXIOS

// --- 2. AÑADIR CONFIGURACIÓN GLOBAL DE AXIOS ---
// Establece la URL base para todas las peticiones de axios
axios.defaults.baseURL = 'http://localhost:8081'; // (O el puerto de tu backend)
// ¡LA LÍNEA MÁS IMPORTANTE! Permite que axios envíe cookies
axios.defaults.withCredentials = true; 
// --- FIN DE LA CONFIGURACIÓN ---

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <BrowserRouter> 
      <App />
    </BrowserRouter>
);