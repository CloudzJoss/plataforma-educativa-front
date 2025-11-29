// src/components/HorarioSemanal.jsx
import React from 'react';
import '../styles/HorarioSemanal.css';

const START_HOUR = 7; 
const END_HOUR = 22; 
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAYS_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function HorarioSemanal({ secciones }) {
    
    // Validación de seguridad: si secciones es nulo o indefinido
    if (!secciones || !Array.isArray(secciones)) {
        return <div style={{padding: 20, textAlign: 'center'}}>No hay datos de horario para mostrar.</div>;
    }

    const getPositionStyle = (horaInicio, horaFin) => {
        if (!horaInicio || !horaFin) return { display: 'none' }; // Protección contra horas nulas

        const [hInicio, mInicio] = horaInicio.split(':').map(Number);
        const [hFin, mFin] = horaFin.split(':').map(Number);

        const startMinutes = (hInicio - START_HOUR) * 60 + mInicio;
        const endMinutes = (hFin - START_HOUR) * 60 + mFin;
        const durationMinutes = endMinutes - startMinutes;

        return {
            top: `${(startMinutes / 60) * 60}px`, 
            height: `${(durationMinutes / 60) * 60}px`
        };
    };

    const getColor = (id) => {
        const safeId = id || Math.floor(Math.random() * 100); // Protección si no hay ID
        const colors = ['#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4', '#E1BEE7', '#FFE0B2'];
        return colors[safeId % colors.length];
    };

    return (
        <div className="horario-container">
            <div className="horario-header">
                <div className="time-column-header"></div>
                {DAYS_LABELS.map((day, index) => (
                    <div key={index} className="day-header">{day}</div>
                ))}
            </div>

            <div className="horario-body">
                <div className="time-column">
                    {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                        <div key={i} className="time-slot">
                            <span>{`${START_HOUR + i}:00`}</span>
                        </div>
                    ))}
                </div>

                {DAYS.map((dayKey) => (
                    <div key={dayKey} className="day-column">
                        {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                            <div key={i} className="grid-cell"></div>
                        ))}

                        {/* RENDERIZADO SEGURO */}
                        {secciones.map((seccion, sIdx) => {
                            // Si la sección es nula, la saltamos
                            if (!seccion) return null;
                            
                            // Aseguramos que horarios sea un array
                            const horarios = seccion.horarios || [];

                            return horarios
                                .filter(h => h.diaSemana === dayKey)
                                .map((h, hIdx) => (
                                    <div
                                        key={`${sIdx}-${hIdx}`}
                                        className="event-card"
                                        style={{
                                            ...getPositionStyle(h.horaInicio, h.horaFin),
                                            backgroundColor: getColor(seccion.id),
                                            borderLeft: `4px solid ${getColor(seccion.id).replace('0.2', '1')}`
                                        }}
                                        title={`${seccion.tituloCurso} - ${seccion.aula || 'Virtual'}`}
                                    >
                                        <div className="event-title">{seccion.tituloCurso || seccion.nombre || 'Curso'}</div>
                                        <div className="event-info">
                                            {h.horaInicio?.substring(0, 5)} - {h.horaFin?.substring(0, 5)}
                                        </div>
                                        <div className="event-aula">📍 {seccion.aula || 'Virtual'}</div>
                                    </div>
                                ));
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}