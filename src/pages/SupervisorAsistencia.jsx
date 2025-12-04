// src/pages/SupervisorAsistencia.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/SupervisorAsistencia.css'; // ✅ RUTA CORREGIDA

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function SupervisorAsistencia() {
    const [dia, setDia] = useState(getDiaActualIngles());
    const [hora, setHora] = useState(getHoraActual());
    
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const navigate = useNavigate();

    function getDiaActualIngles() {
        const dias = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        return dias[new Date().getDay()];
    }

    function getHoraActual() {
        const now = new Date();
        return now.toTimeString().substring(0, 5); 
    }

    const buscarClases = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setSearched(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones/por-horario`, {
                params: { dia, hora },
                withCredentials: true
            });
            setSecciones(response.data);
        } catch (error) {
            console.error("Error buscando clases", error);
            alert("Error al buscar clases activas.");
        } finally {
            setLoading(false);
        }
    };

    const irAlAula = (seccionId) => {
        navigate(`/dashboard/aula/${seccionId}`);
    };

    return (
        <div className="gestion-container">
            <div className="gestion-header">
                <h1>🕵️‍♂️ Supervisor de Clases en Vivo</h1>
                <p className="subtitle">Consulta qué secciones se están dictando en este momento.</p>
            </div>

            <form onSubmit={buscarClases} className="filters-container">
                <div className="filter-group">
                    <label>Día de la Semana:</label>
                    <select 
                        value={dia} 
                        onChange={(e) => setDia(e.target.value)}
                        className="filter-select"
                    >
                        <option value="MONDAY">Lunes</option>
                        <option value="TUESDAY">Martes</option>
                        <option value="WEDNESDAY">Miércoles</option>
                        <option value="THURSDAY">Jueves</option>
                        <option value="FRIDAY">Viernes</option>
                        <option value="SATURDAY">Sábado</option>
                        <option value="SUNDAY">Domingo</option>
                    </select>
                </div>

                <div className="filter-group" style={{ flex: '0 1 150px', minWidth: '150px' }}>
                    <label>Hora a Consultar:</label>
                    <input 
                        type="time" 
                        value={hora} 
                        onChange={(e) => setHora(e.target.value)}
                        className="filter-input"
                    />
                </div>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Buscando...' : '🔍 Buscar'}
                </button>
            </form>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><div className="spinner"></div></div>
            ) : (
                <div className="resultados-container">
                    {searched && secciones.length === 0 && (
                        <div className="empty-state">
                            <h3>😴 No hay clases activas</h3>
                            <p>No se encontraron secciones dictándose el <strong>{dia}</strong> a las <strong>{hora}</strong>.</p>
                        </div>
                    )}

                    <div className="secciones-grid">
                        {secciones.map(seccion => (
                            <div key={seccion.id} className="seccion-card">
                                <div className="card-header">
                                    <span className="badge-activo">🟢 EN CURSO</span>
                                    <small className="card-code">{seccion.codigo}</small>
                                </div>
                                
                                <h3 className="card-title">{seccion.tituloCurso}</h3>
                                <p className="card-subtitle">{seccion.nombre} ({seccion.nivelSeccion} - {seccion.gradoSeccion})</p>

                                <div className="card-info">
                                    <div>👨‍🏫 <strong>Prof:</strong> {seccion.nombreProfesor}</div>
                                    <div>🏫 <strong>Aula:</strong> {seccion.aula || 'Virtual'}</div>
                                    <div>👥 <strong>Alumnos:</strong> {seccion.estudiantesMatriculados} matriculados</div>
                                </div>

                                <button 
                                    onClick={() => irAlAula(seccion.id)}
                                    className="btn-supervisar"
                                >
                                    👁️ Supervisar / Asistencia
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}