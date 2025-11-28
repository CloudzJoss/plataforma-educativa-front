// src/pages/SeccionesDisponibles.jsx
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
    const [loadingSecciones, setLoadingSecciones] = useState(true);
    const [loadingProfile, setLoadingProfile] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [usuario, setUsuario] = useState(null);

    const URL_BASE = "https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net";

    // 1. Cargar Perfil del Alumno
    const cargarPerfilAlumno = async () => {
        setLoadingProfile(true);
        setError(null);

        try {
            const response = await axios.get(`${URL_BASE}/api/auth/me`, { withCredentials: true });

            if (response.data?.rol === "ALUMNO" && response.data.grado) {
                setUsuario(response.data);
            } else {
                setError("No se encontró información académica válida.");
            }
        } catch (err) {
            setError("Error al identificar al estudiante.");
        } finally {
            setLoadingProfile(false);
        }
    };

    // 2. Cargar Secciones Disponibles
    const cargarSeccionesDisponibles = useCallback(async () => {
        setLoadingSecciones(true);
        setError(null);

        try {
            const response = await axios.get(`${URL_BASE}/api/secciones/con-cupo`, { withCredentials: true });
            setSecciones(response.data);
        } catch (err) {
            setError("No se pudieron cargar las secciones disponibles");
        } finally {
            setLoadingSecciones(false);
        }
    }, []);

    useEffect(() => {
        cargarPerfilAlumno();
        cargarSeccionesDisponibles();
    }, [cargarSeccionesDisponibles]);

    // Matricularse
    const handleMatricularse = async (seccionId) => {
        if (!window.confirm("¿Estás seguro de matricularte en esta sección?")) return;

        try {
            await axios.post(
                `${URL_BASE}/api/matriculas/matricularse`,
                { seccionId },
                { withCredentials: true }
            );

            alert("¡Matrícula exitosa!");
            cargarSeccionesDisponibles();
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Error en la matrícula";
            alert(errorMsg);
        }
    };

    // --- FILTRADO ---
    const seccionesFiltradas = secciones.filter((s) => {
        if (!usuario) return false;

        const coincide =
            s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.tituloCurso.toLowerCase().includes(searchTerm.toLowerCase());

        const mismoNivel = s.nivelSeccion === usuario.nivel;
        const gradoAlumno = extraerNumero(usuario.grado);
        const gradoSeccion = extraerNumero(s.gradoSeccion);

        const mismoGrado = gradoAlumno === gradoSeccion;

        return coincide && mismoNivel && mismoGrado;
    });

    const getTurnoColor = (turno) => {
        switch (turno) {
            case "MAÑANA": return "#ff9800";
            case "TARDE": return "#2196f3";
            case "NOCHE": return "#9c27b0";
            default: return "#757575";
        }
    };

    if (loadingSecciones || loadingProfile) {
        return (
            <div className="mis-secciones-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>{loadingProfile ? "Identificando estudiante..." : "Cargando cursos..."}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-secciones-container">
            <div className="secciones-header">
                <div>
                    <h1>Secciones Disponibles</h1>
                    {usuario && (
                        <p className="subtitle">
                            Filtro automático: <strong>{usuario.nivel} - {usuario.grado}</strong>
                        </p>
                    )}
                </div>

                <button onClick={() => { cargarPerfilAlumno(); cargarSeccionesDisponibles(); }} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {error && (
                <div className="error-box">
                    <strong>⚠️ {error}</strong>
                </div>
            )}

            <input
                type="text"
                placeholder="🔍 Buscar por curso o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            {seccionesFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No hay secciones disponibles</h2>
                    <p>No se encontraron cursos abiertos para tu grado y nivel.</p>
                </div>
            ) : (
                <div className="secciones-grid">
                    {seccionesFiltradas.map((seccion) => (
                        <div key={seccion.id} className="seccion-card">
                            <div className="card-header">
                                <div className="card-icon">📚</div>
                                <div className="card-title-section">
                                    <h3>{seccion.tituloCurso}</h3>
                                    <p>{seccion.nivelSeccion} - {seccion.gradoSeccion}</p>
                                </div>
                                <span className="turno-badge" style={{ backgroundColor: getTurnoColor(seccion.turno) }}>
                                    {seccion.turno}
                                </span>
                            </div>

                            <div className="card-body">
                                <p><strong>Código:</strong> {seccion.codigo}</p>
                                <p><strong>Profesor:</strong> {seccion.nombreProfesor}</p>
                                <p><strong>Cupos:</strong> {seccion.cuposDisponibles} disponibles</p>
                            </div>

                            <div className="card-footer">
                                <p><strong>Inicio:</strong> {new Date(seccion.fechaInicio).toLocaleDateString("es-ES")}</p>

                                <button
                                    className="btn-ingresar"
                                    onClick={() => handleMatricularse(seccion.id)}
                                    disabled={!seccion.tieneCupo}
                                    style={{
                                        backgroundColor: seccion.tieneCupo ? "#ff9800" : "#ccc",
                                    }}
                                >
                                    {seccion.tieneCupo ? "Matricularme" : "Sin Cupo"}
                                </button>
                            </div>

                            <div className="estudiantes-badge">
                                👥 {seccion.estudiantesMatriculados}/{seccion.capacidad}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
