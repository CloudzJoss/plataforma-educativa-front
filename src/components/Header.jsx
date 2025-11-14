// src/components/Header.jsx
import React from "react"; // 1. 🚨 CAMBIO: Ya no necesitamos useState/useEffect
import icon from "../assets/logo.png";
import LoginButton from "./login/LoginButton";
import LogoutButton from "./login/LogoutButton.jsx"; 
import "../styles/Header.css";

export default function Header() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // 2. 🚨 CAMBIO: Lógica de autenticación simplificada.
  // Leemos 'userRole' directamente. Si existe, el usuario está logueado.
  // Esto funciona porque Login/Logout recargan la página (window.location.reload).
  const isAuthenticated = !!localStorage.getItem('userRole');

  return (
    <header className="Encabezado">
      <nav className="nav-container">
        <div
          className="logo-name"
          onClick={scrollToTop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && scrollToTop()}
          style={{ cursor: "pointer" }}
        >
          <img className="icon" src={icon} alt="Logo de la Escuela" />
        </div>

        <div className="nav-links">
          <a href="#nosotros">Nosotros</a>
          <a href="#programas">Programas</a>
          <a href="#contactanos">Contáctanos</a>
        </div>

        <div className="nav-auth">
          {/* 3. Esta lógica ahora funciona con 'isAuthenticated' (basado en 'userRole') */}
          {isAuthenticated ? (
            <LogoutButton /> // Muestra Cerrar Sesión si hay rol
          ) : (
            <LoginButton /> // Muestra Iniciar Sesión si NO hay rol
          )}
        </div>
      </nav>
    </header>
  );
}