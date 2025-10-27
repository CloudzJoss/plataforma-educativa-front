//src/components/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Reutiliza los estilos del modal de login
import '../styles/CreateUserModal.css';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ALUMNO'); // Valor por defecto
  const [carrera, setCarrera] = useState('');
  // 🚨 Eliminamos el estado para codigoEstudiante
  // const [codigoEstudiante, setCodigoEstudiante] = useState(''); 
  const [departamento, setDepartamento] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  // Limpiar formulario y enfocar al abrir
  useEffect(() => {
    if (isOpen) {
      setNombre('');
      setEmail('');
      setPassword('');
      setRol('ALUMNO'); 
      setCarrera('');
      // 🚨 Limpiamos codigoEstudiante (ya no existe el estado)
      // setCodigoEstudiante(''); 
      setDepartamento('');
      setError(null);
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = `http://localhost:8081/api/usuarios/crear`;
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Sesión expirada.');
      setLoading(false);
      return;
    }

    // Construir el payload (UsuarioInputDTO)
    // 🚨 Ya no enviamos codigoEstudiante desde aquí
    const payload = {
      nombre: nombre.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
      ...(rol === 'ALUMNO' && { carrera: carrera.trim() }), // Solo carrera
      ...(rol === 'PROFESOR' && { departamento: departamento.trim() }),
    };

    // Validación simple
    if (!payload.nombre || !payload.email || !payload.password) {
      setError('Nombre, Email y Contraseña son obligatorios.');
      setLoading(false);
      return;
    }
    // 🚨 Actualizamos validación para Alumno (solo carrera)
    if (rol === 'ALUMNO' && !payload.carrera) { 
        setError('Para Alumno, la Carrera es obligatoria.');
        setLoading(false);
        return;
    }
     if (rol === 'PROFESOR' && !payload.departamento) {
        setError('Para Profesor, Departamento es obligatorio.');
        setLoading(false);
        return;
    }

    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.post(API_URL, payload, config);
      onUserCreated(response.data);
      onClose(); 

    } catch (err) {
      console.error("Error al crear usuario:", err);
      // ... (manejo de errores sin cambios) ...
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

  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="create-user-title" className="modal-title">Crear Nuevo Usuario</h2>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Campos del formulario */}
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

            {/* Campos condicionales según el rol */}
            {rol === 'ALUMNO' && (
              <>
                <label> Carrera* <input type="text" value={carrera} onChange={(e) => setCarrera(e.target.value)} required /> </label>
                {/* 🚨 CAMPO ELIMINADO del formulario */}
                {/* <label> Código Estudiante* <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} required /> 
                </label> 
                */}
              </>
            )}
            {rol === 'PROFESOR' && (
              <label> Departamento* <input type="text" value={departamento} onChange={(e) => setDepartamento(e.target.value)} required /> </label>
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

