// src/components/ModalResumenAsistencia.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/ModalResumenAsistencia.css'; // Definiremos esto abajo

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function ModalResumenAsistencia({ isOpen, onClose, seccionId, nombreCurso }) {
    const [asistencias, setAsistencias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ presente: 0, tarde: 0, falta: 0, total: 0 });

    useEffect(() => {
        if (isOpen && seccionId) {
            fetchHistorial();
        }
    }, [isOpen, seccionId]);

    const fetchHistorial = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/asistencias/mis-asistencias/seccion/${seccionId}/historial`,
                { withCredentials: true }
            );
            const data = response.data;
            setAsistencias(data);
            calcularEstadisticas(data);
        } catch (error) {
            console.error("Error cargando historial", error);
        } finally {
            setLoading(false);
        }
    };

    const calcularEstadisticas = (data) => {
        let p = 0, t = 0, f = 0;
        data.forEach(a => {
            if (a.estado === 'PRESENTE') p++;
            else if (a.estado === 'TARDE') t++;
            else if (a.estado.includes('FALTA')) f++;
        });
        setStats({ presente: p, tarde: t, falta: f, total: data.length });
    };

    if (!isOpen) return null;

    // Calculamos porcentajes para el Gráfico Cónico (Pie Chart CSS)
    const total = stats.total > 0 ? stats.total : 1;
    const porcPresente = (stats.presente / total) * 100;
    const porcTarde = (stats.tarde / total) * 100;
    const porcFalta = (stats.falta / total) * 100;

    // CSS Conic Gradient para el gráfico de torta
    const pieStyle = {
        background: `conic-gradient(
            #4caf50 0% ${porcPresente}%, 
            #ff9800 ${porcPresente}% ${porcPresente + porcTarde}%, 
            #f44336 ${porcPresente + porcTarde}% 100%
        )`
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content modal-resumen">
                <div className="modal-header">
                    <h3>📊 Reporte de Asistencia: {nombreCurso}</h3>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="modal-body-resumen">
                    {loading ? <p>Cargando datos...</p> : (
                        <>
                            {/* SECCIÓN SUPERIOR: GRÁFICO Y LEYENDA */}
                            <div className="stats-container">
                                <div className="chart-wrapper">
                                    <div className="pie-chart" style={pieStyle}>
                                        <div className="pie-hole">
                                            <span>{Math.round(porcPresente)}%</span>
                                            <small>Asistencia</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="legend-wrapper">
                                    <div className="legend-item"><span className="dot green"></span> Presentes: <strong>{stats.presente}</strong></div>
                                    <div className="legend-item"><span className="dot orange"></span> Tardanzas: <strong>{stats.tarde}</strong></div>
                                    <div className="legend-item"><span className="dot red"></span> Faltas: <strong>{stats.falta}</strong></div>
                                    <div className="legend-item" style={{marginTop: 10, borderTop: '1px solid #eee', paddingTop: 5}}>
                                        Total Sesiones: <strong>{stats.total}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* SECCIÓN INFERIOR: LISTA DETALLADA */}
                            <h4 style={{marginTop: 20, marginBottom: 10}}>Historial Detallado</h4>
                            <div className="lista-scroll">
                                <table className="tabla-simple">
                                    <thead>
                                        <tr>
                                            <th>Sesión</th>
                                            <th>Estado</th>
                                            <th>Obs.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {asistencias.map((item, index) => (
                                            <tr key={index}>
                                                <td>Sesión {index + 1}</td>
                                                <td>
                                                    <span className={`badge ${item.estado}`}>
                                                        {item.estado.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td><small>{item.observacion || '-'}</small></td>
                                            </tr>
                                        ))}
                                        {asistencias.length === 0 && (
                                            <tr><td colSpan="3" style={{textAlign:'center'}}>No hay registros aún.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}