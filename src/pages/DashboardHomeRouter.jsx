import React from 'react';
import { Navigate } from 'react-router-dom';
import DashboardAdmin from './DashboardAdmin.jsx';
import DashboardAlumno from './DashboardAlumno.jsx';
import DashboardProfesor from './DashboardProfesor.jsx';

/**
 * Este componente actúa como un "switch".
 * Revisa el rol del usuario en localStorage y renderiza
 * la página de bienvenida correspondiente.
 */
export default function DashboardHomeRouter() {
  const role = localStorage.getItem("userRole");

  switch (role) {
    case 'ADMINISTRADOR':
      return <DashboardAdmin />;
    case 'ALUMNO':
      return <DashboardAlumno />;
    case 'PROFESOR':
      return <DashboardProfesor />;
    default:
      // Si el rol es nulo o desconocido, lo botamos
      console.error("Rol desconocido en DashboardHomeRouter:", role);
      localStorage.clear(); 
      return <Navigate to="/" replace />;
  }
}