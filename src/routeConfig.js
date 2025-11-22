// src/routeConfig.js
import React from 'react';

// Importaciones de Páginas
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GestionUsuarios from "./pages/GestionUsuarios.jsx";
import GestionCursos from "./pages/GestionCursos.jsx";
import GestionSecciones from "./pages/GestionSecciones.jsx";
import MisSeccionesProfesor from "./pages/MisSeccionesProfesor.jsx";

// 👇 NUEVAS PÁGINAS PARA ALUMNOS
import MisMatriculas from "./pages/MisMatriculas.jsx";
import SeccionesDisponibles from "./pages/SeccionesDisponibles.jsx";

import ProtectedRoute from "./security/ProtectedRoute.jsx";
import DashboardHomeRouter from "./pages/DashboardHomeRouter.jsx";

const routeConfig = [
    {
        path: "/",
        element: <HomePage />
    },
    {
        path: "/dashboard",
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <DashboardHomeRouter />
            },
            // --- RUTAS DE ADMINISTRADOR ---
            {
                path: "usuarios",
                element: (
                    <ProtectedRoute roles={["ADMINISTRADOR"]}>
                        <GestionUsuarios />
                    </ProtectedRoute>
                )
            },
            {
                path: "cursos",
                element: (
                    <ProtectedRoute roles={["ADMINISTRADOR"]}>
                        <GestionCursos />
                    </ProtectedRoute>
                )
            },
            {
                path: "secciones",
                element: (
                    <ProtectedRoute roles={["ADMINISTRADOR"]}>
                        <GestionSecciones />
                    </ProtectedRoute>
                )
            },
            // --- RUTAS DE PROFESOR ---
            {
                path: "mis-secciones",
                element: (
                    <ProtectedRoute roles={["PROFESOR"]}>
                        <MisSeccionesProfesor />
                    </ProtectedRoute>
                )
            },
            // --- RUTAS DE ALUMNO ---
            {
                path: "mis-matriculas",
                element: (
                    <ProtectedRoute roles={["ALUMNO"]}>
                        <MisMatriculas />
                    </ProtectedRoute>
                )
            },
            {
                path: "secciones-disponibles",
                element: (
                    <ProtectedRoute roles={["ALUMNO"]}>
                        <SeccionesDisponibles />
                    </ProtectedRoute>
                )
            }
        ]
    },
];

export default routeConfig;