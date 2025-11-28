// src/pages/GestionUsuarios.jsx
import React from 'react';
import axios from 'axios';
import EditUserModal from '../components/EditUserModal.jsx'; 
import CreateUserModal from '../components/CreateUserModal.jsx'; 
import '../styles/GestionUsuarios.css'; 

function GestionUsuarios() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  
  // Estados de Modales
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null); 
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // URL del Backend
  const API_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/usuarios';

  // --- 1. Fetch de Usuarios ---
  const fetchUsuarios = React.useCallback(async () => { 
    setLoading(true);
    setError(null);
    try {
      // ✅ IMPORTANTE: { withCredentials: true } permite enviar la cookie de sesión
      const response = await axios.get(API_URL, { withCredentials: true });
      setUsuarios(response.data);
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setError("No tienes permisos de Administrador o tu sesión expiró.");
       } else {
         setError("No se pudo cargar la lista de usuarios.");
       }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // --- 2. Eliminar Usuario (LÓGICA MEJORADA) ---
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"?`)) return;
    
    setError(null);

    try {
      // ✅ IMPORTANTE: { withCredentials: true }
      await axios.delete(`${API_URL}/eliminar/${userId}`, { withCredentials: true });
      
      // Actualizar estado local si tuvo éxito
      setUsuarios(current => current.filter(user => user.id !== userId));
      alert(`Usuario "${userName}" eliminado correctamente.`);

    } catch (err) {
      console.error(`Error al eliminar ${userId}:`, err);
      
      // --- CAPTURA DE MENSAJES DE ERROR DEL BACKEND ---
      if (err.response) {
          const status = err.response.status;
          // El backend puede enviar el mensaje en .data.message o directamente en .data
          const serverMsg = err.response.data?.message || err.response.data || "Error desconocido";

          if (status === 400 || status === 500) {
              // Aquí caen las ValidacionException (Integridad Referencial)
              // Ej: "No se puede eliminar al profesor X porque tiene cursos..."
              alert(`⛔ NO SE PUEDE ELIMINAR:\n${serverMsg}`);
          } else if (status === 401 || status === 403) {
              alert("⛔ No tienes permisos para realizar esta acción.");
          } else {
              setError(`Error (${status}): ${serverMsg}`); 
          }
      } else {
          setError("Error de conexión al intentar eliminar.");
      }
    }
  };

  // --- 3. Manejo de Edición y Creación ---
  const handleEdit = (user) => {
    setEditingUser(user); 
    setIsEditModalOpen(true); 
  };

  const handleUserUpdated = (updatedUser) => {
    setUsuarios(currentUsers => 
      currentUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    alert(`Usuario "${updatedUser.nombre}" actualizado.`); 
  };

  const handleUserCreated = (newUser) => {
    setUsuarios(currentUsers => [newUser, ...currentUsers]); 
    alert(`Usuario "${newUser.nombre}" creado exitosamente.`);
  };

  // --- Renderizado Principal ---
  if (loading && usuarios.length === 0) return <p className="status-message loading">Cargando lista de usuarios...</p>; 
  
  return (
    <div className="gestion-usuarios-container"> 
      <h2>Gestión de Usuarios</h2>
      <p>Administra los usuarios registrados en la plataforma.</p>
      
      <button 
        className="btn-create" 
        style={{ marginBottom: '15px' }}
        onClick={() => setIsCreateModalOpen(true)}
      >
        + Crear Nuevo Usuario
      </button>

      {/* Mensaje de error global en la parte superior */}
      {error && (
        <div style={{ 
            backgroundColor: '#ffebee', 
            color: '#c62828', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #ef5350'
        }}>
            ⚠️ {error}
        </div>
      )}
      
      <table className="styled-table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
        {usuarios.length > 0 ? (
          usuarios.map(user => (
            <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.nombre}</td>
                <td>{user.email}</td>
                <td>
                    {/* Badge simple para el rol */}
                    <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        fontSize: '0.85em',
                        backgroundColor: user.rol === 'ALUMNO' ? '#e3f2fd' : user.rol === 'PROFESOR' ? '#fff3e0' : '#e8f5e9',
                        color: user.rol === 'ALUMNO' ? '#1565c0' : user.rol === 'PROFESOR' ? '#e65100' : '#2e7d32',
                        fontWeight: 'bold'
                    }}>
                        {user.rol}
                    </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(user)}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDelete(user.id, user.nombre)}>Eliminar</button> 
                </td>
            </tr>
          ))
        ) : (
          !error && <tr><td colSpan="5">No hay usuarios registrados.</td></tr>
        )}
        </tbody>
      </table>

      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <EditUserModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)} 
        userToEdit={editingUser} 
        onUserUpdated={handleUserUpdated} 
      />
    </div>
  );
}

export default GestionUsuarios;