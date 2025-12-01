// src/pages/AulaVirtual.jsx
// src/pages/AulaVirtual.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

// Componentes
import CrearRecursoModal from '../components/CrearRecursoModal.jsx';
import VerRecursoModal from '../components/VerRecursoModal.jsx';

// Estilos
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

    // Estados para Modales
    const [showModalRecurso, setShowModalRecurso] = useState(false);
    const [momentoSeleccionado, setMomentoSeleccionado] = useState(null);
    const [showVerModal, setShowVerModal] = useState(false);
    const [recursoSeleccionado, setRecursoSeleccionado] = useState(null);

    const userRole = localStorage.getItem('userRole');
    const tabsContainerRef = useRef(null);
    const activeSessionIdRef = useRef(null);

    useEffect(() => {
        activeSessionIdRef.current = sesionActiva?.id;
    }, [sesionActiva]);

    // --- 🛠️ FUNCIÓN PARA CORREGIR FECHAS ---
    // Evita el desfase de zona horaria construyendo la fecha localmente
    const formatearFecha = (fechaString) => {
        if (!fechaString) return '';
        // Asumiendo formato YYYY-MM-DD que viene del backend
        const [anio, mes, dia] = fechaString.split('-');
        // Creamos la fecha usando argumentos numéricos (Año, Mes-1, Día)
        // Esto crea la fecha en hora LOCAL, evitando que se reste un día.
        const fecha = new Date(+anio, +mes - 1, +dia);
        
        return fecha.toLocaleDateString('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
        });
    };

    // Función para detectar si es "HOY" comparando strings, no objetos Date (más seguro)
    const esHoy = (fechaString) => {
        if (!fechaString) return false;
        // Obtenemos la fecha local de hoy en formato YYYY-MM-DD
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = String(hoy.getMonth() + 1).padStart(2, '0');
        const day = String(hoy.getDate()).padStart(2, '0');
        const hoyString = `${year}-${month}-${day}`;
        
        return fechaString === hoyString;
    };
    // ----------------------------------------

    const fetchSesiones = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
            const sesionesData = response.data || [];
            
            // Ordenar por fecha string directamente
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
                // Buscar la sesión más cercana a hoy
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
    }, [seccionId]); 

    useEffect(() => {
        fetchSesiones();
    }, [fetchSesiones]);

    useEffect(() => {
        if (sesionActiva && tabsContainerRef.current) {
            const btnId = `tab-btn-${sesionActiva.id}`;
            const activeBtn = document.getElementById(btnId);
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }
    }, [sesionActiva]); 

    const handleAbrirModalCrear = (momento) => {
        setMomentoSeleccionado(momento);
        setShowModalRecurso(true);
    };

    const handleVisualizarRecurso = (recurso) => {
        setRecursoSeleccionado(recurso);
        setShowVerModal(true);
    };

    const handleCerrarVisor = () => {
        setRecursoSeleccionado(null);
        setShowVerModal(false);
    };

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
                    <button 
                        className="btn-ver" 
                        onClick={() => handleVisualizarRecurso(recurso)}
                    >
                        Ver
                    </button>
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

    // Ordenamiento de recursos (Nuevos abajo)
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
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px'}}>
                    <div>
                        <div className="sesion-titulo-badge">
                            Sesión {indexActiva}
                        </div>
                        {/* ✅ USO DE LA FUNCIÓN CORREGIDA */}
                        <span style={{marginLeft: 15, color: '#555', fontWeight: 600, textTransform: 'capitalize'}}>
                            📅 {formatearFecha(sesionActiva.fecha)}
                        </span>
                        
                        {/* ✅ USO DE LA FUNCIÓN esHoy */}
                        {esHoy(sesionActiva.fecha) && (
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
                        <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('ANTES')}>+</button>
                    )}
                </div>

                {/* COLUMNA 2: DURANTE */}
                <div className="fase-columna fase-durante">
                    <div className="fase-titulo"><span>🔥</span> DURANTE</div>
                    <p className="fase-desc">Material de clase</p>
                    {recursosDurante.length === 0 && <div className="empty-recurso">Sin material de clase</div>}
                    {recursosDurante.map(r => <RecursoCard key={r.id} recurso={r} />)}

                    {userRole === 'PROFESOR' && (
                        <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('DURANTE')}>+</button>
                    )}
                </div>

                {/* COLUMNA 3: DESPUÉS */}
                <div className="fase-columna fase-despues">
                    <div className="fase-titulo"><span>⏭️</span> DESPUÉS</div>
                    <p className="fase-desc">Tareas y refuerzo</p>
                    {recursosDespues.length === 0 && <div className="empty-recurso">Sin tareas asignadas</div>}
                    {recursosDespues.map(r => <RecursoCard key={r.id} recurso={r} />)}

                    {userRole === 'PROFESOR' && (
                        <button className="btn-add-recurso" onClick={() => handleAbrirModalCrear('DESPUES')}>+</button>
                    )}
                </div>

            </div>

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

            <VerRecursoModal 
                isOpen={showVerModal}
                onClose={handleCerrarVisor}
                recurso={recursoSeleccionado}
            />

        </div>
    );
}