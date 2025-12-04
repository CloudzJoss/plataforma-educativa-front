// src/components/CreateUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import '../styles/CreateUserModal.css';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function CreateUserModal({ isOpen, onClose, onUserCreated }) {
  // ✅ CAMBIO: Estados separados para nombres y apellidos
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('ALUMNO'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); 

  const [dniAlumno, setDniAlumno] = useState('');
  const [grado, setGrado] = useState(''); 
  const [nivel, setNivel] = useState('SECUNDARIA');

  const [dniProfesor, setDniProfesor] = useState('');
  const [telefono, setTelefono] = useState('');
  const [experiencia, setExperiencia] = useState('');

  // --- Lógica de Grados Dinámicos ---
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
      setGrado(''); // Resetear grado al cambiar nivel
  };

  useEffect(() => {
    if (isOpen) {
      setNombres(''); setApellidos(''); // ✅ Resetear nuevos campos
      setEmail(''); setPassword(''); setRol('ALUMNO');
      setError(null);
      setDniAlumno(''); setGrado(''); setNivel('SECUNDARIA');
      setDniProfesor(''); setTelefono(''); setExperiencia('');
      
      setTimeout(() => nameInputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const API_URL = `${BASE_URL}/api/usuarios/crear`;
    
    if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }

    // Formatear grado para enviar (Ej: "5º Grado")
    const gradoFinal = grado ? `${grado}º Grado` : '';

    // ✅ CAMBIO: Payload ahora envía nombres y apellidos
    const payload = {
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.trim(),
      password: password,
      rol: rol,
    };

    if (rol === 'ALUMNO') {
      if (!dniAlumno.trim() || dniAlumno.length < 8) {
        setError('El DNI del alumno debe tener al menos 8 caracteres.');
        setLoading(false);
        return;
      }
      if (!grado || !nivel) {
        setError('Grado y Nivel son obligatorios.');
        setLoading(false);
        return;
      }
      payload.dniAlumno = dniAlumno.trim();
      payload.nivel = nivel;
      payload.grado = gradoFinal;
    } else if (rol === 'PROFESOR') {
      if (!dniProfesor.trim() || dniProfesor.length < 8) {
        setError('El DNI del profesor debe tener al menos 8 caracteres.');
        setLoading(false);
        return;
      }
      payload.dniProfesor = dniProfesor.trim();
      if (telefono.trim()) payload.telefono = telefono.trim();
      if (experiencia.trim()) payload.experiencia = experiencia.trim();
    }
    
    try {
      const response = await axios.post(API_URL, payload, { withCredentials: true }); 
      onUserCreated(response.data);
      onClose(); 
    } catch (err) {
      console.error("Error al crear usuario:", err);
      if (err.response) {
         if (err.response.status === 400) {
            const backendMsg = err.response.data.message || "";
            if (backendMsg.includes("JSON parse error")) {
                setError("Error interno: Datos inválidos.");
            } else {
                setError(backendMsg || "Datos inválidos (400).");
            }
         } else if (err.response.status === 401 || err.response.status === 403) {
            setError("No tienes permisos de Administrador.");
         } else { 
            setError(err.response.data?.message || `Error del servidor: ${err.response.status}`);
         }
      } else {
        setError("Ocurrió un error de conexión.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="modal-body">
          <h2 className="modal-title">Crear Nuevo Usuario</h2>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* ✅ CAMBIO: Inputs separados para Nombres y Apellidos */}
            <div style={{display: 'flex', gap: '10px'}}>
                <label style={{flex: 1}}> Nombres* <input ref={nameInputRef} type="text" value={nombres} onChange={(e) => setNombres(e.target.value)} required /> 
                </label>
                <label style={{flex: 1}}> Apellidos* <input type="text" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required /> 
                </label>
            </div>

            <label> Email* <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /> </label>
            <label> Contraseña* (Mín. 6 caracteres) <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /> </label>
            <label> Rol*
              <select value={rol} onChange={(e) => setRol(e.target.value)} required>
                <option value="ALUMNO">Alumno</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ADMINISTRADOR">Administrador</option> 
              </select>
            </label>

            {rol === 'ALUMNO' && (
              <>
                <label> DNI (Alumno)* <input type="text" value={dniAlumno} onChange={(e) => setDniAlumno(e.target.value)} required placeholder="Mínimo 8 dígitos" /> </label>
                
                {/* SELECT DE NIVEL */}
                <label> Nivel*
                  <select value={nivel} onChange={handleNivelChange} required>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </label>

                {/* SELECT DE GRADO DINÁMICO */}
                <label> Grado* <select value={grado} onChange={(e) => setGrado(e.target.value)} required>
                    <option value="">Selecciona grado</option>
                    {obtenerOpcionesGrado().map((g) => (
                      <option key={g} value={g}>{g}º Grado</option>
                    ))}
                  </select>
                </label>
              </>
            )}

            {rol === 'PROFESOR' && (
              <>
                <label> DNI (Profesor)* <input type="text" value={dniProfesor} onChange={(e) => setDniProfesor(e.target.value)} required placeholder="Mínimo 8 dígitos" /> </label>
                <label> Teléfono <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} /> </label>
                <label> Experiencia <textarea value={experiencia} onChange={(e) => setExperiencia(e.target.value)} /> </label>
              </>
            )}
            
            {error && <div className="auth-error" style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>{error}</div>}

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