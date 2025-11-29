import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/MisSeccionesProfesor.css';

// Función auxiliar para sacar el número del grado
const extraerNumero = (str) => {
    if (!str) return null;
    const match = str.toString().match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
};

export default function SeccionesDisponibles() {
    const [secciones, setSecciones] = useState([]);
    const [misMatriculas, setMisMatriculas] = useState([]);
   
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   
    // Filtros
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('TODOS');
   
    const [usuario, setUsuario] = useState(null);

    const URL_BASE = "https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net";

    // 1. Cargar Datos Iniciales (Perfil + Secciones + Mis Matrículas)
    const cargarDatos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // A. Cargar Perfil
            const resPerfil = await axios.get(`${URL_BASE}/api/auth/me`, { withCredentials: true });
           
            if (resPerfil.data?.rol === "ALUMNO" && resPerfil.data.grado) {
                setUsuario(resPerfil.data);
            } else {
                setError("No se encontró información académica válida.");
                setLoading(false);
                return;
            }

            // B. Cargar Secciones Disponibles
            const resSecciones = await axios.get(`${URL_BASE}/api/secciones/con-cupo`, { withCredentials: true });
            setSecciones(resSecciones.data);

            // C. Cargar Matrículas Actuales del Alumno
            const resMatriculas = await axios.get(`${URL_BASE}/api/matriculas/mis-matriculas/activas`, { withCredentials: true });
            setMisMatriculas(resMatriculas.data);

        } catch (err) {
            console.error("Error cargando datos:", err);
            setError("Error al cargar la información del sistema.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // 2. Manejar Matriculación
    const handleMatricularse = async (seccionId) => {
        if (!window.confirm("¿Estás seguro de matricularte en esta sección?")) return;

        try {
            await axios.post(
                `${URL_BASE}/api/matriculas/matricularse`,
                { seccionId },
                { withCredentials: true }
            );

            alert("¡Matrícula exitosa!");
            cargarDatos(); // Recargamos todo
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error en la matrícula";
            alert(errorMsg);
        }
    };

    // --- LÓGICA DE FILTRADO ---
   
    const cursosDisponiblesParaFiltro = [...new Set(
        secciones
            .filter(s => usuario && s.nivelSeccion === usuario.nivel)
            .map(s => s.tituloCurso)
    )].sort();

    const seccionesFiltradas = secciones.filter((s) => {
        if (!usuario) return false;

        // A. Filtro de Grado y Nivel (Estricto)
        const mismoNivel = s.nivelSeccion === usuario.nivel;
        const gradoAlumno = extraerNumero(usuario.grado);
        const gradoSeccion = extraerNumero(s.gradoSeccion);
        const mismoGrado = gradoAlumno === gradoSeccion;

        if (!mismoNivel || !mismoGrado) return false;

        // B. Filtro de Texto (Buscador)
        const coincideBusqueda =
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase());

        // C. Filtro por Curso (Combobox)
        const coincideCurso = filtroCurso === 'TODOS' || s.tituloCurso === filtroCurso;

        return coincideBusqueda && coincideCurso;
    });

    // Colores para el diseño
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
            return <span style={{ color: '#999' }}>Sin horarios</span>;
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
                    <p>Verificando disponibilidad académica...</p>
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
                    {usuario && (
                        <p className="subtitle">
                            Oferta académica para: <strong>{usuario.nivel} - {usuario.grado}</strong>
                        </p>
                    )}
                </div>
                <button onClick={cargarDatos} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {error && (
                <div className="error-box" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '8px' }}>
                    <strong>⚠️ {error}</strong>
                </div>
            )}

            {/* --- BARRA DE FILTROS --- */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '20px',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
                {/* Buscador de Texto */}
                <div>
                    <label style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px', display: 'block' }}>Buscar:</label>
                    <input
                        type="text"
                        placeholder="Código, profesor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                        style={{ width: '100%', margin: 0 }}
                    />
                </div>

                {/* Filtro de Cursos (Combobox) */}
                <div>
                    <label style={{ fontSize: '0.9em', color: '#666', marginBottom: '5px', display: 'block' }}>Filtrar por Curso:</label>
                    <select
                        value={filtroCurso}
                        onChange={(e) => setFiltroCurso(e.target.value)}
                        className="search-input"
                        style={{ width: '100%', margin: 0 }}
                    >
                        <option value="TODOS">Todos los cursos</option>
                        {cursosDisponiblesParaFiltro.map(nombreCurso => (
                            <option key={nombreCurso} value={nombreCurso}>{nombreCurso}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* --- GRID DE SECCIONES --- */}
            {seccionesFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No hay secciones disponibles</h2>
                    <p>No se encontraron cursos abiertos que coincidan con tus filtros.</p>
                </div>
            ) : (
                <div className="secciones-grid">
                    {seccionesFiltradas.map((seccion) => {
                        // Lógica para verificar si YA TIENE EL CURSO
                        const yaTieneCurso = misMatriculas.some(
                            m => m.cursoId === seccion.cursoId
                        );

                        return (
                            <div key={seccion.id} className="seccion-card">
                                {/* Header con color según turno */}
                                <div className="card-header">
                                    <div className="card-icon"><span>📚</span></div>
                                    <div className="card-title-section">
                                        <h3 className="card-title">{seccion.tituloCurso}</h3>
                                        <p className="card-subtitle">{seccion.nombre}</p>
                                    </div>
                                    <span className="turno-badge" style={{ backgroundColor: getTurnoColor(seccion.turno) }}>
                                        {seccion.turno}
                                    </span>
                                </div>

                                {/* Cuerpo de la tarjeta */}
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
                                        <span className="info-value">{seccion.aula || 'Virtual'}</span>
                                    </div>

                                    {/* 🕒 NUEVA SECCIÓN: HORARIOS */}
                                    <div className="info-row">
                                        <span className="info-label">🕒 Horarios:</span>
                                        <span className="info-value" style={{ display: 'block', marginTop: '4px' }}>
                                            {formatearHorarios(seccion.horarios)}
                                        </span>
                                    </div>

                                    <div className="info-row">
                                        <span className="info-label">Cupos:</span>
                                        <span className="info-value" style={{ fontWeight: 'bold', color: seccion.tieneCupo ? '#4caf50' : '#f44336' }}>
                                            {seccion.cuposDisponibles} vacantes
                                        </span>
                                    </div>
                                </div>

                                {/* Pie de tarjeta y Botón */}
                                <div className="card-footer">
                                    <div className="fecha-info">
                                        <div className="fecha-item">
                                            <span className="fecha-label">Inicio:</span>
                                            <span className="fecha-value">{new Date(seccion.fechaInicio).toLocaleDateString('es-ES')}</span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        {yaTieneCurso ? (
                                            // Botón Deshabilitado si ya tiene el curso
                                            <button
                                                className="btn-ingresar"
                                                disabled
                                                style={{ backgroundColor: '#9e9e9e', cursor: 'default' }}
                                            >
                                                ✅ Ya inscrito
                                            </button>
                                        ) : (
                                            // Botón de Matricula Normal
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
                                                {seccion.tieneCupo ? '📝 Matricularme' : '🔒 Sin Cupo'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                               
                                {/* Badge flotante de estudiantes */}
                                <div className="estudiantes-badge">
                                    <span className="estudiantes-icon">👥</span>
                                    <span className="estudiantes-text">
                                        {seccion.estudiantesMatriculados}/{seccion.capacidad}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}