//src/components/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/CreateUserModal.css';

// ✅ URL CONSTANTE DEL BACKEND
const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  // --- Estados Base ---
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ALUMNO'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  // --- 1. 🚨 NUEVOS ESTADOS PARA PERFILES ---
  const [dniAlumno, setDniAlumno] = useState('');
  const [grado, setGrado] = useState(''); 
  const [nivel, setNivel] = useState('SECUNDARIA');

  const [dniProfesor, setDniProfesor] = useState('');
  const [telefono, setTelefono] = useState('');
  const [experiencia, setExperiencia] = useState('');

  // --- Limpiar formulario al abrir ---
  useEffect(() => {
    if (isOpen) {
      setNombre(''); setEmail(''); setPassword(''); setRol('ALUMNO');
      setError(null);
      setDniAlumno(''); setGrado(''); setNivel('SECUNDARIA');
      setDniProfesor(''); setTelefono(''); setExperiencia('');
      
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // ✅ USAMOS LA URL DE AZURE
    const API_URL = `${BASE_URL}/api/usuarios/crear`;
    
    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
    };

    // --- Validación y Payload de Alumno ---
    if (rol === 'ALUMNO') {
      if (!dniAlumno.trim() || !grado.trim() || !nivel) {
        setError('Para Alumno: DNI, Grado y Nivel son obligatorios.');
        setLoading(false);
        return;
      }
      payload.dniAlumno = dniAlumno.trim();
      payload.nivel = nivel;
      payload.grado = grado.trim();
    }
    
    // --- Validación y Payload de Profesor ---
    else if (rol === 'PROFESOR') {
      if (!dniProfesor.trim()) {
        setError('Para Profesor: DNI es obligatorio.');
        setLoading(false);
        return;
      }
      payload.dniProfesor = dniProfesor.trim();
      if (telefono.trim()) payload.telefono = telefono.trim();
      if (experiencia.trim()) payload.experiencia = experiencia.trim();
    }
    
    // --- Validación Base ---
    if (!payload.nombre || !payload.email || !payload.password) {
      setError('Nombre, Email y Contraseña son obligatorios.');
      setLoading(false);
      return;
    }

    console.log("Enviando payload:", payload);

    try {
      // ✅ Axios llamando a la URL correcta con credenciales
      const response = await axios.post(API_URL, payload, {
          withCredentials: true 
      }); 
      
      onUserCreated(response.data);
      onClose(); 

    } catch (err) {
      console.error("Error al crear usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para crear usuarios.");
         } else if (err.response.data && err.response.data.message) { 
           setError(err.response.data.message);
         } else if (err.response.data && typeof err.response.data === 'string' && err.response.data.includes("El correo electrónico ya está en uso")) {
           setError("El correo electrónico ya está registrado.");
         } else { 
           setError(`Error del servidor: ${err.response.status}`);
         }
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO (Igual que antes) ---
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
                <option value="ADMIN">Admin</option> 
              </select>
            </label>

            {rol === 'ALUMNO' && (
              <>
                <label> DNI (Alumno)* <input type="text" value={dniAlumno} onChange={(e) => setDniAlumno(e.target.value)} required /> </label>
                <label> Nivel*
                  <select value={nivel} onChange={(e) => setNivel(e.target.value)} required>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </label>
                <label> Grado* <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} required placeholder="Ej: 1ro, 5to" /> </label>
              </>
            )}

            {rol === 'PROFESOR' && (
              <>
                <label> DNI (Profesor)* <input type="text" value={dniProfesor} onChange={(e) => setDniProfesor(e.target.value)} required /> </label>
                <label> Teléfono <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /> </label>
                <label> Experiencia <textarea value={experiencia} onChange={(e) => setExperiencia(e.target.value)} /> </label>
              </>
            )}
            
            {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={loading}> {loading ? 'Creando...' : 'Crear Usuario'} </button>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}> Cancelar </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
