//src/components/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/EditUserModal.css'; 

export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated }) {
  // --- Estados (sin cambios) ---
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dni, setDni] = useState('');
  const [grado, setGrado] = useState('');
  const [codigoEstudiante, setCodigoEstudiante] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  // --- useEffect (sin cambios) ---
  // Actualiza los estados del formulario cuando el 'userToEdit' cambia
  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || '');
      setEmail(userToEdit.email || '');
      setPassword(''); 
      setDni(userToEdit.dni || '');
      setGrado(userToEdit.grado || ''); 
      setCodigoEstudiante(userToEdit.codigoEstudiante || '');
      setTimeout(() => nameInputRef.current?.focus(), 0); 
    }
    setError(null);
  }, [userToEdit, isOpen]); 

  // Si no está abierto, no renderiza nada
  if (!isOpen || !userToEdit) {
    return null;
  }

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. 🚨 CAMBIO: Usar ruta relativa (baseURL está en index.js)
    const API_URL = `/api/usuarios/editar/${userToEdit.id}`;
    
    // 2. 🚨 ELIMINADO: Ya no necesitamos 'token' de localStorage
    // const token = localStorage.getItem('authToken');
    // if (!token) {
    //   setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
    //   setLoading(false);
    //   return;
    // }

    // --- Payload (lógica sin cambios) ---
    // Construye el payload solo con los campos que cambiaron
    const payload = {};
    if (nombre.trim() && nombre !== userToEdit.nombre) payload.nombre = nombre.trim();
    if (email.trim() && email !== userToEdit.email) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim(); 
    
    if (userToEdit.rol === 'ALUMNO') {
      if (grado.trim() && grado !== userToEdit.grado) payload.grado = grado.trim();
      if (dni.trim() && dni !== userToEdit.dni) payload.dni = dni.trim();
      if (codigoEstudiante.trim() && codigoEstudiante !== userToEdit.codigoEstudiante) payload.codigoEstudiante = codigoEstudiante.trim();
    } else if (userToEdit.rol === 'PROFESOR') {
      if (dni.trim() && dni !== userToEdit.dni) payload.dni = dni.trim();
    }
    
    if (Object.keys(payload).length === 0) {
        setError("No se realizaron cambios.");
        setLoading(false);
        return;
    }

    try {
      // 3. 🚨 ELIMINADO: Ya no necesitamos 'config'
      // const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // 4. 🚨 CAMBIO: Petición "limpia". 
      // El navegador adjuntará la cookie HttpOnly automáticamente.
      const response = await axios.put(API_URL, payload); // <-- SIN 'config'

      onUserUpdated(response.data); 
      onClose(); 

    } catch (err) {
      // --- Manejo de error (sin cambios) ---
      console.error("Error al editar usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para editar.");
         } else if (err.response.data && err.response.data.message) {
           setError(`Error del servidor: ${err.response.data.message}`); 
         } else {
            setError(`Error del servidor: ${err.response.status}`);
         }
      } else if (err.request) {
        setError("No se pudo conectar al servidor.");
      } else {
        setError("Ocurrió un error inesperado al guardar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Renderizado (sin cambios) ---
  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="edit-user-title" className="modal-title">Editar Usuario (ID: {userToEdit.id})</h2>
          
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label>
              Nombre Completo
              <input ref={nameInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </label>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label>
              Nueva Contraseña (dejar en blanco para no cambiar)
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" />
            </label>
            
            {/* Mostrar campos de perfil según el rol original */}
            {userToEdit.rol === 'ALUMNO' && (
              <>
                <label>
                  Grado
                  <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} />
E             </label>
                <label>
                  Código Estudiante
                  <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} />
D             </label>
                <label>
                  DNI
                  <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
g             </label>
              </>
            )}
            {userToEdit.rol === 'PROFESOR' && (
              <label>
                DNI
                <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} />
ci           </label>
            )}
            
            <p><strong>Rol:</strong> {userToEdit.rol}</p>

            {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}