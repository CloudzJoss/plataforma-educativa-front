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
            console.log("Matrículas cargadas:", response.data);
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

    // --- CORRECCIÓN EN ELIMINAR (RETIRARSE) ---
    const handleRetirar = async (seccionId) => {
        if (!window.confirm("¿Seguro que deseas retirarte de este curso?")) return;

        try {
            // ⚠️ CORRECCIÓN: El ID se envía en la URL, no en el 'data' body.
            await axios.delete(
                `${URL_BASE}/api/matriculas/retirarse/${seccionId}`, 
                { withCredentials: true }
            );

            alert("Te has retirado del curso exitosamente.");
            cargarMisMatriculas();
        } catch (err) {
            const msg = err.response?.data?.message || "Error al retirarse";
            alert(msg);
        }
    };

    const matriculasFiltradas = matriculas.filter((m) => {
        if (filtroEstado === "TODAS") return true;
        return m.estado === filtroEstado;
    });

    // Colores e íconos visuales
    const getEstadoColor = (estado) => {
        switch (estado) {
            case "ACTIVA": return "#4caf50";     // Verde
            case "RETIRADA": return "#f44336";   // Rojo
            case "COMPLETADA": return "#2196f3"; // Azul
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
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tus cursos...</p>
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

            {/* Filtro de Estado */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.9em', color: '#666', display: 'block', marginBottom: '5px' }}>Filtrar por estado:</label>
                <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="search-input"
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    <option value="TODAS">Todas las matrículas</option>
                    <option value="ACTIVA">🟢 Activas</option>
                    <option value="COMPLETADA">🔵 Completadas</option>
                    <option value="RETIRADA">🔴 Retiradas</option>
                </select>
            </div>

            {matriculasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No tienes matrículas {filtroEstado !== "TODAS" ? "en este estado" : ""}</h2>
                    <button
                        onClick={() => window.location.href = "/dashboard/secciones-disponibles"}
                        className="btn-ingresar"
                        style={{ marginTop: '15px' }}
                    >
                        🔍 Buscar Nuevos Cursos
                    </button>
                </div>
            ) : (
                <div className="secciones-grid">
                    {matriculasFiltradas.map((m) => (
                        <div key={m.id} className="seccion-card">
                            {/* --- HEADER --- */}
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

                            {/* --- BODY (Detalles completos) --- */}
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Código:</span>
                                    {/* Usamos codigoSeccion del DTO */}
                                    <span className="info-value">{m.codigoSeccion || '---'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Profesor:</span>
                                    <span className="info-value">{m.nombreProfesor || 'Por asignar'}</span>
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
                                
                                {/* Mostrar Nota Final si existe */}
                                {m.calificacionFinal !== null && (
                                    <div className="info-row" style={{ marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '5px' }}>
                                        <span className="info-label">Nota Final:</span>
                                        <span className="info-value" style={{ fontSize: '1.1em', fontWeight: 'bold', color: m.calificacionFinal >= 11 ? '#4caf50' : '#f44336' }}>
                                            {m.calificacionFinal}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* --- FOOTER --- */}
                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item">
                                        <span className="fecha-label">Inicio:</span>
                                        <span className="fecha-value">
                                            {m.fechaInicioSeccion ? new Date(m.fechaInicioSeccion).toLocaleDateString("es-ES") : '---'}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    {m.estado === "ACTIVA" ? (
                                        <button
                                            className="btn-ingresar"
                                            onClick={() => handleRetirar(m.seccionId)}
                                            style={{ backgroundColor: "#f44336", width: '100%' }}
                                        >
                                            🚪 Retirarse
                                        </button>
                                    ) : (
                                        <button
                                            className="btn-ingresar"
                                            disabled
                                            style={{ backgroundColor: "#e0e0e0", color: "#888", width: '100%', cursor: 'default' }}
                                        >
                                            🔒 Curso Cerrado
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Badge de fecha de matrícula */}
                            <div className="estudiantes-badge" style={{ bottom: 'auto', top: '10px', right: 'auto', left: '10px', fontSize: '0.75em' }}>
                                📅 Inscrito: {new Date(m.fechaMatricula).toLocaleDateString("es-ES")}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}