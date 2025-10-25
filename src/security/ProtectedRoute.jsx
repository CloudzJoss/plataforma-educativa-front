import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente es un "guardián"
// 'children' será la página que queremos proteger (ej. <Dashboard />)
export default function ProtectedRoute({ children }) {
  
  // 1. Revisa si tenemos un token en el localStorage
  const token = localStorage.getItem("authToken");

  if (!token) {
    // 2. Si NO hay token, redirige (navega) al usuario a la página de inicio
    // 'replace' es importante: borra la ruta /dashboard del historial,
    // así el usuario no puede volver a quedar "atrapado"
    return <Navigate to="/" replace />;
  }

  // 3. Si SÍ hay token, muestra la página protegida (el Dashboard)
  return children;
}
