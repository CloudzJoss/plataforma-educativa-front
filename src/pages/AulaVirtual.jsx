// src/pages/AulaVirtual.jsx
import React from 'react';
import { useParams } from 'react-router-dom';

export default function AulaVirtual() {
    const { seccionId } = useParams(); // Obtenemos el ID de la URL

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1 style={{ color: '#333' }}>🏫 Aula Virtual</h1>
            <p style={{ fontSize: '1.2em', margin: '20px 0' }}>
                Has ingresado a la sección con ID: 
                <span style={{ backgroundColor: '#e3f2fd', padding: '5px 10px', borderRadius: '4px', marginLeft: '10px', color: '#1565c0', fontWeight: 'bold' }}>
                    {seccionId}
                </span>
            </p>
            <p style={{ color: '#666' }}>
                🚧 Próximamente aquí verás las sesiones, recursos y tareas del curso.
            </p>
        </div>
    );
}