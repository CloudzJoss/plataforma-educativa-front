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
      {/* Header reutilizando estilos globales */}
      <div className="gestion-header">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="subtitle">
            Administra los usuarios registrados en la plataforma.
          </p>
        </div>

        <button
          className="btn-create"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Crear nuevo usuario
        </button>
      </div>

      {/* Mensaje de error global */}
      {error && (
        <div className="status-message error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Estado de carga */}
      {loading && usuarios.length === 0 && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Cargando lista de usuarios...</p>
        </div>
      )}

      {/* Tabla */}
      {!loading && (
        <div className="table-container">
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
                usuarios.map((user) => (
                  <tr key={user.id} data-rol={user.rol}>
                    <td>{user.id}</td>
                    <td>{user.nombre}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-pill role-${user.rol.toLowerCase()}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() =>
                          handleDelete(user.id, user.nombre)
                        }
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                !error && (
                  <tr>
                    <td colSpan="5" className="empty-state-table">
                      <div>📋</div>
                      <p>No hay usuarios registrados todavía.</p>
                      <small>Usa el botón “Crear nuevo usuario” para comenzar.</small>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}

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