import React from 'react';

export default function DashboardProfesor() {
  const userName = localStorage.getItem("userName") || "Profesor";
  return (
    <>
      <h1>Panel del Profesor</h1>
      <h2>¡Bienvenido, {userName}!</h2>
      <p>Aquí podrás gestionar tus cursos, tomar asistencia y cargar notas.</p>
    </>
  );
}
