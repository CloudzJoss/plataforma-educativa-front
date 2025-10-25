import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// 🚨 ¡ERROR ARREGLADO AQUÍ!
// La ruta debe ser './Sidebar.css' (misma carpeta)
// y no '../styles/Sidebar'.
import './Sidebar.css'; 

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpia el token de autenticación
    localStorage.removeItem("authToken");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    
    // Cierra el sidebar
    onClose();
    
    // Redirige a la página de inicio
    navigate('/');
  };

  return (
    <>
      {/* Capa oscura de fondo (Overlay) */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      
      {/* El Panel Lateral */}
      <nav 
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Menú principal"
      >
        <button className="sidebar-close" onClick={onClose} aria-label="Cerrar menú">×</button>
        
        <h2>Menú Principal</h2>
        
        <Link to="/dashboard" onClick={onClose}>Mi Perfil</Link>
        <Link to="/dashboard/cursos" onClick={onClose}>Mis Cursos</Link>
        <Link to="/dashboard/ajustes" onClick={onClose}>Ajustes</Link>
        
        {/* El botón de logout se alinea al fondo */}
        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </nav>
    </>
  );
}