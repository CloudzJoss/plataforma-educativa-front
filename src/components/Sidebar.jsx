import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Sidebar.css';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const userName = localStorage.getItem('userName');

    const handleLogout = async () => {
        console.warn("🔒 Cerrando sesión...");
        try {
            await axios.post('/api/auth/logout');
            console.log("Cookie del backend destruida.");
        } catch (error) {
            console.error("Error al cerrar sesión en el backend:", error);
        }
        localStorage.clear();
        onClose();
        navigate('/');
        window.location.reload();
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

                {userName && (
                    <div style={{ 
                        padding: '10px', 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: '4px', 
                        marginBottom: '15px',
                        fontSize: '0.9em',
                        color: '#666'
                    }}>
                        👤 {userName}
                    </div>
                )}

                {/* Enlaces comunes */}
                <Link to="/dashboard" onClick={onClose}>🏠 Inicio</Link>

                {/* Enlaces de ADMINISTRADOR */}
                {userRole === 'ADMINISTRADOR' && (
                    <>
                        <div className="menu-section-label">Gestión</div>
                        <Link to="/dashboard/usuarios" onClick={onClose}>👥 Usuarios</Link>
                        <Link to="/dashboard/cursos" onClick={onClose}>📚 Cursos</Link>
                        <Link to="/dashboard/secciones" onClick={onClose}>🏫 Secciones</Link>
                        <Link to="/dashboard/matriculas" onClick={onClose}>📋 Matrículas</Link>
                        
                        <div className="menu-section-label">Supervisión</div>
                        <Link to="/dashboard/supervisor-asistencia" onClick={onClose}>🕵️‍♂️ Supervisar Clases</Link>
                    </>
                )}

                {/* Enlaces de PROFESOR */}
                {userRole === 'PROFESOR' && (
                    <>
                        <Link to="/dashboard/mi-horario" onClick={onClose}>📅 Ver Horario</Link>
                        <Link to="/dashboard/mis-secciones" onClick={onClose}>📖 Mis Secciones</Link>
                    </>
                )}

                {/* Enlaces de ALUMNO */}
                {userRole === 'ALUMNO' && (
                    <>
                        <Link to="/dashboard/mi-horario" onClick={onClose}>📅 Mi Horario</Link>
                        <Link to="/dashboard/mis-matriculas" onClick={onClose}>📚 Mis Cursos</Link>
                        <Link to="/dashboard/secciones-disponibles" onClick={onClose}>🔍 Buscar Secciones</Link>
                    </>
                )}

                <button onClick={handleLogout} className="btn-logout">
                    🚪 Cerrar sesión
                </button>
            </nav>
        </>
    );
}