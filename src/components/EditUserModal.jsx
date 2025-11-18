//src/components/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/EditUserModal.css'; // Asumo que este archivo existe o lo crearás

export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated }) {
  // --- Estados Base ---
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Siempre vacío por seguridad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  // --- 1. 🚨 NUEVOS ESTADOS PARA PERFILES ---
  // (Campos de Alumno)
  const [dniAlumno, setDniAlumno] = useState('');
  const [grado, setGrado] = useState(''); 
  const [nivel, setNivel] = useState('SECUNDARIA');
  const [codigoEstudiante, setCodigoEstudiante] = useState('');

  // (Campos de Profesor)
  const [dniProfesor, setDniProfesor] = useState('');
  const [telefono, setTelefono] = useState('');
  const [experiencia, setExperiencia] = useState('');
  // 'gradoAcademico' no es necesario según tu indicación
  
  // --- Cargar datos del usuario al abrir ---
  useEffect(() => {
    // 'userToEdit' es el UsuarioOutputDTO que viene de GestionUsuarios
    if (userToEdit) {
      // Cargar datos comunes
      setNombre(userToEdit.nombre || '');
      setEmail(userToEdit.email || '');
      setPassword(''); // Contraseña nunca se precarga
      setError(null);
      
      // 2. 🚨 Cargar datos del Perfil de Alumno (si existe)
      if (userToEdit.rol === 'ALUMNO') {
        setDniAlumno(userToEdit.dniAlumno || '');
        setGrado(userToEdit.grado || '');
        setNivel(userToEdit.nivel || 'SECUNDARIA');
        setCodigoEstudiante(userToEdit.codigoEstudiante || '');
      }
      
      // 3. 🚨 Cargar datos del Perfil de Profesor (si existe)
      if (userToEdit.rol === 'PROFESOR') {
        setDniProfesor(userToEdit.dniProfesor || '');
        setTelefono(userToEdit.telefono || '');
        setExperiencia(userToEdit.experiencia || '');
      }

      setTimeout(() => nameInputRef.current?.focus(), 0); 
    }
  }, [userToEdit, isOpen]); 

  if (!isOpen || !userToEdit) {
    return null;
  }

  // --- handleSubmit (MODIFICADO) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = `/api/usuarios/editar/${userToEdit.id}`;
    
    // --- 4. 🚨 PAYLOAD ACTUALIZADO ---
    // Construye el payload (UsuarioUpdateDTO) solo con los campos que cambiaron
    const payload = {};
    
    // Campos comunes
    if (nombre.trim() && nombre !== userToEdit.nombre) payload.nombre = nombre.trim();
    if (email.trim() && email !== userToEdit.email) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim(); 
    
    // Campos de Alumno
    if (userToEdit.rol === 'ALUMNO') {
      if (grado.trim() && grado !== userToEdit.grado) payload.grado = grado.trim();
      if (dniAlumno.trim() && dniAlumno !== userToEdit.dniAlumno) payload.dniAlumno = dniAlumno.trim();
      if (codigoEstudiante.trim() && codigoEstudiante !== userToEdit.codigoEstudiante) payload.codigoEstudiante = codigoEstudiante.trim();
      if (nivel && nivel !== userToEdit.nivel) payload.nivel = nivel;
    } 
    // Campos de Profesor
    else if (userToEdit.rol === 'PROFESOR') {
      if (dniProfesor.trim() && dniProfesor !== userToEdit.dniProfesor) payload.dniProfesor = dniProfesor.trim();
      if (telefono.trim() && telefono !== userToEdit.telefono) payload.telefono = telefono.trim();
      if (experiencia.trim() && experiencia !== userToEdit.experiencia) payload.experiencia = experiencia.trim();
    }
    
    if (Object.keys(payload).length === 0) {
        setError("No se realizaron cambios.");
        setLoading(false);
        return;
    }

    console.log("Enviando payload de actualización:", payload);

    try {
      // Petición "limpia" (sin 'config') envía la cookie HttpOnly
      const response = await axios.put(API_URL, payload);

      onUserUpdated(response.data); // Devuelve el UsuarioOutputDTO actualizado
      onClose(); 

    } catch (err) {
      console.error("Error al editar usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para editar.");
         } else if (err.response.data && err.response.data.message) {
           setError(err.response.data.message); // Errores de ValidacionException
         } else {
           setError(`Error del servidor: ${err.response.status}`);
         }
      } else {
        setError("Ocurrió un error inesperado al guardar.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- 5. 🚨 RENDERIZADO ACTUALIZADO ---
  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="edit-user-title" className="modal-title">Editar Usuario (ID: {userToEdit.id})</h2>
          
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* --- Campos Comunes --- */}
            <label> Nombre Completo <input ref={nameInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} /> </label>
            <label> Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /> </label>
            <label> Nueva Contraseña (dejar en blanco para no cambiar) <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="********" /> </label>
            
            {/* --- Campos de Alumno --- */}
            {userToEdit.rol === 'ALUMNO' && (
              <>
                <label> DNI (Alumno) <input type="text" value={dniAlumno} onChange={(e) => setDniAlumno(e.target.value)} /> </label>
                <label> Nivel
                  <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </label>
                <label> Grado <input type="text" value={grado} onChange={(e) => setGrado(e.target.value)} /> </label>
                <label> Código Estudiante <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} /> </label>
              </>
            )}

            {/* --- Campos de Profesor --- */}
            {userToEdit.rol === 'PROFESOR' && (
              <>
                <label> DNI (Profesor) <input type="text" value={dniProfesor} onChange={(e) => setDniProfesor(e.target.value)} /> </label>
                <label> Teléfono <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /> </label>
                <label> Experiencia <textarea value={experiencia} onChange={(e) => setExperiencia(e.target.value)} /> </label>
              </>
            )}
            
            <p><strong>Rol (No editable):</strong> {userToEdit.rol}</p>

            {error && <p className="auth-error" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            <div className="modal-actions">
              <button type="submit" className="btn-submit" disabled={loading}> {loading ? 'Guardando...' : 'Guardar Cambios'} </button>
              <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}> Cancelar </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}