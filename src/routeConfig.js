import React from 'react';
import { Navigate } from 'react-router-dom';

// --- Importaciones de Páginas ---
import HomePage from "./pages/HomePage.jsx"; 
import Dashboard from "./pages/Dashboard.jsx"; 
import GestionUsuarios from "./pages/GestionUsuarios.jsx"; 

// 🚨 CAMBIO: Importamos los NUEVOS componentes
import ProtectedRoute from "./security/ProtectedRoute.jsx"; 
import DashboardHomeRouter from "./pages/DashboardHomeRouter.jsx"; // (Lo creamos abajo)
import GestionCursos from "./pages/GestionCursos.jsx"; // (Lo creamos abajo)


// ===================================================================
// CONFIGURACIÓN DE RUTAS (CORREGIDA)
// ===================================================================
const routeConfig = [
  { 
    path: "/", 
    element: <HomePage /> 
  },
  {
    path: "/dashboard", 
    // Protección Genérica (Nivel 1)
    // Revisa que el usuario esté logueado (cualquier rol)
    element: (
      <ProtectedRoute>
        <Dashboard /> 
      </ProtectedRoute>
    ),
    // Rutas "hijas" que se renderizan dentro de <Dashboard/>
    children: [
      { 
        index: true, 
        // La ruta 'index' apunta al "enrutador" de bienvenida
        element: <DashboardHomeRouter /> 
      }, 
      { 
        path: "usuarios", 
        // Protección Específica (Nivel 2)
        // Solo los "ADMINISTRADOR" pueden verla.
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionUsuarios /> 
          </ProtectedRoute>
        )
      },
      { 
        path: "cursos", // 🚨 ¡AQUÍ ESTÁ LA RUTA QUE FALTABA!
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionCursos /> 
          </ProtectedRoute>
        )
      }
      // ... (Aquí puedes añadir más rutas para Alumno/Profesor)
    ]
  },
];

export default routeConfig;