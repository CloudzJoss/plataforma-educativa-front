//src/components/EditUserModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Importa los estilos del modal de login si quieres reutilizarlos
import '../styles/EditUserModal.css'; 

// Recibe:
// - isOpen: boolean para mostrar/ocultar
// - onClose: función para cerrar el modal
// - userToEdit: objeto con los datos del usuario actual
// - onUserUpdated: función para notificar al componente padre que se actualizó un usuario
export default function EditUserModal({ isOpen, onClose, userToEdit, onUserUpdated }) {
  // Estados para los campos del formulario, inicializados con los datos del usuario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Opcional para cambiar contraseña
  const [carrera, setCarrera] = useState('');
  const [codigoEstudiante, setCodigoEstudiante] = useState('');
  const [departamento, setDepartamento] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nameInputRef = useRef(null); // Para enfocar el primer campo

  // Cuando el modal se abre o cambia el usuario a editar, actualiza los estados del formulario
  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre || '');
      setEmail(userToEdit.email || '');
      setPassword(''); // La contraseña no se precarga por seguridad
      setCarrera(userToEdit.carrera || '');
      setCodigoEstudiante(userToEdit.codigoEstudiante || '');
      setDepartamento(userToEdit.departamento || '');
      // Enfocar el primer input al abrir
      setTimeout(() => nameInputRef.current?.focus(), 0); 
    }
     // Limpiar errores al abrir/cambiar usuario
    setError(null);
  }, [userToEdit, isOpen]); 

  // Si no está abierto o no hay usuario, no renderizar nada
  if (!isOpen || !userToEdit) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Endpoint para editar (PUT /api/usuarios/editar/{id})
    const API_URL = `http://localhost:8081/api/usuarios/editar/${userToEdit.id}`;
    const token = localStorage.getItem('authToken');

    if (!token) {
      setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
      setLoading(false);
      return;
    }

    // Construir el payload (UsuarioUpdateDTO) - Solo enviamos campos con valor
    const payload = {};
    if (nombre.trim() && nombre !== userToEdit.nombre) payload.nombre = nombre.trim();
    if (email.trim() && email !== userToEdit.email) payload.email = email.trim();
    if (password.trim()) payload.password = password.trim(); // Solo si se ingresa nueva contraseña
    if (carrera.trim() && carrera !== userToEdit.carrera) payload.carrera = carrera.trim();
    if (codigoEstudiante.trim() && codigoEstudiante !== userToEdit.codigoEstudiante) payload.codigoEstudiante = codigoEstudiante.trim();
    if (departamento.trim() && departamento !== userToEdit.departamento) payload.departamento = departamento.trim();
    
    // Si no hay cambios, no hacer la petición (opcional)
    if (Object.keys(payload).length === 0) {
        setError("No se realizaron cambios.");
        setLoading(false);
        return;
    }


    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const response = await axios.put(API_URL, payload, config);

      // Notificar al componente padre sobre la actualización
      onUserUpdated(response.data); 
      onClose(); // Cerrar el modal

    } catch (err) {
      console.error("Error al editar usuario:", err);
      if (err.response) {
         if (err.response.status === 401 || err.response.status === 403) {
           setError("No tienes permisos para editar.");
         } else if (err.response.data && err.response.data.message) {
           setError(`Error del servidor: ${err.response.data.message}`); // Mensaje de error del backend
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

  return (
    // Reutilizamos la estructura del BaseModal si es posible
    <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
      <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-user-title">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <h2 id="edit-user-title" className="modal-title">Editar Usuario (ID: {userToEdit.id})</h2>
          
          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Campos del formulario */}
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
                  Carrera
                  <input type="text" value={carrera} onChange={(e) => setCarrera(e.target.value)} />
                </label>
                <label>
                  Código Estudiante
                  <input type="text" value={codigoEstudiante} onChange={(e) => setCodigoEstudiante(e.target.value)} />
                </label>
              </>
            )}
            {userToEdit.rol === 'PROFESOR' && (
              <label>
                Departamento
                <input type="text" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
              </label>
            )}
            {/* No permitimos cambiar el ROL aquí */}
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
