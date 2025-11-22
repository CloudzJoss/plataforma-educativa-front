// src/pages/DashboardHomeRouter.jsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

export default function DashboardHomeRouter() {
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        console.log('🔀 DashboardHomeRouter - Rol detectado:', userRole);
    }, [userRole]);

    // Si es PROFESOR, redirigir a sus secciones
    if (userRole === 'PROFESOR') {
        return <Navigate to="/dashboard/mis-secciones" replace />;
    }

    // Si es ALUMNO, redirigir a sus matrículas
    if (userRole === 'ALUMNO') {
        return <Navigate to="/dashboard/mis-matriculas" replace />;
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

    // Si no hay rol, redirigir al inicio
    return <Navigate to="/" replace />;
}