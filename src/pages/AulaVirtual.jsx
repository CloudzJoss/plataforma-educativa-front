// src/pages/AulaVirtual.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/AulaVirtual.css';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function AulaVirtual() {
    const { seccionId } = useParams();
    const [sesiones, setSesiones] = useState([]);
    const [sesionActiva, setSesionActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados para los acordeones
    const [showTematica, setShowTematica] = useState(true);
    const [showResultado, setShowResultado] = useState(true);

    // 🔒 OBTENER EL ROL DEL USUARIO
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
                const sesionesData = response.data || [];
                
                // Ordenar por fecha
                sesionesData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                setSesiones(sesionesData);
                
                // Seleccionar sesión por defecto (hoy o futura más cercana, o la primera)
                if (sesionesData.length > 0) {
                    const hoy = new Date().toISOString().split('T')[0];
                    const sesionActual = sesionesData.find(s => s.fecha >= hoy) || sesionesData[0];
                    setSesionActiva(sesionActual);
                }
            } catch (error) {
                console.error("Error cargando el aula:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSesiones();
    }, [seccionId]);

    const RecursoCard = ({ recurso }) => {
        let icono = '📄';
        if (recurso.tipoArchivo === 'LINK') icono = '🔗';
        if (recurso.tipoArchivo === 'VIDEO') icono = '▶️';
        if (recurso.tipoArchivo === 'TAREA') icono = '📝';

        return (
            <div className="recurso-card">
                <div className="recurso-header">
                    <span className="recurso-icon">{icono}</span>
                    <div className="recurso-info">
                        <span className="recurso-tipo">{recurso.tipoArchivo || 'Recurso'}</span>
                        <div className="recurso-titulo">{recurso.titulo}</div>
                    </div>
                    <span style={{color: '#999', fontSize: '1.2em'}}>◯</span> 
                </div>
                <div className="recurso-footer">
                    <span className="recurso-fecha">Publicado: {new Date().toLocaleDateString()}</span>
                    <button className="btn-ver" onClick={() => window.open(recurso.url, '_blank')}>Ver</button>
                </div>
            </div>
        );
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Cargando aula virtual...</div>;

    if (!sesionActiva) return (
        <div style={{padding: 40, textAlign: 'center', color: '#666'}}>
            <h2>📭 No hay sesiones programadas</h2>
            <p>El calendario de clases aún no ha sido generado.</p>
        </div>
    );

    // Filtrar recursos usando los Enums del Backend
    const recursosAntes = sesionActiva.recursos?.filter(r => r.momento === 'ANTES') || [];
    const recursosDurante = sesionActiva.recursos?.filter(r => r.momento === 'DURANTE') || [];
    const recursosDespues = sesionActiva.recursos?.filter(r => r.momento === 'DESPUES') || [];

    const indexActiva = sesiones.findIndex(s => s.id === sesionActiva.id) + 1;

    return (
        <div className="aula-container">
            {/* TABS SUPERIORES */}
            <div style={{fontWeight: 'bold', marginBottom: '10px', color: '#666'}}>Sesiones de clase:</div>
            <div className="sesiones-tabs">
                {sesiones.map((sesion, index) => (
                    <button 
                        key={sesion.id}
                        className={`tab-btn ${sesion.id === sesionActiva.id ? 'active' : ''}`}
                        onClick={() => setSesionActiva(sesion)}
                        title={sesion.fecha}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </button>
                ))}
            </div>

            {/* AREA DE CONTENIDO */}
            <div className="sesion-header-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                    <div>
                        <div className="sesion-titulo-badge">
                            Sesión {indexActiva}
                        </div>
                        <span style={{marginLeft: 15, color: '#555', fontWeight: 600}}>
                            📅 {new Date(sesionActiva.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                    
                    {/* 🔒 SOLO VISIBLE PARA EL PROFESOR */}
                    {userRole === 'PROFESOR' && (
                        <button 
                            className="btn-asistencia" 
                            onClick={() => alert("🛠️ Funcionalidad de Asistencias: Pendiente de implementar")}
                        >
                            📋 Gestionar Asistencias
                        </button>
                    )}
                </div>

                {/* Acordeones */}
                <div className="acordeon-item">
                    <div className="acordeon-header" onClick={() => setShowTematica(!showTematica)}>
                        <span>📄 Temática / Contenido</span>
                        <span>{showTematica ? '▲' : '▼'}</span>
                    </div>
                    {showTematica && (
                        <div className="acordeon-content">
                            {sesionActiva.tema || "El profesor aún no ha definido el tema."}
                        </div>
                    )}
                </div>

                <div className="acordeon-item">
                    <div className="acordeon-header" onClick={() => setShowResultado(!showResultado)}>
                        <span>🎯 Resultado de aprendizaje</span>
                        <span>{showResultado ? '▲' : '▼'}</span>
                    </div>
                    {showResultado && (
                        <div className="acordeon-content">
                            {sesionActiva.descripcion || "Sin descripción."}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. COLUMNAS: ANTES - DURANTE - DESPUÉS */}
            <div className="fases-grid">
                
                {/* COLUMNA 1: ANTES */}
                <div className="fase-columna fase-antes">
                    <div className="fase-titulo">
                        <span>⏮️</span> ANTES
                    </div>
                    <p className="fase-desc">Preparación previa</p>
                    {recursosAntes.length === 0 && <div className="empty-recurso">Sin recursos previos</div>}
                    {recursosAntes.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                {/* COLUMNA 2: DURANTE */}
                <div className="fase-columna fase-durante">
                    <div className="fase-titulo">
                        <span>🔥</span> DURANTE
                    </div>
                    <p className="fase-desc">Material de clase</p>
                    {recursosDurante.length === 0 && <div className="empty-recurso">Sin material de clase</div>}
                    {recursosDurante.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                {/* COLUMNA 3: DESPUÉS */}
                <div className="fase-columna fase-despues">
                    <div className="fase-titulo">
                        <span>⏭️</span> DESPUÉS
                    </div>
                    <p className="fase-desc">Tareas y refuerzo</p>
                    {recursosDespues.length === 0 && <div className="empty-recurso">Sin tareas asignadas</div>}
                    {recursosDespues.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

            </div>
        </div>
    );
}
