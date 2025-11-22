// src/pages/MisMatriculas.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MisSeccionesProfesor.css'; // Reutilizamos los mismos estilos

export default function MisMatriculas() {
    const [matriculas, setMatriculas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState('TODAS'); // TODAS, ACTIVA, RETIRADA, COMPLETADA

    const cargarMisMatriculas = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Cargando matrículas del alumno...');

            const response = await axios.get(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/matriculas/mis-matriculas',
                { withCredentials: true }
            );

            console.log('✅ Matrículas cargadas:', response.data);
            setMatriculas(response.data);

        } catch (err) {
            console.error('❌ Error al cargar matrículas:', err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 404) {
                    setError('No tienes matrículas registradas.');
                } else if (status === 401 || status === 403) {
                    setError('No tienes permisos. Por favor, inicia sesión nuevamente.');
                } else {
                    setError(errorData?.message || 'Error al cargar las matrículas');
                }
            } else {
                setError('No se pudo conectar con el servidor');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMisMatriculas();
    }, [cargarMisMatriculas]);

    const handleRetirar = async (seccionId) => {
        if (!window.confirm('¿Estás seguro de retirarte de este curso? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            await axios.delete(
                `http://localhost:8081/api/matriculas/retirarse/${seccionId}`,
                { withCredentials: true }
            );

            alert('Te has retirado del curso exitosamente');
            cargarMisMatriculas(); // Recargar la lista

        } catch (err) {
            console.error('Error al retirarse:', err);
            const errorMsg = err.response?.data?.message || 'No se pudo procesar el retiro';
            alert(errorMsg);
        }
    };

    // Filtrar matrículas
    const matriculasFiltradas = matriculas.filter(m => {
        if (filtroEstado === 'TODAS') return true;
        return m.estado === filtroEstado;
    });

    // Estadísticas
    const matriculasActivas = matriculas.filter(m => m.estado === 'ACTIVA').length;
    const matriculasCompletadas = matriculas.filter(m => m.estado === 'COMPLETADA').length;

    const getEstadoColor = (estado) => {
        switch (estado) {
            case 'ACTIVA': return '#4caf50';
            case 'RETIRADA': return '#f44336';
            case 'COMPLETADA': return '#2196f3';
            default: return '#757575';
        }
    };

    const getTurnoColor = (turno) => {
        switch (turno) {
            case 'MAÑANA': return '#ff9800';
            case 'TARDE': return '#2196f3';
            case 'NOCHE': return '#9c27b0';
            default: return '#757575';
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

    if (error && matriculas.length === 0) {
        return (
            <div className="mis-secciones-container">
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Error al cargar tus cursos</h3>
                    <p>{error}</p>
                    <button onClick={cargarMisMatriculas} className="btn-retry">
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-secciones-container">
            {/* Header */}
            <div className="secciones-header">
                <div>
                    <h1>Mis Cursos Matriculados</h1>
                    <p className="subtitle">Cursos / Pregrado</p>
                </div>
                <button onClick={cargarMisMatriculas} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {matriculas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h2>No tienes cursos matriculados</h2>
                    <p>Explora las secciones disponibles y matricúlate en tus cursos.</p>
                    <button
                        onClick={() => window.location.href = '/dashboard/secciones-disponibles'}
                        className="btn-ingresar"
                        style={{ marginTop: '20px', padding: '12px 24px' }}
                    >
                        🔍 Buscar Secciones
                    </button>
                </div>
            ) : (
                <>
                    {/* Estadísticas */}
                    <div className="stats-container">
                        <div className="stat-card">
                            <div className="stat-number">{matriculas.length}</div>
                            <div className="stat-label">Total Matrículas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{matriculasActivas}</div>
                            <div className="stat-label">Activas</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">{matriculasCompletadas}</div>
                            <div className="stat-label">Completadas</div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="search-container">
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                fontSize: '14px',
                                background: 'white'
                            }}
                        >
                            <option value="TODAS">Todas las matrículas</option>
                            <option value="ACTIVA">Solo activas</option>
                            <option value="COMPLETADA">Solo completadas</option>
                            <option value="RETIRADA">Solo retiradas</option>
                        </select>
                    </div>

                    {/* Grid de Matrículas */}
                    <div className="secciones-grid">
                        {matriculasFiltradas.map((matricula) => (
                            <div key={matricula.id} className="seccion-card">
                                {/* Header */}
                                <div className="card-header">
                                    <div className="card-icon">
                                        <span>📚</span>
                                    </div>
                                    <div className="card-title-section">
                                        <h3 className="card-title">{matricula.tituloCurso}</h3>
                                        <p className="card-subtitle">
                                            {matricula.nivelCurso} - Sección: {matricula.nombreSeccion}
                                        </p>
                                    </div>
                                    <span
                                        className="turno-badge"
                                        style={{ backgroundColor: getTurnoColor(matricula.turnoSeccion) }}
                                    >
                                        {matricula.turnoSeccion}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="card-body">
                                    <div className="info-row">
                                        <span className="info-label">Código:</span>
                                        <span className="info-value">{matricula.codigoSeccion}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Profesor:</span>
                                        <span className="info-value">{matricula.nombreProfesor}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="info-label">Aula:</span>
                                        <span className="info-value">{matricula.aulaSeccion || 'Sin asignar'}</span>
                                    </div>
                                    {matricula.calificacionFinal !== null && (
                                        <div className="info-row">
                                            <span className="info-label">Calificación:</span>
                                            <span className="info-value" style={{
                                                fontWeight: 'bold',
                                                color: matricula.calificacionFinal >= 11 ? '#4caf50' : '#f44336'
                                            }}>
                                                {matricula.calificacionFinal.toFixed(1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="card-footer">
                                    <div className="fecha-info">
                                        <div className="fecha-item">
                                            <span className="fecha-label">Inicio:</span>
                                            <span className="fecha-value">
                                                {new Date(matricula.fechaInicioSeccion).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                        <div className="fecha-item">
                                            <span className="fecha-label">Fin:</span>
                                            <span className="fecha-value">
                                                {new Date(matricula.fechaFinSeccion).toLocaleDateString('es-ES')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        <span
                                            className="status-badge"
                                            style={{ backgroundColor: getEstadoColor(matricula.estado) + '20', color: getEstadoColor(matricula.estado) }}
                                        >
                                            {matricula.estado}
                                        </span>
                                        {matricula.estado === 'ACTIVA' && (
                                            <button
                                                onClick={() => handleRetirar(matricula.seccionId)}
                                                className="btn-ingresar"
                                                style={{ backgroundColor: '#f44336' }}
                                            >
                                                Retirarse
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Badge de fecha de matrícula */}
                                <div className="estudiantes-badge">
                                    <span className="estudiantes-icon">📅</span>
                                    <span className="estudiantes-text">
                                        Matriculado: {new Date(matricula.fechaMatricula).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}