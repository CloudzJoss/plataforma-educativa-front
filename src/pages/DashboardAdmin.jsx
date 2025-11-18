import React from 'react';

export default function DashboardAdmin() {
  const userName = localStorage.getItem("userName") || "Administrador";
  return (
    <>
      <h1>Panel de Administración</h1>
      <h2>¡Bienvenido, {userName}!</h2>
      <p>
        Selecciona una opción del menú (☰) para comenzar a gestionar
        la plataforma.
      </p>
    </>
  );
}