// src/components/login/RegisterModal.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from 'axios';
// Importa useNavigate para redirigir tras un registro exitoso (si es público)

export default function RegisterModal({ onClose, openLogin }) {
  const nameRef = useRef(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Campos requeridos para el BE:
  const [dni, setDni] = useState('');
  const [grado, setGrado] = useState(''); // Asumimos que el registro público es solo para ALUMNO
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validaciones de Frontend
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    if (!dni || !grado) {
      setError("DNI y Grado son obligatorios para el registro de alumnos.");
      setLoading(false);
      return;
    }

    const url = "http://localhost:8081/api/usuarios/crear"; // Asumimos que este endpoint es público
    
    // El rol es fijo (ALUMNO) en el registro público
    const payload = {
      nombre: nombre,
      email: email,
      password: password,
      rol: "ALUMNO", 
      dni: dni, // AÑADIDO
      grado: grado // AÑADIDO
    };

    try {
      // Nota: No se requiere token si el endpoint está configurado como .permitAll()
      await axios.post(url, payload); 
      
      alert("Registro exitoso. ¡Ahora puedes iniciar sesión!");
      onClose(); // Cierra el modal
      // Abrir el modal de Login automáticamente
      setTimeout(openLogin, 300); 

    } catch (err) {
      console.error("Error en el registro:", err);
      if (err.response) {
        if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes("El correo electrónico ya está en uso")) {
          setError("El correo o DNI ya está registrado.");
        } else if (err.response.data && err.response.data.message) { 
          setError(`Error: ${err.response.data.message}`);
        } else {
          setError(`Error del servidor: ${err.response.status}.`);
        }
      } else {
        setError("Error de conexión al servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 id="register-title" className="modal-title">Crear cuenta</h2>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <label>
          Nombre completo*
          <input ref={nameRef} type="text" name="name" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>

        <label>
          Correo electrónico*
          <input type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        
        <label>
          DNI*
          <input type="text" name="dni" value={dni} onChange={(e) => setDni(e.target.value)} required />
        </label>

        <label>
          Grado/Nivel*
          <input type="text" name="grado" value={grado} onChange={(e) => setGrado(e.target.value)} required />
        </label>

        <label>
          Contraseña*
          <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>

        <label>
          Confirmar contraseña*
          <input type="password" name="confirm" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>

        {error && <p className="auth-error" style={{ color: 'red' }}>{error}</p>}

        <div className="modal-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar'}
          </button>
          <button type="button" className="btn-cancel" onClick={openLogin} disabled={loading}>Volver</button>
        </div>
      </form>

      <p className="toggle-line">
        ¿Ya tienes cuenta?{" "}
        <button type="button" className="link-button" onClick={openLogin}>
          Inicia sesión
        </button>
      </p>
    </>
  );
}