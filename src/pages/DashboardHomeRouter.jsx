// src/pages/DashboardHomeRouter.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';


/**
 * Este componente decide qué página mostrar según el rol del usuario
 */
export default function DashboardHomeRouter() {
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        console.log('🔀 DashboardHomeRouter - Rol detectado:', userRole);
    }, [userRole]);

    // Si es PROFESOR, redirigir a sus secciones
    if (userRole === 'PROFESOR') {
        return <Navigate to="/dashboard/mis-secciones" replace />;
    }

    // Si es ADMINISTRADOR, mostrar bienvenida
    if (userRole === 'ADMINISTRADOR') {
        return (
            <div className="gestion-container">
                <h1>Bienvenido, Administrador</h1>
                <p>Selecciona una opción del menú para comenzar.</p>
            </div>
        );
    }

    // Si es ALUMNO, mostrar bienvenida (puedes cambiar esto después)
    if (userRole === 'ALUMNO') {
        return (
            <div className="gestion-container">
                <h1>Bienvenido, Alumno</h1>
                <p>Aquí podrás ver tus cursos matriculados próximamente.</p>
            </div>
        );
    }

    // Si no hay rol, redirigir al inicio
    return <Navigate to="/" replace />;
}
