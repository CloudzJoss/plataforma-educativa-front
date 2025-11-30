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

    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                // Endpoint que creamos para listar sesiones por sección
                // Asumo que tienes un endpoint GET /api/sesiones/seccion/{id}
                // Si no, usamos el de la sección y extraemos la lista.
                const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}`, { withCredentials: true });
                
                // Ordenar sesiones por fecha
                const sesionesOrdenadas = (response.data.sesiones || []).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                
                setSesiones(sesionesOrdenadas);
                
                // Por defecto seleccionamos la sesión más cercana a hoy o la primera
                if (sesionesOrdenadas.length > 0) {
                    setSesionActiva(sesionesOrdenadas[0]);
                }
            } catch (error) {
                console.error("Error cargando el aula:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSesiones();
    }, [seccionId]);

    // Función auxiliar para renderizar una tarjeta de recurso
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
                        <span className="recurso-tipo">{recurso.tipoArchivo || 'Archivo'}</span>
                        <div className="recurso-titulo">{recurso.titulo}</div>
                    </div>
                    {/* Icono de check o estado a la derecha */}
                    <span style={{color: '#999'}}>◯</span> 
                </div>
                <div className="recurso-footer">
                    <span className="recurso-fecha">Publicado: {new Date().toLocaleDateString()}</span>
                    <button 
                        className="btn-ver" 
                        onClick={() => window.open(recurso.url, '_blank')}
                    >
                        Ver
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Cargando aula virtual...</div>;

    if (!sesionActiva) return <div style={{padding: 40, textAlign: 'center'}}>No hay sesiones programadas para esta sección.</div>;

    // Filtrar recursos por momento
    const recursosExplora = sesionActiva.recursos?.filter(r => r.momento === 'ANTES') || [];
    const recursosExperimenta = sesionActiva.recursos?.filter(r => r.momento === 'DURANTE') || [];
    const recursosAplica = sesionActiva.recursos?.filter(r => r.momento === 'DESPUES') || [];

    // Calcular índice para mostrar "Sesión X"
    const indexActiva = sesiones.findIndex(s => s.id === sesionActiva.id) + 1;

    return (
        <div className="aula-container">
            {/* 1. TABS SUPERIORES */}
            <div style={{fontWeight: 'bold', marginBottom: '10px', color: '#666'}}>Sesiones de clase:</div>
            <div className="sesiones-tabs">
                {sesiones.map((sesion, index) => (
                    <button 
                        key={sesion.id}
                        className={`tab-btn ${sesion.id === sesionActiva.id ? 'active' : ''}`}
                        onClick={() => setSesionActiva(sesion)}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </button>
                ))}
            </div>

            {/* 2. AREA DE CONTENIDO */}
            <div className="sesion-header-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div className="sesion-titulo-badge">
                        Sesión {indexActiva}
                    </div>
                    <button className="btn-ruta">Ruta de aprendizaje</button>
                </div>

                {/* Acordeón Temática */}
                <div className="acordeon-item">
                    <div className="acordeon-header" onClick={() => setShowTematica(!showTematica)}>
                        <span>📄 Temática/Contenido</span>
                        <span>{showTematica ? '▲' : '▼'}</span>
                    </div>
                    {showTematica && (
                        <div className="acordeon-content">
                            {sesionActiva.tema || "El profesor aún no ha definido la temática de esta sesión."}
                        </div>
                    )}
                </div>

                {/* Acordeón Resultado */}
                <div className="acordeon-item">
                    <div className="acordeon-header" onClick={() => setShowResultado(!showResultado)}>
                        <span>🎯 Resultado de aprendizaje</span>
                        <span>{showResultado ? '▲' : '▼'}</span>
                    </div>
                    {showResultado && (
                        <div className="acordeon-content">
                            {sesionActiva.descripcion || "No hay descripción disponible."}
                        </div>
                    )}
                </div>
            </div>

            {/* 3. COLUMNAS DE RECURSOS (Mapeo de Enums) */}
            <div className="fases-grid">
                {/* COLUMNA 1: EXPLORA (ANTES) */}
                <div className="fase-columna fase-explora">
                    <div className="fase-titulo">
                        <span>🔍</span> EXPLORA
                    </div>
                    {recursosExplora.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay recursos previos.</p>}
                    {recursosExplora.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                {/* COLUMNA 2: EXPERIMENTA (DURANTE) */}
                <div className="fase-columna fase-experimenta">
                    <div className="fase-titulo">
                        <span>🧪</span> EXPERIMENTA
                    </div>
                    {recursosExperimenta.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay recursos de clase.</p>}
                    {recursosExperimenta.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                {/* COLUMNA 3: APLICA (DESPUES) */}
                <div className="fase-columna fase-aplica">
                    <div className="fase-titulo">
                        <span>🔨</span> APLICA
                    </div>
                    {recursosAplica.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay tareas o recursos posteriores.</p>}
                    {recursosAplica.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>
            </div>
        </div>
    );
}