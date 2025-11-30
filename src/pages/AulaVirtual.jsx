// src/pages/AulaVirtual.jsx
import React, { useState, useEffect, useRef } from 'react'; // 👈 Agregamos useRef
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

    // Referencia para la barra de pestañas (scroll container)
    const tabsContainerRef = useRef(null);

    // 1. CARGA DE DATOS Y SELECCIÓN INTELIGENTE
    useEffect(() => {
        const fetchSesiones = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
                const sesionesData = response.data || [];
                
                // Ordenar cronológicamente
                sesionesData.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                setSesiones(sesionesData);
                
                // --- LÓGICA: ENCONTRAR LA SESIÓN MÁS CERCANA ---
                if (sesionesData.length > 0) {
                    // Obtenemos la fecha de hoy en formato YYYY-MM-DD para comparar strings (evita problemas de hora)
                    const hoy = new Date().toISOString().split('T')[0];
                    
                    // Buscamos la primera sesión que sea HOY o DESPUÉS de hoy
                    let sesionObjetivo = sesionesData.find(s => s.fecha >= hoy);

                    // Si no hay sesiones futuras (el curso terminó), seleccionamos la última
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
        };

        fetchSesiones();
    }, [seccionId]);

    // 2. EFECTO: AUTO-SCROLL AL BOTÓN ACTIVO ("APUNTAR")
    useEffect(() => {
        if (sesionActiva && tabsContainerRef.current) {
            // Buscamos el botón por su ID único en el DOM
            const btnId = `tab-btn-${sesionActiva.id}`;
            const activeBtn = document.getElementById(btnId);

            if (activeBtn) {
                // Hacemos que el navegador mueva el scroll hasta centrar ese botón
                activeBtn.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest', 
                    inline: 'center' 
                });
            }
        }
    }, [sesionActiva]); // Se ejecuta cada vez que cambia la sesión activa

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
            {/* TABS SUPERIORES */}
            <div style={{fontWeight: 'bold', marginBottom: '10px', color: '#666'}}>Sesiones de clase:</div>
            
            {/* Agregamos la referencia 'ref' aquí */}
            <div className="sesiones-tabs" ref={tabsContainerRef}>
                {sesiones.map((sesion, index) => (
                    <button 
                        key={sesion.id}
                        id={`tab-btn-${sesion.id}`} // 🆔 ID ÚNICO PARA EL SCROLL
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
                        
                        {/* Indicador visual si es la sesión de HOY */}
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
