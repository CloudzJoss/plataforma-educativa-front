// src/pages/GestionMatriculas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CrearMatriculaModal from '../components/CrearMatriculaModal';
import '../styles/GestionUsuarios.css'; // Usamos los mismos estilos de tablas

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function GestionMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODAS');

    const cargarMatriculas = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/api/matriculas`, { withCredentials: true });
            // Ordenar por fecha descendente (las más recientes primero)
            const dataOrdenada = response.data.sort((a, b) => new Date(b.fechaMatricula) - new Date(a.fechaMatricula));
            setMatriculas(dataOrdenada);
        } catch (err) {
            console.error(err);
            setError("Error al cargar el listado de matrículas.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMatriculas();
    }, [cargarMatriculas]);

    const handleEliminar = async (id) => {
        if (!window.confirm("¿Estás seguro de ELIMINAR esta matrícula? Esta acción borrará el registro de la base de datos.")) return;
        try {
            await axios.delete(`${BASE_URL}/api/matriculas/${id}`, { withCredentials: true });
            alert("Matrícula eliminada.");
            cargarMatriculas();
        } catch (err) {
            alert(err.response?.data?.message || "No se pudo eliminar.");
        }
    };

    const handleCambiarEstado = async (id, nuevoEstado) => {
        if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;
        try {
            await axios.patch(`${BASE_URL}/api/matriculas/${id}/estado?estado=${nuevoEstado}`, {}, { withCredentials: true });
            cargarMatriculas();
        } catch (err) {
            alert("Error al actualizar estado.");
        }
    };

    // Lógica de filtrado en cliente
    const matriculasFiltradas = matriculas.filter(m => {
        const matchSearch = 
            m.nombreAlumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.nombreSeccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchEstado = filtroEstado === 'TODAS' || m.estado === filtroEstado;

        return matchSearch && matchEstado;
    });

    const getEstadoColor = (estado) => {
        switch (estado) {
            case "ACTIVA": return "#e8f5e9"; // Verde claro
            case "RETIRADA": return "#ffebee"; // Rojo claro
            case "COMPLETADA": return "#e3f2fd"; // Azul claro
            default: return "#f5f5f5";
        }
    };

    if (loading) return <div className="gestion-container"><p>Cargando matrículas...</p></div>;

    return (
        <div className="gestion-container">
            <div className="gestion-header">
                <h1>Gestión de Matrículas</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                    + Registrar Matrícula
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* FILTROS */}
            <div className="filters-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar por alumno, sección o curso..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
                <select 
                    value={filtroEstado} 
                    onChange={e => setFiltroEstado(e.target.value)}
                    style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                    <option value="TODAS">Todos los estados</option>
                    <option value="ACTIVA">Activa</option>
                    <option value="RETIRADA">Retirada</option>
                    <option value="COMPLETADA">Completada</option>
                    <option value="REPROBADA">Reprobada</option>
                </select>
            </div>

            <div className="table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Alumno</th>
                            <th>Curso / Sección</th>
                            <th>Profesor</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {matriculasFiltradas.map(m => (
                            <tr key={m.id}>
                                <td>{m.id}</td>
                                <td>
                                    <strong>{m.nombreAlumno}</strong><br/>
                                    <small style={{color:'#666'}}>{m.dniAlumno}</small>
                                </td>
                                <td>
                                    <strong>{m.tituloCurso}</strong><br/>
                                    Sec: {m.nombreSeccion}
                                </td>
                                <td>{m.nombreProfesor}</td>
                                <td>{new Date(m.fechaMatricula).toLocaleDateString()}</td>
                                <td>
                                    <span style={{
                                        backgroundColor: getEstadoColor(m.estado),
                                        padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85em',
                                        color: m.estado === 'ACTIVA' ? '#2e7d32' : m.estado === 'RETIRADA' ? '#c62828' : '#1565c0'
                                    }}>
                                        {m.estado}
                                    </span>
                                </td>
                                <td>
                                    <div style={{display:'flex', gap:'5px'}}>
                                        {m.estado === 'ACTIVA' && (
                                            <button 
                                                className="btn-warning" 
                                                onClick={() => handleCambiarEstado(m.id, 'RETIRADA')}
                                                title="Retirar alumno"
                                            >
                                                🚫
                                            </button>
                                        )}
                                        <button 
                                            className="btn-delete" 
                                            onClick={() => handleEliminar(m.id)}
                                            title="Eliminar registro físico"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {matriculasFiltradas.length === 0 && (
                            <tr><td colSpan="7" style={{textAlign:'center', padding:'20px'}}>No se encontraron registros.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CrearMatriculaModal 
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onMatriculaCreated={cargarMatriculas}
            />
        </div>
    );
}