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
                    
                    console.log("🔍 Datos crudos del backend:", res.data); // Mantiene esto para depurar si hace falta

                    dataNormalizada = res.data.map(matricula => {
                        const seccionBase = matricula.seccion || {};
                        const cursoBase = seccionBase.curso || {}; // Por si viene anidado profundamente
                        
                        // 1. BUSCAR HORARIOS (Prioridad: Matricula > Sección)
                        const horariosReales = matricula.horarios || matricula.horariosSeccion || seccionBase.horarios || [];

                        // 2. BUSCAR NOMBRE DEL CURSO (Búsqueda profunda)
                        // A veces viene en la raíz, a veces dentro de 'seccion', a veces dentro de 'seccion.curso'
                        const nombreReal = 
                            matricula.tituloCurso ||           // 1. Nivel Raíz (DTO aplanado)
                            matricula.nombreCurso ||           // 2. Variante de nombre
                            seccionBase.tituloCurso ||         // 3. Dentro de sección (DTO)
                            cursoBase.titulo ||                // 4. Dentro de seccion -> curso (Entidad pura)
                            seccionBase.nombre ||              // 5. Nombre de la sección
                            'Curso sin nombre';

                        return {
                            id: matricula.seccionId || seccionBase.id || matricula.id,
                            
                            // Asignamos el nombre encontrado
                            tituloCurso: nombreReal,
                            
                            // Priorizamos 'matricula.aulaSeccion'
                            aula: matricula.aulaSeccion || seccionBase.aula || 'Virtual',
                            
                            // Nombre secundario (opcional)
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
