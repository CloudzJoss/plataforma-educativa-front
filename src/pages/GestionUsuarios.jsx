// src/pages/GestionUsuarios.jsx
// src/pages/GestionUsuarios.jsx
import React from 'react';
import axios from 'axios';
import EditUserModal from '../components/EditUserModal.jsx'; 
import CreateUserModal from '../components/CreateUserModal.jsx'; 
import '../styles/GestionUsuarios.css'; 

function GestionUsuarios() {
  // ... (Estados sin cambios)
  const [usuarios, setUsuarios] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState(null); 
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // 1. 🚨 CAMBIO: Usar ruta relativa
  const API_URL = '/api/usuarios';

  // --- 1. Fetch de Usuarios (MODIFICADO) ---
  const fetchUsuarios = React.useCallback(async () => { 
    setLoading(true);
    setError(null);
    try {
      // 2. 🚨 ELIMINADO: Ya no necesitamos 'token' ni 'config'
      // const token = localStorage.getItem('authToken');
      // if (!token) throw new Error('No estás autenticado.');
      // const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      // 3. 🚨 CAMBIO: Petición "limpia". El navegador adjunta la cookie.
      const response = await axios.get(API_URL); // <-- SIN 'config'
      setUsuarios(response.data);
    } catch (err) {
      // ... (manejo de error sin cambios)
      console.error("Error al obtener usuarios:", err);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setError("No tienes permisos de Administrador.");
       } else {
         setError(err.message || "Error al cargar datos.");
       }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  // --- 2. Eliminar Usuario (MODIFICADO) ---
  const handleDelete = async (userId, userName) => {
    // NOTA: Usar un modal personalizado en lugar de window.confirm() sería ideal
    if (!window.confirm(`¿Eliminar a "${userName}"?`)) return;
    setError(null);
    try {
      // 4. 🚨 ELIMINADO: Ya no necesitamos 'token' ni 'config'
      // const token = localStorage.getItem('authToken');
      // const config = { headers: { 'Authorization': `Bearer ${token}` } };

      // 5. 🚨 CAMBIO: Petición "limpia"
      await axios.delete(`${API_URL}/eliminar/${userId}`); // <-- SIN 'config'
      setUsuarios(current => current.filter(user => user.id !== userId));
      // NOTA: Usar un toast/snackbar sería mejor que alert()
      alert(`Usuario "${userName}" eliminado.`);
    } catch (err) {
      // ... (manejo de error sin cambios)
      console.error(`Error al eliminar ${userId}:`, err);
       if (err.response && (err.response.status === 401 || err.response.status === 403)) {
         setError("No tienes permisos para eliminar.");
       } else {
         setError(err.message || "Error al eliminar."); 
       }
    }
  };

  // --- 3. Manejo de Edición y Creación (sin cambios) ---
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
    alert(`Usuario "${newUser.nombre}" creado. Código: ${newUser.codigoEstudiante || newUser.dni}.`);
  };

  // --- Renderizado Principal (sin cambios) ---
  if (loading && usuarios.length === 0) return <p>Cargando lista de usuarios...</p>; 
  if (error && usuarios.length === 0) return <p style={{ color: 'red' }}>Error: {error}</p>;

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

      {error && <p className="status-message error">Error: {error}</p>}
      {loading && <p className="status-message loading">Actualizando lista...</p>}
      
      <table className="styled-table"><thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th></tr></thead><tbody>{
        usuarios.length > 0 ? (
          usuarios.map(user => (
            <tr key={user.id} data-rol={user.rol}><td>{user.id}</td><td>{user.nombre}</td><td>{user.email}</td><td>{user.rol}</td><td>
              <button className="btn-edit" onClick={() => handleEdit(user)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(user.id, user.nombre)}>Eliminar</button> 
            </td></tr>
          ))
        ) : (
          <tr><td colSpan="5">{error ? 'Error al cargar usuarios.' : 'No hay usuarios registrados.'}</td></tr>
        )
      }</tbody></table>

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