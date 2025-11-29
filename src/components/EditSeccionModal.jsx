// src/pages/GestionSecciones.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateSeccionModal from '../components/CreateSeccionModal';
import EditSeccionModal from '../components/EditSeccionModal';
import '../styles/GestionUsuarios.css'; 

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function GestionSecciones() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [seccionToEdit, setSeccionToEdit] = useState(null);

    const [filtroNivel, setFiltroNivel] = useState('TODOS');
    const [filtroGrado, setFiltroGrado] = useState('TODOS');
    const [filtroActiva, setFiltroActiva] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarSecciones();
    }, []);
 
    const cargarSecciones = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones`, {
                withCredentials: true
            });
            setSecciones(response.data);
        } catch (err) {
            console.error('Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones');
        } finally {
            setLoading(false);
        }
    };

    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel = filtroNivel === 'TODOS' || seccion.nivelSeccion === filtroNivel;
        
        const coincideGrado = filtroGrado === 'TODOS' || 
            (seccion.gradoSeccion && seccion.gradoSeccion.toString().includes(filtroGrado));

        const coincideActiva = filtroActiva === 'TODOS' || 
            (filtroActiva === 'ACTIVA' ? seccion.activa : !seccion.activa);
            
        const coincideBusqueda = 
            seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.nombreProfesor.toLowerCase().includes(searchTerm.toLowerCase());

        return coincideNivel && coincideGrado && coincideActiva && coincideBusqueda;
    });

    const handleSeccionCreated = (nuevaSeccion) => {
        setSecciones([...secciones, nuevaSeccion]);
    };

    const handleSeccionUpdated = (seccionActualizada) => {
        setSecciones(secciones.map(s => 
            s.id === seccionActualizada.id ? seccionActualizada : s
        ));
    };

    const handleEdit = (seccion) => {
        setSeccionToEdit(seccion);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sección?')) return;
        try {
            await axios.delete(`${BASE_URL}/api/secciones/${id}`, { withCredentials: true });
            setSecciones(secciones.filter(s => s.id !== id));
            alert('Sección eliminada exitosamente');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'No se pudo eliminar la sección';
            alert(errorMsg);
        }
    };

    const handleToggleActiva = async (seccion) => {
        const accion = seccion.activa ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Estás seguro de ${accion} esta sección?`)) return;

        try {
            const endpoint = seccion.activa ? 'desactivar' : 'activar';
            await axios.patch(`${BASE_URL}/api/secciones/${seccion.id}/${endpoint}`, {}, { withCredentials: true });
            
            setSecciones(secciones.map(s => 
                s.id === seccion.id ? { ...s, activa: !s.activa } : s
            ));
            alert(`Sección ${accion}da exitosamente`);
        } catch (err) {
            const errorMsg = err.response?.data?.message || `No se pudo ${accion} la sección`;
            alert(errorMsg);
        }
    };

    // Helper para formatear la hora (14:00:00 -> 14:00)
    const formatHora = (hora) => hora ? hora.substring(0, 5) : '';

    if (loading) return <div className="gestion-container"><p>Cargando...</p></div>;
    if (error) return <div className="gestion-container"><div className="error-message">{error}</div></div>;

    return (
        <div className="gestion-container">
            <div className="gestion-header">
                <h1>Gestión de Secciones</h1>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">+ Nueva Sección</button>
            </div>

            {/* Filtros (Sin cambios estructurales) */}
            <div className="filters-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div><label>Buscar:</label><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }} /></div>
                
                <div><label>Nivel:</label>
                    <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="TODOS">Todos</option>
                        <option value="INICIAL">Inicial</option>
                        <option value="PRIMARIA">Primaria</option>
                        <option value="SECUNDARIA">Secundaria</option>
                    </select>
                </div>

                <div><label>Grado:</label>
                    <select value={filtroGrado} onChange={(e) => setFiltroGrado(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="TODOS">Todos</option>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}º Grado</option>)}
                    </select>
                </div>

                <div><label>Estado:</label>
                    <select value={filtroActiva} onChange={(e) => setFiltroActiva(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}>
                        <option value="TODOS">Todos</option>
                        <option value="ACTIVA">Activas</option>
                        <option value="INACTIVA">Inactivas</option>
                    </select>
                </div>
            </div>

            {/* Tabla de secciones */}
            <div className="table-container">
                {seccionesFiltradas.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No se encontraron secciones.</p>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Curso</th>
                                <th>Nivel/Grado</th>
                                <th>Horarios</th> {/* 🔄 CAMBIO AQUÍ */}
                                <th>Profesor</th>
                                <th>Cupo</th>
                                <th>Periodo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seccionesFiltradas.map((seccion) => (
                                <tr key={seccion.id}>
                                    <td><strong>{seccion.codigo}</strong></td>
                                    <td>{seccion.nombre}</td>
                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>
                                            <strong>{seccion.codigoCurso}</strong><br />
                                            <span style={{ color: '#666' }}>{seccion.tituloCurso}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>
                                            {seccion.nivelSeccion}<br />
                                            <strong>{seccion.gradoSeccion}</strong>
                                        </div>
                                    </td>
                                    
                                    {/* 🕒 COLUMNA DE HORARIOS */}
                                    <td>
                                        {seccion.horarios && seccion.horarios.length > 0 ? (
                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85em' }}>
                                                {seccion.horarios.map((h, idx) => (
                                                    <li key={idx} style={{ marginBottom: '2px' }}>
                                                        <strong>{h.diaSemana.substring(0, 3)}:</strong> {formatHora(h.horaInicio)} - {formatHora(h.horaFin)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '0.85em' }}>Sin horarios</span>
                                        )}
                                    </td>

                                    <td>
                                        <div style={{ fontSize: '0.9em' }}>
                                            {seccion.nombreProfesor}<br />
                                            <span style={{ color: '#666' }}>{seccion.dniProfesor}</span>
                                        </div>
                                    </td>
                                    <td style={{ textAlign: 'center', fontSize: '0.9em' }}>
                                        <strong>{seccion.estudiantesMatriculados}/{seccion.capacidad}</strong>
                                    </td>
                                    <td style={{ fontSize: '0.85em' }}>
                                        {new Date(seccion.fechaInicio).toLocaleDateString()}<br />
                                        {new Date(seccion.fechaFin).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em', backgroundColor: seccion.activa ? '#e8f5e9' : '#ffebee', color: seccion.activa ? '#2e7d32' : '#c62828' }}>
                                            {seccion.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => handleEdit(seccion)} className="btn-edit">✏️</button>
                                            <button onClick={() => handleToggleActiva(seccion)} className={seccion.activa ? 'btn-warning' : 'btn-success'}>{seccion.activa ? '🔒' : '🔓'}</button>
                                            <button onClick={() => handleDelete(seccion.id)} className="btn-delete" disabled={seccion.estudiantesMatriculados > 0}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <CreateSeccionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSeccionCreated={handleSeccionCreated} />
            
            <EditSeccionModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSeccionToEdit(null); }} seccionToEdit={seccionToEdit} onSeccionUpdated={handleSeccionUpdated} />
        </div>
    );
}