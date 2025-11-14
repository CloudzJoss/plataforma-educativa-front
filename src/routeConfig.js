// src/routeConfig.js

import React from 'react';

// Ajuste de extensiones de archivo si son necesarias
import HomePage from "./pages/HomePage.jsx"; 
import Dashboard from "./pages/Dashboard.jsx"; 
import DashboardHome from "./pages/DashboardHome.jsx";
import GestionUsuarios from "./pages/GestionUsuarios.jsx"; 
import ProtectedRoute from "./security/ProtectedRoute.jsx"; 

const routeConfig = [
  { 
    path: "/", 
    element: <HomePage /> 
  },
  {
    path: "/dashboard", 
    element: (
      <ProtectedRoute>
        <Dashboard /> 
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: <DashboardHome /> 
      }, 
      { 
        path: "usuarios", 
        element: <GestionUsuarios /> 
      },
    ]
  },
];

export default routeConfig; // Exportamos el array