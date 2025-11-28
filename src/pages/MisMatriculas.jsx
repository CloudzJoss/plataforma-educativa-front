// src/pages/MisMatriculas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MisSeccionesProfesor.css';

export default function MisMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("TODAS");

    const URL_BASE = "https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net";

    const cargarMisMatriculas = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${URL_BASE}/api/matriculas/mis-matriculas`,
                { withCredentials: true }
            );
            setMatriculas(response.data);
        } catch (err) {
            const msg = err.response?.data?.message || "Error al cargar matrículas";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMisMatriculas();
    }, [cargarMisMatriculas]);

    // --- 🗑️ NUEVA FUNCIÓN: ELIMINAR MATRÍCULA ---
    const handleEliminar = async (seccionId) => {
        // Confirmación fuerte
        if (!window.confirm("¿Estás seguro de cancelar tu inscripción? Esta acción eliminará el registro del curso.")) {
            return;
        }

        try {
            // Llamamos al nuevo endpoint de eliminar
            await axios.delete(
                `${URL_BASE}/api/matriculas/eliminar/${seccionId}`, 
                { withCredentials: true }
            );

            alert("Inscripción cancelada exitosamente.");
            // Recargamos la lista para que desaparezca la tarjeta
            cargarMisMatriculas(); 
        } catch (err) {
            const msg = err.response?.data?.message || "Error al eliminar la matrícula";
            alert(msg);
        }
    };

    const matriculasFiltradas = matriculas.filter((m) => {
        if (filtroEstado === "TODAS") return true;
        return m.estado === filtroEstado;
    });

    const getEstadoColor = (estado) => {
        switch (estado) {
            case "ACTIVA": return "#4caf50";
            case "RETIRADA": return "#f44336";
            case "COMPLETADA": return "#2196f3";
            default: return "#757575";
        }
    };

    const getTurnoColor = (turno) => {
        switch (turno) {
            case "MAÑANA": return "#ff9800";
            case "TARDE": return "#2196f3";
            case "NOCHE": return "#9c27b0";
            default: return "#757575";
        }
    };

    if (loading) {
        return (
            <div className="mis-secciones-container">
                <div className="loading-container"><div className="spinner"></div><p>Cargando...</p></div>
            </div>
        );
    }

    return (
        <div className="mis-secciones-container">
            <div className="secciones-header">
                <div>
                    <h1>Mis Matrículas</h1>
                    <p className="subtitle">Historial académico y cursos activos</p>
                </div>
                <button onClick={cargarMisMatriculas} className="btn-refresh">🔄 Actualizar</button>
            </div>

            {error && <div className="error-box">⚠️ {error}</div>}

            <div style={{marginBottom: '20px'}}>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="search-input"
                    style={{maxWidth: '300px'}}
                >
                    <option value="TODAS">Todas las matrículas</option>
                    <option value="ACTIVA">Activas</option>
                    <option value="COMPLETADA">Completadas</option>
                </select>
            </div>

            {matriculasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No tienes matrículas registradas</h2>
                    <button onClick={() => window.location.href = "/dashboard/secciones-disponibles"} className="btn-ingresar" style={{marginTop:'15px'}}>
                        🔍 Buscar Cursos
                    </button>
                </div>
            ) : (
                <div className="secciones-grid">
                    {matriculasFiltradas.map((m) => (
                        <div key={m.id} className="seccion-card">
                            <div className="card-header">
                                <div className="card-icon">📚</div>
                                <div className="card-title-section">
                                    <h3 className="card-title">{m.tituloCurso}</h3>
                                    <p className="card-subtitle">{m.nivelCurso} - {m.gradoAlumno || m.gradoCurso}</p>
                                </div>
                                <span className="turno-badge" style={{ backgroundColor: getTurnoColor(m.turnoSeccion) }}>
                                    {m.turnoSeccion}
                                </span>
                            </div>

                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Código:</span>
                                    <span className="info-value">{m.codigoSeccion}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Profesor:</span>
                                    <span className="info-value">{m.nombreProfesor}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Aula:</span>
                                    <span className="info-value">{m.aulaSeccion || 'Virtual'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Estado:</span>
                                    <span className="info-value" style={{ fontWeight: 'bold', color: getEstadoColor(m.estado) }}>
                                        {m.estado}
                                    </span>
                                </div>
                                {m.calificacionFinal !== null && (
                                    <div className="info-row" style={{ marginTop: '10px', paddingTop: '5px', borderTop: '1px solid #eee' }}>
                                        <span className="info-label">Nota Final:</span>
                                        <span className="info-value" style={{ fontWeight: 'bold', color: m.calificacionFinal >= 11 ? '#4caf50' : '#f44336' }}>
                                            {m.calificacionFinal}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item">
                                        <span className="fecha-label">Inicio:</span>
                                        <span className="fecha-value">{m.fechaInicioSeccion ? new Date(m.fechaInicioSeccion).toLocaleDateString("es-ES") : '---'}</span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {/* 🗑️ BOTÓN DE ELIMINAR / DARSE DE BAJA */}
                                    {m.estado === "ACTIVA" ? (
                                        <button
                                            className="btn-ingresar"
                                            onClick={() => handleEliminar(m.seccionId)}
                                            style={{ backgroundColor: "#d32f2f", width: '100%' }} // Rojo más oscuro
                                        >
                                            🗑️ Darse de baja
                                        </button>
                                    ) : (
                                        <button className="btn-ingresar" disabled style={{ backgroundColor: "#e0e0e0", color: "#888", width: '100%', cursor: 'default' }}>
                                            🔒 Curso Cerrado
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Corrección del Badge para que no tape el título */}
                            <div className="estudiantes-badge" style={{ 
                                top: '-10px', 
                                right: '-5px', 
                                left: 'auto', 
                                bottom: 'auto',
                                fontSize: '0.7em',
                                padding: '4px 8px',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                📅 {new Date(m.fechaMatricula).toLocaleDateString("es-ES")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}