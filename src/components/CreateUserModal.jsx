//src/components/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/CreateUserModal.css';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  // --- Estados (sin cambios) ---
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ALUMNO'); 
  const [grado, setGrado] = useState(''); 
  const [dni, setDni] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  // --- useEffect (sin cambios) ---
  useEffect(() => {
    if (isOpen) {
      setNombre(''); setEmail(''); setPassword(''); setRol('ALUMNO');
      setGrado(''); setDni(''); setError(null);
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. 🚨 CAMBIO: Ruta relativa
    const API_URL = `/api/usuarios/crear`;
    
    // 2. 🚨 ELIMINADO: Ya no necesitamos 'token'
    // const token = localStorage.getItem('authToken');
    // if (!token) { ... }

    // --- Payload (sin cambios) ---
    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
      dni: dni.trim(), 
      ...(rol === 'ALUMNO' && { grado: grado.trim() }), 
    };

    // --- Validación (sin cambios) ---
    if (!payload.nombre || !payload.email || !payload.password || !payload.dni) {
      setError('Nombre, Email, Contraseña y DNI son obligatorios.');
      setLoading(false);
      return;
    }
    if (rol === 'ALUMNO' && !payload.grado) { 
        setError('Para Alumno, el Grado es obligatorio.');
        setLoading(false);
        return;
    }

    try {
      // 3. 🚨 ELIMINADO: Ya no necesitamos 'config'
      // const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // 4. 🚨 CAMBIO: Petición "limpia"
      const response = await axios.post(API_URL, payload); // <-- SIN 'config'
      onUserCreated(response.data);
      onClose(); 

    } catch (err) {
      // --- Manejo de error (sin cambios) ---
      console.error("Error al crear usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para crear usuarios.");
         } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes("El correo electrónico ya está en uso")) {
            setError("El correo electrónico ya está registrado.");
         } else if (err.response.data && err.response.data.message) { 
           setError(`Error del servidor: ${err.response.data.message}`);
         } else { 
            setError(`Error del servidor: ${err.response.status}`);
         }
      } else if (err.request) {
        setError("No se pudo conectar al servidor.");
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado (sin cambios) ---
  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="create-user-title" className="modal-title">Crear Nuevo Usuario</h2>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label> Nombre Completo* <input ref={nameInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /> </label>
            <label> Email* <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>
            <label> Contraseña* <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> </label>
            <label> Rol*
              <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                <option value="ALUMNO">Alumno</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ADMINISTRADOR">Administrador</option>
              </select>
            </label>
            
            <label> DNI* <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} required /> </label>

            {rol === 'ALUMNO' && (
              <>
                <label> Grado* <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} required /> </label>
              </>
            )}

            {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={loading}> {loading ? 'Creando...' : 'Crear Usuario'} </button>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}> Cancelar </button>
          D</div>
          </form>
        </div>
      </div>
    </div>
  );
}