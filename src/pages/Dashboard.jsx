// src/components/pages/Dashboard.jsx 
import React, { useState } from 'react';
// 🚨 ESTA ES LA IMPORTACIÓN CORRECTA:
import Sidebar from '../components/Sidebar'; 

// Si usas React Router DOM, querrás el hook para navegar
// import { useNavigate } from 'react-router-dom'; 

// Un CSS simple para el botón hamburguesa (puedes mover esto a un CSS externo)
const hamburgerStyle = {
  fontSize: '2rem',
  background: 'none',
  border: 'none',
  color: '#3b5998', // Color primario de la escuela
  cursor: 'pointer',
  padding: '10px',
  position: 'fixed', 
  top: '15px',
  right: '20px',
  zIndex: 998, 
};

export default function Dashboard() {
  // 1. Estado para saber si el menú lateral está abierto o cerrado
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // const navigate = useNavigate(); // Descomentar si vas a usar navegación

  // 2. Funciones para controlar el menú
  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 3. Función de ejemplo para Cerrar Sesión
  const handleLogout = () => {
    // Esta lógica la implementamos en el Sidebar.jsx
    alert("Cerrando sesión..."); 
  };

  return (
    <div>
      {/* 4. El botón de 3 líneas (hamburguesa) */}
      <button 
        style={hamburgerStyle} 
        onClick={openSidebar}
        aria-label="Abrir menú de navegación"
      >
        ☰
      </button>

      {/* 5. El componente Sidebar */}
      {/* Le pasamos las props necesarias que definimos en Sidebar.jsx */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
      />

      {/* 6. Contenido Principal del Dashboard */}
      <main style={{ padding: '20px', paddingTop: '80px', minHeight: '100vh' }}>
        <h1>🎓 Plataforma Educativa de la Escuela</h1>
        <h2>¡Bienvenido al Panel de Control!</h2>
        <p>Aquí verás tus cursos, notas y herramientas administrativas.</p>
        
      </main>
    </div>
  );
}