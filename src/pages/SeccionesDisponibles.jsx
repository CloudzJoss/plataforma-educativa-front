// src/pages/SeccionesDisponibles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MisSeccionesProfesor.css';

export default function SeccionesDisponibles() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroNivel, setFiltroNivel] = useState('TODOS');
    const [filtroTurno, setFiltroTurno] = useState('TODOS');

    const cargarSeccionesDisponibles = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('🔍 Cargando secciones disponibles...');

            // Obtener secciones activas con cupo
            const response = await axios.get(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/secciones/con-cupo',
                { withCredentials: true }
            );

            console.log('✅ Secciones disponibles cargadas:', response.data);
            setSecciones(response.data);

        } catch (err) {
            console.error('❌ Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones disponibles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarSeccionesDisponibles();
    }, [cargarSeccionesDisponibles]);

    const handleMatricularse = async (seccionId) => {
        if (!window.confirm('¿Estás seguro de matricularte en esta sección?')) {
            return;
        }

        try {
            const response = await axios.post(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/matriculas/matricularse',
                { seccionId: seccionId },
                { withCredentials: true }
            );

            alert('¡Matrícula exitosa! Ya estás inscrito en este curso.');
            console.log('Matrícula creada:', response.data);

            // Recargar secciones para actualizar cupos
            cargarSeccionesDisponibles();

        } catch (err) {
            console.error('Error al matricularse:', err);
            const errorMsg = err.response?.data?.message || 'No se pudo procesar la matrícula';
            alert(errorMsg);
        }
    };

    // Filtrar secciones
    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel = filtroNivel === 'TODOS' || seccion.nivelSeccion === filtroNivel;
        const coincideTurno = filtroTurno === 'TODOS' || seccion.turno === filtroTurno;
        const coincideBusqueda =
            seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase());

        return coincideNivel && coincideTurno && coincideBusqueda;
    });

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
                    <p>Cargando secciones disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-secciones-container">
            {/* Header */}
            <div className="secciones-header">
                <div>
                    <h1>Secciones Disponibles</h1>
                    <p className="subtitle">Busca y matricúlate en tus cursos</p>
                </div>
                <button onClick={cargarSeccionesDisponibles} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {error && (
                <div style={{
                    padding: '15px',
                    backgroundColor: '#ffebee',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    color: '#c62828'
                }}>
                    {error}
                </div>
            )}

            {/* Estadísticas */}
            {secciones.length > 0 && (
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-number">{secciones.length}</div>
                        <div className="stat-label">Secciones Disponibles</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {secciones.reduce((acc, s) => acc + (s.cuposDisponibles || 0), 0)}
                        </div>
                        <div className="stat-label">Cupos Totales</div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />

                <select
                    value={filtroNivel}
                    onChange={(e) => setFiltroNivel(e.target.value)}
                    className="search-input"
                >
                    <option value="TODOS">Todos los niveles</option>
                    <option value="INICIAL">Inicial</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                </select>

                <select
                    value={filtroTurno}
                    onChange={(e) => setFiltroTurno(e.target.value)}
                    className="search-input"
                >
                    <option value="TODOS">Todos los turnos</option>
                    <option value="MAÑANA">Mañana</option>
                    <option value="TARDE">Tarde</option>
                    <option value="NOCHE">Noche</option>
                </select>
            </div>

            {/* Grid de Secciones */}
            {seccionesFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">🔍</div>
                    <h2>No se encontraron secciones</h2>
                    <p>No hay secciones disponibles con los filtros aplicados</p>
                </div>
            ) : (
                <div className="secciones-grid">
                    {seccionesFiltradas.map((seccion) => (
                        <div key={seccion.id} className="seccion-card">
                            {/* Header */}
                            <div className="card-header">
                                <div className="card-icon">
                                    <span>📚</span>
                                </div>
                                <div className="card-title-section">
                                    <h3 className="card-title">{seccion.tituloCurso}</h3>
                                    <p className="card-subtitle">
                                        {seccion.nivelSeccion} - {seccion.gradoSeccion}
                                    </p>
                                </div>
                                <span
                                    className="turno-badge"
                                    style={{ backgroundColor: getTurnoColor(seccion.turno) }}
                                >
                                    {seccion.turno}
                                </span>
                            </div>

                            {/* Body */}
                            <div className="card-body">
                                <div className="info-row">
                                    <span className="info-label">Código:</span>
                                    <span className="info-value">{seccion.codigo}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Profesor:</span>
                                    <span className="info-value">{seccion.nombreProfesor}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Aula:</span>
                                    <span className="info-value">{seccion.aula || 'Sin asignar'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Cupos:</span>
                                    <span className="info-value" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {seccion.cuposDisponibles} disponibles
                                    </span>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item">
                                        <span className="fecha-label">Inicio:</span>
                                        <span className="fecha-value">
                                            {new Date(seccion.fechaInicio).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                    <div className="fecha-item">
                                        <span className="fecha-label">Fin:</span>
                                        <span className="fecha-value">
                                            {new Date(seccion.fechaFin).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>

                                <div className="card-actions">
                                    <button
                                        onClick={() => handleMatricularse(seccion.id)}
                                        className="btn-ingresar"
                                        disabled={!seccion.tieneCupo}
                                        style={{
                                            width: '100%',
                                            backgroundColor: seccion.tieneCupo ? '#ff9800' : '#ccc',
                                            cursor: seccion.tieneCupo ? 'pointer' : 'not-allowed'
                                        }}
                                    >
                                        {seccion.tieneCupo ? '✅ Matricularme' : '❌ Sin Cupo'}
                                    </button>
                                </div>
                            </div>

                            {/* Badge de estudiantes */}
                            <div className="estudiantes-badge">
                                <span className="estudiantes-icon">👥</span>
                                <span className="estudiantes-text">
                                    {seccion.estudiantesMatriculados}/{seccion.capacidad}
                                </span>
                            </div>                      
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}