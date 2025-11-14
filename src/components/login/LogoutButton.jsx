// src/components/login/LogoutButton.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. 👈 IMPORTAR AXIOS

export default function LogoutButton() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName');

    // 2. 👈 Convertir en 'async' para esperar la llamada a la API
    const handleLogout = async () => {
        console.warn("🔒 Cerrando sesión...");
        try {
          // 3. 👈 AVISAR AL BACKEND QUE DESTRUYA LA COOKIE
          // (Asumiendo que 'axios.defaults.baseURL' está en index.js)
          await axios.post('/api/auth/logout');
          console.log("Cookie del backend destruida.");
        } catch (error) {
          console.error("Error al cerrar sesión en el backend:", error);
          // No importa si falla, limpiamos el frontend de todos modos
        }
      
        // 4. Limpiar la UI (localStorage)
        localStorage.clear(); 
        
        // 5. Navegar y recargar
        navigate('/');
        window.location.reload(); 
    };

    return (
        <button
            className="btn-logout" // Puedes usar el mismo estilo del botón de login
            onClick={handleLogout}
            title={`Sesión de ${userName || 'Usuario'}`}
            style={{
              // (Pega aquí los estilos de tu botón azul si quieres)
              padding: '10px 20px',
              backgroundColor: '#d32f2f', // Un color rojo para "logout"
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
        >
            Cerrar sesión
        </button>
    );
}