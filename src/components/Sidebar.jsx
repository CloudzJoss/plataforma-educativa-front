// src/components/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. 👈 IMPORTA AXIOS (para el logout)
// 2. 🚨 CORRECCIÓN: Ajustando la ruta del CSS (asumiendo que está en 'src/styles/')
import '../styles/Sidebar.css'; 

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  // 3. 👈 Leemos el rol del localStorage para decidir qué enlaces mostrar
  const userRole = localStorage.getItem('userRole'); 

  // 4. 👈 Función de Logout CORREGIDA
  const handleLogout = async () => {
    console.warn("🔒 Cerrando sesión..."); 

    try {
      // 4a. Llama al backend para que destruya la cookie HttpOnly
      // (Asumiendo que 'axios.defaults.baseURL' está en index.js)
      await axios.post('/api/auth/logout');
      console.log("Cookie del backend destruida.");
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
      // No importa si falla, limpiamos el frontend de todos modos
    }

    // 4b. Limpia los datos de la UI (localStorage)
    localStorage.clear();
    onClose(); // Cierra el sidebar
    navigate('/'); // Redirige al usuario a la página de inicio
    window.location.reload(); // Asegura que todo se reinicie
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <nav
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Menú principal"
      >
        <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button>

        <h2>Menú Principal</h2>

        {/* --- ENLACES COMUNES --- */}
        <Link to="/dashboard" onClick={onClose}>Mi Perfil</Link>

        {/* --- 5. 👈 ENLACES DE ADMINISTRADOR --- */}
        {/* Usamos 'ADMINISTRADOR' para que coincida con tu Enum Rol.java */}
        {userRole === 'ADMINISTRADOR' && (
          <>
            <Link to="/dashboard/usuarios" onClick={onClose}>Gestión de Usuarios</Link>
            {/* 6. 👈 AÑADIDO: El nuevo enlace de Cursos */}
            <Link to="/dashboard/cursos" onClick={onClose}>Gestión de Cursos</Link>
          </>
        )}

        {/* --- ENLACES DE PROFESOR --- */}
        {userRole === 'PROFESOR' && (
          <>
            {/* Aquí puedes añadir enlaces de Profesor, ej: */}
            {/* <Link to="/dashboard/mis-secciones" onClick={onClose}>Mis Secciones</Link> */}
          </>
        )}

        {/* --- ENLACES DE ALUMNO --- */}
        {userRole === 'ALUMNO' && (
          <>
            {/* Aquí puedes añadir enlaces de Alumno, ej: */}
            {/* <Link to="/dashboard/mis-matriculas" onClick={onClose}>Mis Cursos</Link> */}
          </>
        )}

        {/* --- BOTÓN DE LOGOUT --- */}
        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </nav>
    </>
  );
}