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
                // 👇 CAMBIO IMPORTANTE: Ahora llamamos al endpoint específico de sesiones
                const response = await axios.get(`${BASE_URL}/api/secciones/${seccionId}/sesiones`, { withCredentials: true });
                
                // La respuesta YA es la lista de sesiones (gracias al nuevo endpoint)
                const sesionesData = response.data || [];
                
                setSesiones(sesionesData);
                
                // Por defecto seleccionamos la sesión más cercana a hoy o la primera
                if (sesionesData.length > 0) {
                    // Lógica opcional: Buscar la sesión de hoy o futura más cercana
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

    // ... (El resto del componente RecursoCard y el return queda IGUAL que antes) ...
    // Solo asegúrate de copiar el resto del código que te pasé en la respuesta anterior
    
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
                    <span style={{color: '#999'}}>◯</span> 
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
            <p>Parece que esta sección aún no tiene el calendario generado.</p>
            {/* Tip para debugging */}
            <p style={{fontSize: '0.8em', marginTop: 20}}>Si eres administrador, edita la sección y guárdala de nuevo para regenerar las sesiones.</p>
        </div>
    );

    // Filtrar recursos por momento
    const recursosExplora = sesionActiva.recursos?.filter(r => r.momento === 'ANTES') || [];
    const recursosExperimenta = sesionActiva.recursos?.filter(r => r.momento === 'DURANTE') || [];
    const recursosAplica = sesionActiva.recursos?.filter(r => r.momento === 'DESPUES') || [];

    // Calcular índice visual (Sesión 01, 02...)
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
                        title={sesion.fecha} // Tooltip con la fecha real
                    >
                        {String(index + 1).padStart(2, '0')}
                    </button>
                ))}
            </div>

            {/* AREA DE CONTENIDO */}
            <div className="sesion-header-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                        <div className="sesion-titulo-badge">
                            Sesión {indexActiva}
                        </div>
                        <span style={{marginLeft: 15, color: '#666', fontWeight: 500}}>
                            📅 {new Date(sesionActiva.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
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

            {/* COLUMNAS DE RECURSOS */}
            <div className="fases-grid">
                <div className="fase-columna fase-explora">
                    <div className="fase-titulo"><span>🔍</span> EXPLORA</div>
                    {recursosExplora.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay recursos previos.</p>}
                    {recursosExplora.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                <div className="fase-columna fase-experimenta">
                    <div className="fase-titulo"><span>🧪</span> EXPERIMENTA</div>
                    {recursosExperimenta.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay recursos de clase.</p>}
                    {recursosExperimenta.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>

                <div className="fase-columna fase-aplica">
                    <div className="fase-titulo"><span>🔨</span> APLICA</div>
                    {recursosAplica.length === 0 && <p style={{fontSize: '0.8em', color: '#999'}}>No hay tareas posteriores.</p>}
                    {recursosAplica.map(r => <RecursoCard key={r.id} recurso={r} />)}
                </div>
            </div>
        </div>
    );
}
