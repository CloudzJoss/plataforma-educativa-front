// src/components/login/LoginModal.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

export default function LoginModal({ onClose }) {
  const usernameRef = useRef(null);
  const navigate = useNavigate();

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false); 

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); 
    setError(null);    

    // 🚨 CAMBIO: URL DEL BACKEND EN AZURE
    const url = "https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/auth/login";
    
    const payload = {
      email: email,
      password: password,
    };

    try {
      // Importante: withCredentials: true permite que la cookie viaje
      const response = await axios.post(url, payload, { withCredentials: true });
      
      const { nombre, rol } = response.data;
      
      localStorage.setItem("userName", nombre);
      localStorage.setItem("userRole", rol);

      console.log("Login exitoso:", response.data); 
      setLoading(false);
      
      onClose(); 
      
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload();
      }, 0); 

    } catch (err) {
      console.error("Error en el login:", err);
      setLoading(false);

      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        setError("Email o contraseña incorrectos.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Error de conexión con el servidor.");
      } else {
        setError("Ocurrió un error. Intenta de nuevo.");
      }
    }
  };

  return (
    <>
      <h2 id="login-title" className="modal-title">Iniciar sesión</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            ref={usernameRef}
            type="email" 
            name="email"
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="password-container"> 
          Contraseña
          <div style={{ position: 'relative' }}> 
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button" 
              onClick={togglePasswordVisibility}
              className="password-toggle-btn"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </>
  );
}
