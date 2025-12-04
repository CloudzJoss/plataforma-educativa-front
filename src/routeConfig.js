// src/routeConfig.js
import React from 'react';

// Importaciones de Páginas
import HomePage from "./pages/HomePage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import GestionUsuarios from "./pages/GestionUsuarios.jsx";
import GestionCursos from "./pages/GestionCursos.jsx";
import GestionSecciones from "./pages/GestionSecciones.jsx";
import GestionMatriculas from "./pages/GestionMatriculas.jsx";
import SupervisorAsistencia from "./pages/SupervisorAsistencia.jsx";
import MisSeccionesProfesor from "./pages/MisSeccionesProfesor.jsx";
import MisMatriculas from "./pages/MisMatriculas.jsx";
import SeccionesDisponibles from "./pages/SeccionesDisponibles.jsx";
import VerHorario from "./pages/VerHorario.jsx";
import ProtectedRoute from "./security/ProtectedRoute.jsx";
import DashboardHomeRouter from "./pages/DashboardHomeRouter.jsx";
import AulaVirtual from "./pages/AulaVirtual.jsx";

const routeConfig = [
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      // --- HOME ---
      {
        index: true,
        element: <DashboardHomeRouter />,
      },

      // --- AULA VIRTUAL ---
      {
        path: "aula/:seccionId",
        element: (
          <ProtectedRoute roles={["ALUMNO", "PROFESOR", "ADMINISTRADOR"]}>
            <AulaVirtual />
          </ProtectedRoute>
        ),
      },

      // --- RUTAS COMUNES ---
      {
        path: "mi-horario",
        element: (
          <ProtectedRoute roles={["ALUMNO", "PROFESOR"]}>
            <VerHorario />
          </ProtectedRoute>
        ),
      },

      // --- ADMINISTRADOR ---
      {
        path: "usuarios",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionUsuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: "cursos",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionCursos />
          </ProtectedRoute>
        ),
      },
      {
        path: "secciones",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionSecciones />
          </ProtectedRoute>
        ),
      },
      {
        path: "matriculas",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <GestionMatriculas />
          </ProtectedRoute>
        ),
      },
      {
        path: "supervisor-asistencia",
        element: (
          <ProtectedRoute roles={["ADMINISTRADOR"]}>
            <SupervisorAsistencia />
          </ProtectedRoute>
        ),
      },

      // --- PROFESOR ---
      {
        path: "mis-secciones",
        element: (
          <ProtectedRoute roles={["PROFESOR"]}>
            <MisSeccionesProfesor />
          </ProtectedRoute>
        ),
      },

      // --- ALUMNO ---
      {
        path: "mis-matriculas",
        element: (
          <ProtectedRoute roles={["ALUMNO"]}>
            <MisMatriculas />
          </ProtectedRoute>
        ),
      },
      {
        path: "secciones-disponibles",
        element: (
          <ProtectedRoute roles={["ALUMNO"]}>
            <SeccionesDisponibles />
          </ProtectedRoute>
        ),
      },
    ],
  },
];

export default routeConfig;
