// src/pages/VerHorario.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HorarioSemanal from '../components/HorarioSemanal';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function VerHorario() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        const cargarHorario = async () => {
            setLoading(true);
            try {
                let dataNormalizada = [];

                if (userRole === 'PROFESOR') {
                    // Para el profesor, la data suele venir directa
                    const res = await axios.get(`${BASE_URL}/api/secciones/mis-secciones`, { withCredentials: true });
                    dataNormalizada = res.data;
                } 
                else if (userRole === 'ALUMNO') {
                    // Endpoint de matrículas activas
                    const res = await axios.get(`${BASE_URL}/api/matriculas/mis-matriculas/activas`, { withCredentials: true });
                    
                    // 🛠️ CORRECCIÓN DE MAPEO: Usamos las propiedades directas de la matrícula
                    dataNormalizada = res.data.map(matricula => {
                        const seccionBase = matricula.seccion || {};
                        
                        // Buscamos horarios en todas las posibles ubicaciones
                        const horariosReales = matricula.horarios || matricula.horariosSeccion || seccionBase.horarios || [];

                        return {
                            id: matricula.seccionId || seccionBase.id || matricula.id,
                            
                            // 🚨 AQUÍ ESTABA EL ERROR: 
                            // Priorizamos 'matricula.tituloCurso' (como en MisMatriculas)
                            tituloCurso: matricula.tituloCurso || seccionBase.tituloCurso || seccionBase.nombre || 'Curso sin nombre',
                            
                            // Priorizamos 'matricula.aulaSeccion'
                            aula: matricula.aulaSeccion || seccionBase.aula || 'Virtual',
                            
                            // Nombre secundario (a veces el backend manda nombre de sección vs título de curso)
                            nombre: matricula.nombreSeccion || seccionBase.nombre,
                            
                            horarios: horariosReales
                        };
                    });
                }

                setSecciones(dataNormalizada);
            } catch (err) {
                console.error("Error cargando horario:", err);
                setError("No se pudo cargar el horario.");
            } finally {
                setLoading(false);
            }
        };

        cargarHorario();
    }, [userRole]);

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column' }}>
            <div className="spinner" style={{marginBottom: '10px'}}></div>
            <p style={{color: '#666'}}>Cargando tu horario...</p>
        </div>
    );
    
    if (error) return <div style={{ padding: '20px', color: 'red', textAlign: 'center' }}>⚠️ {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', color: '#333' }}>📅 Mi Horario Semanal</h1>
            
            {secciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📭</div>
                    <p>No tienes clases asignadas o matriculadas actualmente.</p>
                </div>
            ) : (
                <div style={{ background: 'white', padding: '10px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                    <HorarioSemanal secciones={secciones} />
                </div>
            )}
        </div>
    );
}
