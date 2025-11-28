// src/components/Header.jsx
import React, { useState } from "react";
import "../styles/Header.css";
import icon from "../assets/logo.png";
import LoginButton from "./login/LoginButton";
import LogoutButton from "./login/LogoutButton";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleLinkClick = (e) => {
    setMenuOpen(false);
  };

  const isAuthenticated = !!localStorage.getItem('userRole');

  return (
    <header className="Encabezado">
      <nav className="nav-container">
        {/* Logo */}
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

        {/* Botón hamburguesa (solo móvil) */}
        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Menú deslizable */}
        <div className={`nav-links-wrapper ${menuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            <a href="#nosotros" onClick={handleLinkClick}>Nosotros</a>
            <a href="#programas" onClick={handleLinkClick}>Programas</a>
            <a href="#contactanos" onClick={handleLinkClick}>Contáctanos</a>
          </div>
        </div>

        {/* Botón de sesión (siempre visible) */}
        <div className="nav-auth">
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <LoginButton />
          )}
        </div>
      </nav>

      {/* Overlay para cerrar menú al hacer click fuera */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}></div>
      )}
    </header>
  );
}