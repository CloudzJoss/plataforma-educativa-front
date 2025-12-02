// src/components/GestionarAsistenciaModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GestionarAsistenciaModal.css'; // Crearemos este archivo después

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function GestionarAsistenciaModal({ isOpen, onClose, sesion, onGuardar }) {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Mapeo de estados para mostrar texto amigable
    const ESTADOS = {
        'PRESENTE': { label: 'Presente', icon: '✅', color: '#2e7d32' },
        'TARDE': { label: 'Tarde', icon: '🕒', color: '#f57c00' },
        'FALTA_INJUSTIFICADA': { label: 'Falta', icon: '❌', color: '#c62828' },
        'FALTA_JUSTIFICADA': { label: 'Justificada', icon: '📄', color: '#1565c0' },
        'SIN_REGISTRAR': { label: 'Sin Registrar', icon: '⚪', color: '#757575' }
    };

    useEffect(() => {
        if (isOpen && sesion) {
            cargarAsistencia();
        }
    }, [isOpen, sesion]);

    const cargarAsistencia = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/asistencias/sesion/${sesion.id}`, 
                { withCredentials: true }
            );
            // Si viene SIN_REGISTRAR, lo mantenemos así, o visualmente podríamos preseleccionar algo
            setAlumnos(response.data);
        } catch (err) {
            console.error(err);
            setError("Error al cargar la lista de alumnos.");
        } finally {
            setLoading(false);
        }
    };

    const handleEstadoChange = (alumnoId, nuevoEstado) => {
        setAlumnos(prev => prev.map(alumno => 
            alumno.alumnoId === alumnoId 
                ? { ...alumno, estado: nuevoEstado } 
                : alumno
        ));
    };

    const handleObservacionChange = (alumnoId, texto) => {
        setAlumnos(prev => prev.map(alumno => 
            alumno.alumnoId === alumnoId 
                ? { ...alumno, observacion: texto } 
                : alumno
        ));
    };

    const marcarTodosPresentes = () => {
        setAlumnos(prev => prev.map(a => ({ ...a, estado: 'PRESENTE' })));
    };

    const handleGuardar = async () => {
        setSaving(true);
        try {
            // Validar que no queden 'SIN_REGISTRAR' (Opcional, depende de tu regla de negocio)
            const sinRegistrar = alumnos.find(a => a.estado === 'SIN_REGISTRAR');
            if (sinRegistrar) {
                if(!window.confirm("Hay alumnos sin estado asignado. ¿Deseas continuar?")) {
                    setSaving(false);
                    return;
                }
            }

            const payload = {
                sesionId: sesion.id,
                detalles: alumnos.map(a => ({
                    alumnoId: a.alumnoId,
                    estado: a.estado === 'SIN_REGISTRAR' ? 'FALTA_INJUSTIFICADA' : a.estado, // Default si se olvida
                    observacion: a.observacion
                }))
            };

            await axios.post(`${BASE_URL}/api/asistencias/guardar`, payload, { withCredentials: true });
            
            alert("Asistencia guardada correctamente");
            if (onGuardar) onGuardar();
            onClose();
        } catch (err) {
            console.error(err);
            alert("Error al guardar la asistencia.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content asistencia-modal-width">
                <div className="modal-header">
                    <h3>📋 Asistencia - {sesion?.fecha}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="loading-state">Cargando lista de estudiantes...</div>
                    ) : error ? (
                        <div className="error-state">{error}</div>
                    ) : (
                        <>
                            <div className="toolbar-asistencia">
                                <button className="btn-small-outline" onClick={marcarTodosPresentes}>
                                    ✅ Marcar todos Presentes
                                </button>
                                <span className="total-alumnos">Total: {alumnos.length} alumnos</span>
                            </div>

                            <div className="tabla-container">
                                <table className="asistencia-table">
                                    <thead>
                                        <tr>
                                            <th>Estudiante</th>
                                            <th>Estado</th>
                                            <th>Observación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alumnos.map((alumno) => (
                                            <tr key={alumno.alumnoId} className={alumno.estado === 'SIN_REGISTRAR' ? 'row-pending' : ''}>
                                                <td>
                                                    <div className="student-name">{alumno.nombreAlumno}</div>
                                                    <div className="student-code">{alumno.codigoEstudiante}</div>
                                                </td>
                                                <td>
                                                    <div className="radio-group">
                                                        {['PRESENTE', 'TARDE', 'FALTA_INJUSTIFICADA', 'FALTA_JUSTIFICADA'].map(estadoKey => (
                                                            <label 
                                                                key={estadoKey} 
                                                                className={`radio-label ${alumno.estado === estadoKey ? 'selected' : ''} ${estadoKey.toLowerCase()}`}
                                                                title={ESTADOS[estadoKey].label}
                                                            >
                                                                <input 
                                                                    type="radio" 
                                                                    name={`estado-${alumno.alumnoId}`}
                                                                    value={estadoKey}
                                                                    checked={alumno.estado === estadoKey}
                                                                    onChange={() => handleEstadoChange(alumno.alumnoId, estadoKey)}
                                                                />
                                                                {ESTADOS[estadoKey].label[0]} {/* Primera letra P, T, F, J */}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td>
                                                    <input 
                                                        type="text" 
                                                        className="obs-input"
                                                        placeholder="..."
                                                        value={alumno.observacion || ''}
                                                        onChange={(e) => handleObservacionChange(alumno.alumnoId, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={saving}>Cancelar</button>
                    <button className="btn-save" onClick={handleGuardar} disabled={saving || loading}>
                        {saving ? 'Guardando...' : 'Guardar Asistencia'}
                    </button>
                </div>
            </div>
        </div>
    );
}