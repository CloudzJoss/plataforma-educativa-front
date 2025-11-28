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

    // Retirarse del curso
    const handleRetirar = async (seccionId) => {
        if (!window.confirm("¿Seguro que deseas retirarte?")) return;

        try {
            await axios.delete(`${URL_BASE}/api/matriculas/retirarse`, {
                data: { seccionId },
                withCredentials: true
            });

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

    const getEstadoColor = (estado) => {
        switch (estado) {
            case "ACTIVA": return "#4caf50";
            case "RETIRADA": return "#f44336";
            case "COMPLETADA": return "#2196f3";
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
                    <p className="subtitle">Cursos registrados</p>
                </div>

                <button onClick={cargarMisMatriculas} className="btn-refresh">
                    🔄 Actualizar
                </button>
            </div>

            {error && (
                <div className="error-box">
                    ⚠️ {error}
                </div>
            )}

            <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="search-input"
            >
                <option value="TODAS">Todas</option>
                <option value="ACTIVA">Activas</option>
                <option value="COMPLETADA">Completadas</option>
                <option value="RETIRADA">Retiradas</option>
            </select>

            {matriculasFiltradas.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h2>No tienes matrículas</h2>
                    <button
                        onClick={() => window.location.href = "/dashboard/secciones-disponibles"}
                        className="btn-ingresar"
                    >
                        🔍 Buscar Secciones
                    </button>
                </div>
            ) : (
                <div className="secciones-grid">
                    {matriculasFiltradas.map((m) => (
                        <div key={m.id} className="seccion-card">
                            <div className="card-header">
                                <div className="card-icon">📚</div>
                                <div>
                                    <h3>{m.tituloCurso}</h3>
                                    <p>{m.nivelSeccion} - {m.gradoSeccion}</p>
                                </div>

                                <span className="turno-badge" style={{ backgroundColor: getEstadoColor(m.estado) }}>
                                    {m.estado}
                                </span>
                            </div>

                            <div className="card-body">
                                <p><strong>Código:</strong> {m.codigo}</p>
                                <p><strong>Profesor:</strong> {m.nombreProfesor}</p>
                                <p><strong>Inicio:</strong> {new Date(m.fechaInicio).toLocaleDateString("es-ES")}</p>
                            </div>

                            {m.estado === "ACTIVA" && (
                                <button
                                    className="btn-retirar"
                                    onClick={() => handleRetirar(m.seccionId)}
                                    style={{ backgroundColor: "#f44336" }}
                                >
                                    Retirarse
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
