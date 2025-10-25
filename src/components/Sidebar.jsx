//src/components/Sidebar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css'; // Asumiendo que este archivo SÍ existe ahora en /components/

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    
    // 🚨 ¡AQUÍ ESTÁ TU MENSAJE!
    // Usamos console.warn() para que se vea amarillo y destaque.
    console.warn("🔒 SESIÓN CERRADA: Token de autenticación destruido.");
    
    // Borra TODO el localStorage (authToken, userName, userRole, etc.)
    localStorage.clear();
    
    // Cierra el sidebar
    onClose();
    
    // Envía al home
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
        <Link to="/dashboard" onClick={onClose}>Ajustes</Link>
        
        <button onClick={handleLogout} className="btn-logout">
          Cerrar sesión
        </button>
      </nav>
    </>
  );
}

