import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Componentes
import CrearRecursoModal from '../components/CrearRecursoModal.jsx';
import VerRecursoModal from '../components/VerRecursoModal.jsx';
import EditarInfoSesionModal from '../components/EditarInfoSesionModal.jsx';
import GestionarAsistenciaModal from '../components/GestionarAsistenciaModal.jsx';

// Estilos
import '../styles/AulaVirtual.css';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function AulaVirtual() {
    const { seccionId } = useParams();
    const [sesiones, setSesiones] = useState([]);
    const [sesionActiva, setSesionActiva] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Estados visuales del acordeón
    const [showTematica, setShowTematica] = useState(true);
    const [showResultado, setShowResultado] = useState(true);

    // Estados para Modales de Recursos
    const [showModalRecurso, setShowModalRecurso] = useState(false);
    const [momentoSeleccionado, setMomentoSeleccionado] = useState(null);
    const [showVerModal, setShowVerModal] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);

    // Estado para Modal de Edición de Info
    const [showEditarInfoModal, setShowEditarInfoModal] = useState(false);

    // Estado para Modal de Asistencia (Profesor)
    const [showAsistenciaModal, setShowAsistenciaModal] = useState(false);

    // ✅ NUEVO: Estado para guardar la asistencia del alumno logueado
    const [miAsistencia, setMiAsistencia] = useState(null);

    const userRole = localStorage.getItem('userRole');
    const tabsContainerRef = useRef(null);
    const activeSessionIdRef = useRef(null);

    useEffect(() => {
        activeSessionIdRef.current = sesionActiva?.id;
    }, [sesionActiva]);

    // Función auxiliar para fechas
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        const [anio, mes, dia] = fechaString.split('-');
        const fecha = new Date(+anio, +mes - 1, +dia);
        return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    const esHoy = (fechaString) => {
        if (!fechaString) return false;
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        return fechaString === `${year}-${month}-${day}`;
    };

    // Cargar Sesiones
    const fetchSesiones = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
            const sesionesData = response.data || [];
            
            sesionesData.sort((a, b) => a.fecha.localeCompare(b.fecha));
            setSesiones(sesionesData);
            
            const currentId = activeSessionIdRef.current;
            if (currentId) {
                const sesionActualizada = sesionesData.find(s => s.id === currentId);
                if (sesionActualizada) {
                    setSesionActiva(sesionActualizada);
                    return; 
                }
            }

            if (sesionesData.length > 0) {
                const hoy = new Date().toISOString().split('T')[0];
                let sesionObjetivo = sesionesData.find(s => s.fecha >= hoy);
                if (!sesionObjetivo) sesionObjetivo = sesionesData[sesionesData.length - 1];
                setSesionActiva(sesionObjetivo);
            }
        } catch (error) {
            console.error("Error cargando el aula:", error);
        } finally {
            setLoading(false);
        }
    }, [seccionId]); 

    // ✅ NUEVO: Cargar la asistencia del alumno cuando cambia la sesión activa
    const fetchMiAsistencia = useCallback(async () => {
        if (userRole !== 'ALUMNO' || !sesionActiva) return;

        try {
            const response = await axios.get(
                `${BASE_URL}/api/asistencias/mi-asistencia/sesion/${sesionActiva.id}`, 
                { withCredentials: true }
            );
            setMiAsistencia(response.data);
        } catch (error) {
            console.error("Error cargando mi asistencia:", error);
            setMiAsistencia(null);
        }
    }, [sesionActiva, userRole]);

    useEffect(() => {
        fetchSesiones();
    }, [fetchSesiones]);

    // Ejecutar fetchMiAsistencia cuando cambia la sesión activa
    useEffect(() => {
        if (sesionActiva) {
            fetchMiAsistencia();
        }
    }, [sesionActiva, fetchMiAsistencia]);

    useEffect(() => {
        if (sesionActiva && tabsContainerRef.current) {
            const btnId = `tab-btn-${sesionActiva.id}`;
            const activeBtn = document.getElementById(btnId);
            if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [sesionActiva]); 

    // Handlers de Modales
    const handleAbrirModalCrear = (momento) => { setMomentoSeleccionado(momento); setShowModalRecurso(true); };
    const handleVisualizarRecurso = (recurso) => { setRecursoSeleccionado(recurso); setShowVerModal(true); };
    const handleCerrarVisor = () => { setRecursoSeleccionado(null); setShowVerModal(false); };
    const handleAbrirEdicion = (e) => { e.stopPropagation(); setShowEditarInfoModal(true); };

    // Componente Tarjeta de Recurso
    const RecursoCard = ({ recurso }) => {
        let icono = '📄';
        if (recurso.tipoArchivo === 'LINK') icono = '🔗';
        if (recurso.tipoArchivo === 'VIDEO') icono = '▶️';
        if (recurso.tipoArchivo === 'TAREA') icono = '📝';
        if (recurso.tipoArchivo === 'IMAGEN') icono = '🖼️';

        return (
            <div className="recurso-card">
                <div className="recurso-header">
                    <span className="recurso-icon">{icono}</span>
                    <div className="recurso-info">
                        <span className="recurso-tipo">{recurso.tipoArchivo || 'Recurso'}</span>
                        <div className="recurso-titulo">{recurso.titulo}</div>
                    </div>
                    <span style={{color: '#999', fontSize: '1.2em', cursor:'default'}}>◯</span> 
                </div>
                <div className="recurso-footer">
                    <span className="recurso-fecha">Publicado: {new Date().toLocaleDateString()}</span>
                    <button className="btn-ver" onClick={() => handleVisualizarRecurso(recurso)}>Ver</button>
                </div>
            </div>
        );
    };

    // ✅ Componente Visual para el Estado de Asistencia del Alumno
    const MiAsistenciaBadge = () => {
        if (!miAsistencia) return null;
        
        const estados = {
            'PRESENTE': { text: 'Asististe', bg: '#e8f5e9', color: '#2e7d32', icon: '✅' },
            'TARDE': { text: 'Llegada Tarde', bg: '#fff3e0', color: '#ef6c00', icon: '🕒' },
            'FALTA_INJUSTIFICADA': { text: 'Falta', bg: '#ffebee', color: '#c62828', icon: '❌' },
            'FALTA_JUSTIFICADA': { text: 'Justificada', bg: '#e3f2fd', color: '#1565c0', icon: '📄' },
            'SIN_REGISTRAR': { text: 'Sin Registrar', bg: '#f5f5f5', color: '#757575', icon: '⚪' }
        };

        const estilo = estados[miAsistencia.estado] || estados['SIN_REGISTRAR'];

        return (
            <div style={{
                backgroundColor: estilo.bg,
                color: estilo.color,
                padding: '6px 12px',
                borderRadius: '20px',
                fontWeight: 'bold',
                fontSize: '0.9em',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                border: `1px solid ${estilo.color}40`
            }}>
                <span>{estilo.icon}</span>
                <span>{estilo.text}</span>
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

    const ordenarRecursos = (lista) => lista?.sort((a, b) => a.id - b.id) || [];
    const recursosAntes = ordenarRecursos(sesionActiva.recursos?.filter(r => r.momento === 'ANTES'));
    const recursosDurante = ordenarRecursos(sesionActiva.recursos?.filter(r => r.momento === 'DURANTE'));
    const recursosDespues = ordenarRecursos(sesionActiva.recursos?.filter(r => r.momento === 'DESPUES'));
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', width: '100%'}}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                            <div className="sesion-titulo-badge">Sesión {indexActiva}</div>
                            <span style={{color: '#555', fontWeight: 600, textTransform: 'capitalize'}}>
                                📅 {formatearFecha(sesionActiva.fecha)}
                            </span>
                            {esHoy(sesionActiva.fecha) && (
                                <span style={{color: '#2e7d32', fontWeight: 'bold', backgroundColor: '#e8f5e9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em'}}>
                                    📍 HOY
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        {/* AQUI SE MUESTRA EL BADGE SI ES ALUMNO */}
                        {userRole === 'ALUMNO' && <MiAsistenciaBadge />}

                        {/* Botón Gestionar Asistencia (Solo Profesores) */}
                        {userRole === 'PROFESOR' && (
                            <button 
                                className="btn-asistencia" 
                                onClick={() => setShowAsistenciaModal(true)}
                            >
                                📋 Gestionar Asistencias
                            </button>
                        )}
                    </div>
                </div>

                {/* --- ACORDEONES (Temática y Resultado) --- */}
                <div className="acordeon-item" style={{marginTop: 15}}>
                    <div className="acordeon-header" onClick={() => setShowTematica(!showTematica)}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <span>📄 Temática / Contenido</span>
                            {userRole === 'PROFESOR' && (
                                <button className="btn-icon-edit" onClick={handleAbrirEdicion} title="Editar temática">✏️</button>
                            )}
                        </div>
                        <span>{showTematica ? '▲' : '▼'}</span>
                    </div>
                    {showTematica && (
                        <div className="acordeon-content">
                            {sesionActiva.tema || <span style={{color: '#999', fontStyle: 'italic'}}>El profesor aún no ha definido el tema.</span>}
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
                            {sesionActiva.resultado || <span style={{color: '#999', fontStyle: 'italic'}}>Sin resultado de aprendizaje definido.</span>}
                        </div>
                    )}
                </div>
            </div>

            {/* --- GRID DE RECURSOS --- */}
            <div className="fases-grid">
                <div className="fase-columna fase-antes">
                    <div className="fase-titulo"><span>⏮️</span> ANTES</div>
                    <p className="fase-desc">Preparación previa</p>
                    {recursosAntes.length === 0 && <div className="empty-recurso">Sin recursos previos</div>}
                    {recursosAntes.map(r => <RecursoCard key={r.id} recurso={r} />)}
                    {userRole === 'PROFESOR' && <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('ANTES')}>+</button>}
                </div>

                <div className="fase-columna fase-durante">
                    <div className="fase-titulo"><span>🔥</span> DURANTE</div>
                    <p className="fase-desc">Material de clase</p>
                    {recursosDurante.length === 0 && <div className="empty-recurso">Sin material de clase</div>}
                    {recursosDurante.map(r => <RecursoCard key={r.id} recurso={r} />)}
                    {userRole === 'PROFESOR' && <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('DURANTE')}>+</button>}
                </div>

                <div className="fase-columna fase-despues">
                    <div className="fase-titulo"><span>⏭️</span> DESPUÉS</div>
                    <p className="fase-desc">Tareas y refuerzo</p>
                    {recursosDespues.length === 0 && <div className="empty-recurso">Sin tareas asignadas</div>}
                    {recursosDespues.map(r => <RecursoCard key={r.id} recurso={r} />)}
                    {userRole === 'PROFESOR' && <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('DESPUES')}>+</button>}
                </div>
            </div>

            {/* MODALES */}
            {sesionActiva && (
                <CrearRecursoModal 
                    isOpen={showModalRecurso}
                    onClose={() => setShowModalRecurso(false)}
                    sesionId={sesionActiva.id}
                    momentoInicial={momentoSeleccionado}
                    onRecursoCreado={fetchSesiones}
                />
            )}

            <VerRecursoModal isOpen={showVerModal} onClose={handleCerrarVisor} recurso={recursoSeleccionado} />

            {sesionActiva && (
                <EditarInfoSesionModal
                    isOpen={showEditarInfoModal}
                    onClose={() => setShowEditarInfoModal(false)}
                    sesion={sesionActiva}
                    onUpdate={fetchSesiones}
                />
            )}

            {sesionActiva && (
                <GestionarAsistenciaModal
                    isOpen={showAsistenciaModal}
                    onClose={() => setShowAsistenciaModal(false)}
                    sesion={sesionActiva}
                    onGuardar={() => console.log("Asistencia guardada")}
                />
            )}
        </div>
    );
}