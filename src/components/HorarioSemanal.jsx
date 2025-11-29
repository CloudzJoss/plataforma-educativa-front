// src/components/HorarioSemanal.jsx
import React from 'react';
import '../styles/HorarioSemanal.css';

// Configuración de la grilla
const START_HOUR = 7; // 7:00 AM
const END_HOUR = 22;  // 10:00 PM
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAYS_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function HorarioSemanal({ secciones }) {
    
    // Función para calcular la posición vertical (top) y altura (height) basada en la hora
    const getPositionStyle = (horaInicio, horaFin) => {
        const [hInicio, mInicio] = horaInicio.split(':').map(Number);
        const [hFin, mFin] = horaFin.split(':').map(Number);

        // Convertimos todo a minutos desde el inicio del día (START_HOUR)
        const startMinutes = (hInicio - START_HOUR) * 60 + mInicio;
        const endMinutes = (hFin - START_HOUR) * 60 + mFin;
        const durationMinutes = endMinutes - startMinutes;

        // 60px de altura por hora (según CSS)
        return {
            top: `${(startMinutes / 60) * 60}px`, 
            height: `${(durationMinutes / 60) * 60}px`
        };
    };

    // Función para asignar color según el curso/sección
    const getColor = (id) => {
        const colors = ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#E1BEE7', '#FFE0B2'];
        return colors[id % colors.length]; // Color cíclico basado en ID
    };

    return (
        <div className="horario-container">
            {/* Cabecera de Días */}
            <div className="horario-header">
                <div className="time-column-header"></div> {/* Esquina vacía */}
                {DAYS_LABELS.map((day, index) => (
                    <div key={index} className="day-header">{day}</div>
                ))}
            </div>

            <div className="horario-body">
                {/* Columna de Horas (Eje Y) */}
                <div className="time-column">
                    {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                        <div key={i} className="time-slot">
                            <span>{`${START_HOUR + i}:00`}</span>
                        </div>
                    ))}
                </div>

                {/* Columnas de los Días (Grilla) */}
                {DAYS.map((dayKey, colIndex) => (
                    <div key={dayKey} className="day-column">
                        {/* Líneas de fondo para las horas */}
                        {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                            <div key={i} className="grid-cell"></div>
                        ))}

                        {/* Renderizar Eventos (Bloques de Clase) */}
                        {secciones.map((seccion) => (
                            // Iteramos sobre los horarios de la sección
                            seccion.horarios
                                .filter(h => h.diaSemana === dayKey) // Solo los de este día
                                .map((h, idx) => (
                                    <div
                                        key={`${seccion.id}-${idx}`}
                                        className="event-card"
                                        style={{
                                            ...getPositionStyle(h.horaInicio, h.horaFin),
                                            backgroundColor: getColor(seccion.id),
                                            borderLeft: `4px solid ${getColor(seccion.id).replace('0.2', '1').replace(' lighten', '')}` // Borde un poco más oscuro (simulado)
                                        }}
                                        title={`${seccion.tituloCurso} - ${seccion.aula || 'Virtual'}`}
                                    >
                                        <div className="event-title">{seccion.tituloCurso || seccion.nombre}</div>
                                        <div className="event-info">
                                            {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                        </div>
                                        <div className="event-aula">📍 {seccion.aula || 'Virtual'}</div>
                                    </div>
                                ))
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}