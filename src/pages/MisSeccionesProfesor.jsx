// src/pages/MisSeccionesProfesor.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 👈 IMPORTANTE
import '../styles/MisSeccionesProfesor.css';

export default function MisSeccionesProfesor() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const navigate = useNavigate(); // Hook para navegar

    const cargarMisSecciones = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Cargando secciones del profesor autenticado...');
            const response = await axios.get(
                `https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/secciones/mis-secciones`,
                { withCredentials: true }
            );
            console.log('✅ Secciones cargadas:', response.data);
            setSecciones(response.data);
        } catch (err) {
            console.error('❌ Error al cargar secciones:', err);
            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                if (status === 404) {
                    setError('No se encontraron secciones asignadas a tu cuenta.');
                } else if (status === 401 || status === 403) {
                    setError('No tienes permisos para ver esta información. Por favor, inicia sesión nuevamente.');
                } else {
                    setError(errorData?.message || 'Error al cargar las secciones');
                }
            } else {
                setError(err.message || 'No se pudo conectar con el servidor');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMisSecciones();
    }, [cargarMisSecciones]);

    const seccionesFiltradas = secciones.filter((seccion) =>
        seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seccion.gradoSeccion.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const seccionesActivas = secciones.filter(s => s.activa).length;
    const totalEstudiantes = secciones.reduce((acc, s) => acc + (s.estudiantesMatriculados || 0), 0);

    const getTurnoColor = (turno) => {
        switch(turno) {
            case 'MAÑANA': return '#ff9800';
            case 'TARDE': return '#2196f3';
            case 'NOCHE': return '#9c27b0';
            default: return '#757575';
        }
    };

    const formatFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatearHorarios = (horarios) => {
        if (!horarios || horarios.length === 0) return 'Sin horarios asignados';
        return horarios.map((h, idx) => (
            <div key={idx} style={{ fontSize: '0.85em', marginBottom: '4px', padding: '4px 0' }}>
                <strong>{h.diaSemana.substring(0, 3)}:</strong> {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
            </div>
        ));
    };

    if (loading) return <div className="mis-secciones-container"><div className="loading-container"><div className="spinner"></div><p>Cargando tus secciones asignadas...</p></div></div>;
    
    if (error) return (
        <div className="mis-secciones-container">
            <div className="error-container">
                <div className="error-icon">⚠️</div>
                <h3>Error al cargar las secciones</h3>
                <p>{error}</p>
                <div className="error-actions">
                    <button onClick={cargarMisSecciones} className="btn-retry">🔄 Reintentar</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mis-secciones-container">
            <div className="secciones-header">
                <div>
                    <h1>Mis Secciones</h1>
                    <p className="subtitle">Cursos asignados / Pregrado</p>
                </div>
                <button onClick={cargarMisSecciones} className="btn-refresh">🔄 Actualizar</button>
            </div>

            {secciones.length > 0 && (
                <div className="stats-container">
                    <div className="stat-card"><div className="stat-number">{secciones.length}</div><div className="stat-label">Total Secciones</div></div>
                    <div className="stat-card"><div className="stat-number">{seccionesActivas}</div><div className="stat-label">Activas</div></div>
                    <div className="stat-card"><div className="stat-number">{totalEstudiantes}</div><div className="stat-label">Estudiantes</div></div>
                </div>
            )}
            {secciones.length > 0 && (
                <div className="search-container">
                    <input type="text" placeholder="🔍 Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                </div>
            )}

            {secciones.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">📚</div><h2>No tienes secciones asignadas</h2><p>Contacta al administrador.</p></div>
            ) : seccionesFiltradas.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">🔍</div><h2>No se encontraron resultados</h2></div>
            ) : (
                <div className="secciones-grid">
                    {seccionesFiltradas.map((seccion) => (
                        <div key={seccion.id} className="seccion-card">
                            <div className="card-header">
                                <div className="card-icon"><span>📚</span></div>
                                <div className="card-title-section">
                                    <h3 className="card-title">{seccion.tituloCurso}</h3>
                                    <p className="card-subtitle">{seccion.nivelSeccion} - {seccion.gradoSeccion}</p>
                                </div>
                                <span className="turno-badge" style={{ backgroundColor: getTurnoColor(seccion.turno) }}>
                                    {seccion.turno || 'Presencial'}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-row"><span className="info-label">Código:</span><span className="info-value">{seccion.codigo}</span></div>
                                <div className="info-row"><span className="info-label">Nivel:</span><span className="info-value">{seccion.nivelSeccion}</span></div>
                                <div className="info-row"><span className="info-label">Aula:</span><span className="info-value">{seccion.aula || 'Sin asignar'}</span></div>
                                <div className="info-row">
                                    <span className="info-label">🕒 Horarios:</span>
                                    <span className="info-value" style={{ display: 'block', marginTop: '4px' }}>{formatearHorarios(seccion.horarios)}</span>
                                </div>
                                <div className="info-row"><span className="info-label">Capacidad:</span><span className="info-value">{seccion.estudiantesMatriculados}/{seccion.capacidad} estudiantes</span></div>
                            </div>

                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item"><span className="fecha-label">Inicio:</span><span className="fecha-value">{formatFecha(seccion.fechaInicio)}</span></div>
                                    <div className="fecha-item"><span className="fecha-label">Fin:</span><span className="fecha-value">{formatFecha(seccion.fechaFin)}</span></div>
                                </div>
                                
                                <div className="card-actions">
                                    <span className={`status-badge ${seccion.activa ? 'active' : 'inactive'}`}>
                                        {seccion.activa ? 'Activo' : 'Inactivo'}
                                    </span>
                                    
                                    {/* 🚀 BOTÓN NUEVO: GESTIONAR AULA */}
                                    <button 
                                        className="btn-ingresar" 
                                        onClick={() => navigate(`/dashboard/aula/${seccion.id}`)}
                                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                        👨‍🏫 Gestionar Aula
                                    </button>
                                </div>
                            </div>
                            
                            <div className="estudiantes-badge">
                                <span className="estudiantes-icon">👥</span>
                                <span className="estudiantes-text">{seccion.estudiantesMatriculados || 0}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}