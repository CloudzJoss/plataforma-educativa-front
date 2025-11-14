//src/security/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  
  // 1. 🚨 CAMBIO: El 'token' ya no existe en localStorage
  // const token = localStorage.getItem("authToken"); // <-- ELIMINADO
  const role = localStorage.getItem("userRole"); 

  // 2. 🚨 CAMBIO: La comprobación ahora se basa SÓLO en el rol
  if (!role) {
    // 3. Si NO hay rol, te bota (Autenticación)
    console.error("⛔ ACCESO DENEGADO: No se encontró 'userRole' en localStorage. Redirigiendo al inicio.");
    return <Navigate to="/" replace />;
  }

  // 4. Revisa si el rol es el correcto (Autorización de UI)
  if (role !== "ADMINISTRADOR") {
    // 5. Si hay rol, PERO no es Admin, te bota
    console.error(`⛔ AUTORIZACIÓN DENEGADA: El rol '${role}' no tiene permisos para acceder a la gestión. Redirigiendo al inicio.`);
    return <Navigate to="/" replace />;
  }

  // 6. Si SÍ hay rol Y SÍ es Admin, muestra la página
  return children;
}