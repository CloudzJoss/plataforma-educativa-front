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

    // --- 🗑️ FUNCIÓN: ELIMINAR MATRÍCULA ---
    const handleEliminar = async (seccionId) => {
        // Confirmación fuerte
        if (!window.confirm("¿Estás seguro de cancelar tu inscripción? Esta acción eliminará el registro del curso.")) {
            return;
        }

        try {
            await axios.delete(
                `${URL_BASE}/api/matriculas/eliminar/${seccionId}`, 
                { withCredentials: true }
            );

            alert("Inscripción cancelada exitosamente.");
            cargarMisMatriculas(); 
        } catch (err) {
            const msg = err.response?.data?.message || "Error al eliminar la matrícula";
            alert(msg);
        }
    };

    // --- FUNCIÓN: RETIRARSE (Sin eliminar) ---
    const handleRetirarse = async (seccionId) => {
        if (!window.confirm("¿Estás seguro de retirarte de este curso?")) {
            return;
        }

        try {
            await axios.delete(
                `${URL_BASE}/api/matriculas/retirarse/${seccionId}`, 
                { withCredentials: true }
            );

            alert("Te has retirado del curso exitosamente.");
            cargarMisMatriculas(); 
        } catch (err) {
            const msg = err.response?.data?.message || "Error al retirarse del curso";
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
            case "REPROBADA": return "#ff9800";
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

    // 🕒 NUEVA FUNCIÓN: Formatear horarios
    const formatearHorarios = (horarios) => {
        if (!horarios || horarios.length === 0) {
            return <span style={{ color: '#999', fontSize: '0.85em' }}>Sin horarios</span>;
        }

        return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {horarios.map((h, idx) => (
                    <li key={idx} style={{ fontSize: '0.85em', marginBottom: '3px' }}>
                        <strong>{h.diaSemana.substring(0, 3)}:</strong> {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                    </li>
                ))}
            </ul>
        );
    };

    if (loading) {
        return (
            <div className="mis-secciones-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tus matrículas...</p>
                </div>
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
                <button onClick={cargarMisMatriculas} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {error && (
                <div className="error-box" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px' }}>
                    ⚠️ {error}
                </div>
            )}

            <div style={{ marginBottom: '20px' }}>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="search-input"
                    style={{ maxWidth: '300px' }}
                >
                    <option value="TODAS">Todas las matrículas</option>
                    <option value="ACTIVA">Activas</option>
                    <option value="COMPLETADA">Completadas</option>
                    <option value="REPROBADA">Reprobadas</option>
                    <option value="RETIRADA">Retiradas</option>
                </select>
            </div>

            {matriculasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No tienes matrículas registradas</h2>
                    <p>Explora los cursos disponibles y matricúlate en alguno.</p>
                    <button 
                        onClick={() => window.location.href = "/dashboard/secciones-disponibles"} 
                        className="btn-ingresar" 
                        style={{ marginTop: '15px' }}
                    >
                        🔍 Buscar Cursos
                    </button>
                </div>
            ) : (
                <div className="secciones-grid">
                    {matriculasFiltradas.map((m) => (
                        <div key={m.id} className="seccion-card">
                            {/* Header de la tarjeta */}
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

                            {/* Cuerpo de la tarjeta */}
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

                                {/* 🕒 NUEVA SECCIÓN: HORARIOS */}
                                <div className="info-row">
                                    <span className="info-label">🕒 Horarios:</span>
                                    <span className="info-value" style={{ display: 'block', marginTop: '4px' }}>
                                        {formatearHorarios(m.horariosSeccion)}
                                    </span>
                                </div>

                                <div className="info-row">
                                    <span className="info-label">Estado:</span>
                                    <span className="info-value" style={{ fontWeight: 'bold', color: getEstadoColor(m.estado) }}>
                                        {m.estado}
                                    </span>
                                </div>

                                {/* Calificación si existe */}
                                {m.calificacionFinal !== null && (
                                    <div className="info-row" style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
                                        <span className="info-label">📊 Nota Final:</span>
                                        <span className="info-value" style={{ 
                                            fontWeight: 'bold', 
                                            color: m.calificacionFinal >= 10.5 ? '#4caf50' : '#f44336',
                                            fontSize: '1.1em'
                                        }}>
                                            {m.calificacionFinal}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Pie de la tarjeta */}
                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item">
                                        <span className="fecha-label">Inicio:</span>
                                        <span className="fecha-value">
                                            {m.fechaInicioSeccion ? new Date(m.fechaInicioSeccion).toLocaleDateString("es-ES") : '---'}
                                        </span>
                                    </div>
                                    {m.fechaFinSeccion && (
                                        <div className="fecha-item">
                                            <span className="fecha-label">Fin:</span>
                                            <span className="fecha-value">
                                                {new Date(m.fechaFinSeccion).toLocaleDateString("es-ES")}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Acciones según estado */}
                                <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    {m.estado === "ACTIVA" ? (
                                        <>
                                            {/* Botón para retirarse (cambiar a RETIRADA) */}
                                            <button
                                                onClick={() => handleRetirarse(m.seccionId)}
                                                style={{
                                                    backgroundColor: '#ff9800',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9em',
                                                    flex: 1
                                                }}
                                            >
                                                📋 Retirarse
                                            </button>
                                            
                                            {/* Botón para eliminar definitivamente */}
                                            <button
                                                onClick={() => handleEliminar(m.seccionId)}
                                                style={{
                                                    backgroundColor: '#d32f2f',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    padding: '8px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9em',
                                                    flex: 1
                                                }}
                                            >
                                                🗑️ Darse de Baja
                                            </button>
                                        </>
                                    ) : (
                                        <button 
                                            disabled 
                                            style={{
                                                backgroundColor: '#e0e0e0',
                                                color: '#888',
                                                width: '100%',
                                                cursor: 'default',
                                                borderRadius: '4px',
                                                padding: '8px',
                                                border: 'none',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            🔒 Curso Cerrado
                                        </button>
                                    )}
                                </div>
                            </div>
                           
                            {/* Badge de fecha de matrícula */}
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