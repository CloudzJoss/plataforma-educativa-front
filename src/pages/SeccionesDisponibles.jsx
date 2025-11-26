// src/pages/SeccionesDisponibles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MisSeccionesProfesor.css';

// Función auxiliar para sacar el número del grado (igual que en el backend)
const extraerNumero = (str) => {
    if (!str) return null;
    const match = str.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

export default function SeccionesDisponibles() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Estado para el perfil del alumno logueado
    const [perfilAlumno, setPerfilAlumno] = useState(null);

    // 1. Cargar Perfil del Alumno (Necesario para filtrar)
    const cargarPerfilAlumno = async () => {
        try {
            const response = await axios.get(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/auth/me', 
                { withCredentials: true }
            );
            
            if (response.data && response.data.perfilAlumno) {
                console.log('👤 Perfil Alumno cargado:', response.data.perfilAlumno);
                setPerfilAlumno(response.data.perfilAlumno);
            }
        } catch (err) {
            console.warn('No se pudo cargar el perfil del alumno para filtrado automático', err);
        }
    };

    // 2. Cargar Secciones
    const cargarSeccionesDisponibles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('🔍 Cargando secciones disponibles...');
            const response = await axios.get(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/secciones/con-cupo',
                { withCredentials: true }
            );
            console.log('✅ Secciones cargadas:', response.data);
            setSecciones(response.data);
        } catch (err) {
            console.error('❌ Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones disponibles');
        } finally {
            setLoading(false);
        }
    }, []);

    // Inicialización
    useEffect(() => {
        cargarPerfilAlumno();
        cargarSeccionesDisponibles();
    }, [cargarSeccionesDisponibles]);

    const handleMatricularse = async (seccionId) => {
        if (!window.confirm('¿Estás seguro de matricularte en esta sección?')) return;

        try {
            // ✅ CORRECCIÓN: Se eliminó "const response =" para evitar el error de 'unused variable'
            await axios.post(
                'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/matriculas/matricularse',
                { seccionId: seccionId },
                { withCredentials: true }
            );
            
            alert('¡Matrícula exitosa! Ya estás inscrito en este curso.');
            cargarSeccionesDisponibles(); // Recargar para actualizar cupos
        } catch (err) {
            console.error('Error al matricularse:', err);
            const errorMsg = err.response?.data?.message || 'No se pudo procesar la matrícula';
            alert(errorMsg);
        }
    };

    // --- FILTRADO INTELIGENTE ---
    const seccionesFiltradas = secciones.filter((seccion) => {
        // 1. Filtro por Texto (Buscador)
        const coincideBusqueda =
            seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seccion.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase());

        // 2. Filtro Estricto por Perfil de Alumno (Si se cargó el perfil)
        let coincidePerfil = true;
        if (perfilAlumno) {
            // Validar Nivel
            const mismoNivel = seccion.nivelSeccion === perfilAlumno.nivel;
            
            // Validar Grado (Comparación numérica)
            const numGradoSeccion = extraerNumero(seccion.gradoSeccion);
            const numGradoAlumno = extraerNumero(perfilAlumno.grado);
            
            const mismoGrado = numGradoSeccion === numGradoAlumno;

            coincidePerfil = mismoNivel && mismoGrado;
        }

        return coincideBusqueda && coincidePerfil;
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
            <div className="secciones-header">
                <div>
                    <h1>Secciones Disponibles</h1>
                    {perfilAlumno ? (
                        <p className="subtitle">
                            Mostrando cursos para: <strong>{perfilAlumno.nivel} - {perfilAlumno.grado}</strong>
                        </p>
                    ) : (
                        <p className="subtitle">Busca y matricúlate en tus cursos</p>
                    )}
                </div>
                <button onClick={cargarSeccionesDisponibles} className="btn-refresh">🔄 Actualizar</button>
            </div>

            {error && (
                <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '8px', marginBottom: '20px', color: '#c62828' }}>
                    {error}
                </div>
            )}

            {/* Barra de búsqueda */}
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="🔍 Buscar por curso o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    style={{ width: '100%' }}
                />
            </div>

            {/* Grid de Secciones */}
            {seccionesFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No se encontraron secciones</h2>
                    <p>
                        {perfilAlumno 
                            ? "No hay secciones disponibles para tu grado en este momento." 
                            : "No hay secciones que coincidan con tu búsqueda."}
                    </p>
                </div>
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
                                    {seccion.turno}
                                </span>
                            </div>

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
                                    <span className="info-label">Cupos:</span>
                                    <span className="info-value" style={{ fontWeight: 'bold', color: '#4caf50' }}>
                                        {seccion.cuposDisponibles} disponibles
                                    </span>
                                </div>
                            </div>

                            <div className="card-footer">
                                <div className="fecha-info">
                                    <div className="fecha-item">
                                        <span className="fecha-label">Inicio:</span>
                                        <span className="fecha-value">{new Date(seccion.fechaInicio).toLocaleDateString('es-ES')}</span>
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