// src/pages/AulaVirtual.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CrearRecursoModal from '../components/CrearRecursoModal';
import '../styles/AulaVirtual.css';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function AulaVirtual() {
    const { seccionId } = useParams();
    const [sesiones, setSesiones] = useState([]);
    const [sesionActiva, setSesionActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados visuales
    const [showTematica, setShowTematica] = useState(true);
    const [showResultado, setShowResultado] = useState(true);

    // Estados para el Modal de Recursos
    const [showModalRecurso, setShowModalRecurso] = useState(false);
    const [momentoSeleccionado, setMomentoSeleccionado] = useState(null);

    const userRole = localStorage.getItem('userRole');
    const tabsContainerRef = useRef(null);
    
    // Ref para mantener el ID actual sin causar re-renders en fetchSesiones
    const activeSessionIdRef = useRef(null);

    // Mantener el ref sincronizado con el estado
    useEffect(() => {
        activeSessionIdRef.current = sesionActiva?.id;
    }, [sesionActiva]);

    // Función principal de carga (Memoizada con useCallback)
    const fetchSesiones = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
            const sesionesData = response.data || [];
            
            // Ordenar cronológicamente
            sesionesData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
            setSesiones(sesionesData);
            
            // Lógica de Selección Inteligente
            // Usamos el Ref para ver si había una sesión seleccionada previamente
            const currentId = activeSessionIdRef.current;
            
            if (currentId) {
                const sesionActualizada = sesionesData.find(s => s.id === currentId);
                if (sesionActualizada) {
                    setSesionActiva(sesionActualizada);
                    return; 
                }
            }

            // Si es la primera carga o se perdió la referencia
            if (sesionesData.length > 0) {
                const hoy = new Date().toISOString().split('T')[0];
                let sesionObjetivo = sesionesData.find(s => s.fecha >= hoy);
                if (!sesionObjetivo) {
                    sesionObjetivo = sesionesData[sesionesData.length - 1];
                }
                setSesionActiva(sesionObjetivo);
            }
        } catch (error) {
            console.error("Error cargando el aula:", error);
        } finally {
            setLoading(false);
        }
    }, [seccionId]); // Solo depende de seccionId

    // 1. Carga inicial (Ahora sí incluye fetchSesiones)
    useEffect(() => {
        fetchSesiones();
    }, [fetchSesiones]);

    // 2. Auto-scroll (Dependencia corregida a sesionActiva completo)
    useEffect(() => {
        if (sesionActiva && tabsContainerRef.current) {
            const btnId = `tab-btn-${sesionActiva.id}`;
            const activeBtn = document.getElementById(btnId);
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [sesionActiva]); 

    // Handler para abrir el modal
    const handleAbrirModal = (momento) => {
        setMomentoSeleccionado(momento);
        setShowModalRecurso(true);
    };

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

    const recursosAntes = sesionActiva.recursos?.filter(r => r.momento === 'ANTES') || [];
    const recursosDurante = sesionActiva.recursos?.filter(r => r.momento === 'DURANTE') || [];
    const recursosDespues = sesionActiva.recursos?.filter(r => r.momento === 'DESPUES') || [];

    const indexActiva = sesiones.findIndex(s => s.id === sesionActiva.id) + 1;

    return (
        <div className="aula-container">
            <div style={{fontWeight: 'bold', marginBottom: '10px', color: '#666'}}>Sesiones de clase:</div>
            
            <div className="sesiones-tabs" ref={tabsContainerRef}>
                {sesiones.map((sesion, index) => (
                    <button 
                        key={sesion.id}
                        id={`tab-btn-${sesion.id}`}
                        className={`tab-btn ${sesion.id === sesionActiva.id ? 'active' : ''}`}
                        onClick={() => setSesionActiva(sesion)}
                        title={sesion.fecha}
                    >
                        {String(index + 1).padStart(2, '0')}
                    </button>
                ))}
            </div>

            <div className="sesion-header-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                    <div>
                        <div className="sesion-titulo-badge">
                            Sesión {indexActiva}
                        </div>
                        <span style={{marginLeft: 15, color: '#555', fontWeight: 600}}>
                            📅 {new Date(sesionActiva.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                        
                        {new Date(sesionActiva.fecha).toISOString().split('T')[0] === new Date().toISOString().split('T')[0] && (
                            <span style={{marginLeft: 10, color: '#2e7d32', fontWeight: 'bold', backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em'}}>
                                📍 HOY
                            </span>
                        )}
                    </div>
                    
                    {userRole === 'PROFESOR' && (
                        <button 
                            className="btn-asistencia" 
                            onClick={() => alert("🛠️ Funcionalidad de Asistencias: Pendiente de implementar")}
                        >
                            📋 Gestionar Asistencias
                        </button>
                    )}
                </div>

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

            <div className="fases-grid">
                
                {/* COLUMNA 1: ANTES */}
                <div className="fase-columna fase-antes">
                    <div className="fase-titulo"><span>⏮️</span> ANTES</div>
                    <p className="fase-desc">Preparación previa</p>
                    {recursosAntes.length === 0 && <div className="empty-recurso">Sin recursos previos</div>}
                    {recursosAntes.map(r => <RecursoCard key={r.id} recurso={r} />)}
                    
                    {userRole === 'PROFESOR' && (
                        <button className="btn-add-recurso" onClick={() => handleAbrirModal('ANTES')}>+</button>
                    )}
                </div>

                {/* COLUMNA 2: DURANTE */}
                <div className="fase-columna fase-durante">
                    <div className="fase-titulo"><span>🔥</span> DURANTE</div>
                    <p className="fase-desc">Material de clase</p>
                    {recursosDurante.length === 0 && <div className="empty-recurso">Sin material de clase</div>}
                    {recursosDurante.map(r => <RecursoCard key={r.id} recurso={r} />)}

                    {userRole === 'PROFESOR' && (
                        <button className="btn-add-recurso" onClick={() => handleAbrirModal('DURANTE')}>+</button>
                    )}
                </div>

                {/* COLUMNA 3: DESPUÉS */}
                <div className="fase-columna fase-despues">
                    <div className="fase-titulo"><span>⏭️</span> DESPUÉS</div>
                    <p className="fase-desc">Tareas y refuerzo</p>
                    {recursosDespues.length === 0 && <div className="empty-recurso">Sin tareas asignadas</div>}
                    {recursosDespues.map(r => <RecursoCard key={r.id} recurso={r} />)}

                    {userRole === 'PROFESOR' && (
                        <button className="btn-add-recurso" onClick={() => handleAbrirModal('DESPUES')}>+</button>
                    )}
                </div>

            </div>

            {/* MODAL GLOBAL */}
            {sesionActiva && (
                <CrearRecursoModal 
                    isOpen={showModalRecurso}
                    onClose={() => setShowModalRecurso(false)}
                    sesionId={sesionActiva.id}
                    momentoInicial={momentoSeleccionado}
                    onRecursoCreado={() => {
                        fetchSesiones(); 
                    }}
                />
            )}
        </div>
    );
}