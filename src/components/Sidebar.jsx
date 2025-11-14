import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. IMPORTAR AXIOS
import './Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole'); 

  // 2. 🚨 CAMBIO: Convertir en función async
  const handleLogout = async () => {
    console.warn("🔒 SESIÓN CERRADA: Token y Rol borrados."); 

    try {
      // 3. 🚨 AÑADIDO: Llamar al backend para destruir la cookie HttpOnly
      // (La ruta es relativa gracias a axios.defaults.baseURL)
      await axios.post('/api/auth/logout');
      console.log("Cookie del backend destruida.");
    } catch (error) {
      console.error("Error al cerrar sesión en el backend:", error);
      // Continuamos de todos modos para limpiar el frontend
    }

    localStorage.clear(); // Borra token Y rol
    onClose(); 
    navigate('/'); 
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

        <Link to="/dashboard" onClick={onClose}>Mi Perfil</Link>

        {/* (La lógica condicional aquí ya era correcta) */}
        {userRole === 'ADMINISTRADOR' && (
          <Link to="/dashboard/usuarios" onClick={onClose}>Gestión de Usuarios</Link>
        )}

        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </nav>
    </>
  );
}