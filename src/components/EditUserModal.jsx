// src/components/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/EditUserModal.css';

export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated }) {
  // ✅ CAMBIO: Estados separados
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  const [dniAlumno, setDniAlumno] = useState('');
  const [grado, setGrado] = useState(''); 
  const [nivel, setNivel] = useState('SECUNDARIA');
  const [codigoEstudiante, setCodigoEstudiante] = useState('');

  const [dniProfesor, setDniProfesor] = useState('');
  const [telefono, setTelefono] = useState('');
  const [experiencia, setExperiencia] = useState('');

  // --- Lógica de Grados ---
  const obtenerOpcionesGrado = () => {
      switch (nivel) {
          case 'INICIAL': return ['1', '2', '3'];
          case 'PRIMARIA': return ['1', '2', '3', '4', '5', '6'];
          case 'SECUNDARIA': return ['1', '2', '3', '4', '5'];
          default: return [];
      }
  };

  const handleNivelChange = (e) => {
      setNivel(e.target.value);
      setGrado('');
  };

  // --- Cargar datos ---
  useEffect(() => {
    if (userToEdit) {
      // ✅ CAMBIO: Cargar nombres y apellidos. Si el backend aún manda 'nombre' antiguo (por caché), lo usamos como fallback
      setNombres(userToEdit.nombres || userToEdit.nombre || '');
      setApellidos(userToEdit.apellidos || ''); // Si es antiguo, esto estará vacío y el usuario deberá llenarlo
      
      setEmail(userToEdit.email || '');
      setPassword(''); 
      setError(null);
      
      if (userToEdit.rol === 'ALUMNO') {
        setDniAlumno(userToEdit.dniAlumno || '');
        setNivel(userToEdit.nivel || 'SECUNDARIA');
        
        // Extraer número del grado (ej: "5º Grado" -> "5")
        const gradoStr = userToEdit.grado || '';
        const match = gradoStr.match(/\d+/);
        setGrado(match ? match[0] : '');

        setCodigoEstudiante(userToEdit.codigoEstudiante || '');
      }
      
      if (userToEdit.rol === 'PROFESOR') {
        setDniProfesor(userToEdit.dniProfesor || '');
        setTelefono(userToEdit.telefono || '');
        setExperiencia(userToEdit.experiencia || '');
      }

      setTimeout(() => nameInputRef.current?.focus(), 0); 
    }
  }, [userToEdit, isOpen]); 

  if (!isOpen || !userToEdit) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = `https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/usuarios/editar/${userToEdit.id}`;
    
    // Formatear grado si existe
    const gradoFinal = grado ? `${grado}º Grado` : '';

    const payload = {};
    
    // ✅ CAMBIO: Detección de cambios en nombres y apellidos
    if (nombres.trim() && nombres !== userToEdit.nombres) payload.nombres = nombres.trim();
    if (apellidos.trim() && apellidos !== userToEdit.apellidos) payload.apellidos = apellidos.trim();
    
    if (email.trim() && email !== userToEdit.email) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim(); 
    
    if (userToEdit.rol === 'ALUMNO') {
      if (grado && gradoFinal !== userToEdit.grado) payload.grado = gradoFinal;
      if (dniAlumno.trim() && dniAlumno !== userToEdit.dniAlumno) payload.dniAlumno = dniAlumno.trim();
      if (codigoEstudiante.trim() && codigoEstudiante !== userToEdit.codigoEstudiante) payload.codigoEstudiante = codigoEstudiante.trim();
      if (nivel && nivel !== userToEdit.nivel) payload.nivel = nivel;
    } 
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

    try {
      const response = await axios.put(API_URL, payload, { withCredentials: true }); 
      onUserUpdated(response.data); 
      onClose(); 
    } catch (err) {
      console.error("Error al editar usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para editar.");
         } else if (err.response.data && err.response.data.message) {
           setError(err.response.data.message); 
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

  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <h2 className="modal-title">Editar Usuario (ID: {userToEdit.id})</h2>
          
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* ✅ CAMBIO: Inputs separados */}
            <div style={{display: 'flex', gap: '10px'}}>
                <label style={{flex: 1}}> Nombres 
                    <input ref={nameInputRef} type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} /> 
                </label>
                <label style={{flex: 1}}> Apellidos 
                    <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} /> 
                </label>
            </div>

            <label> Email <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /> </label>
            <label> Nueva Contraseña <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="****" /> </label>
            
            {userToEdit.rol === 'ALUMNO' && (
              <>
                <label> DNI (Alumno) <input type="text" value={dniAlumno} onChange={(e) => setDniAlumno(e.target.value)} /> </label>
                
                <label> Nivel
                  <select value={nivel} onChange={handleNivelChange}>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </label>

                <label> Grado 
                  <select value={grado} onChange={(e) => setGrado(e.target.value)}>
                    <option value="">Selecciona grado</option>
                    {obtenerOpcionesGrado().map((g) => (
                      <option key={g} value={g}>{g}º Grado</option>
                    ))}
                  </select>
                </label>

                <label> Código Estudiante <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} /> </label>
              </>
            )}

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