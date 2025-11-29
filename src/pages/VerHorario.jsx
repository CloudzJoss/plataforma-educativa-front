import React, { useState, useEffect } from 'react';
import axios from 'axios';
import HorarioSemanal from '../components/HorarioSemanal'; // Asegúrate de haber creado este componente en el paso anterior

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function VerHorario() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userRole = localStorage.getItem('userRole'); // Obtenemos el rol

    useEffect(() => {
        const cargarHorario = async () => {
            setLoading(true);
            try {
                let data = [];

                if (userRole === 'PROFESOR') {
                    // 1. Si es PROFESOR: Traemos sus secciones directas
                    const res = await axios.get(`${BASE_URL}/api/secciones/mis-secciones`, { withCredentials: true });
                    data = res.data;
                } 
                else if (userRole === 'ALUMNO') {
                    // 2. Si es ALUMNO: Traemos sus matrículas y extraemos la sección de cada una
                    const res = await axios.get(`${BASE_URL}/api/matriculas/mis-matriculas/activas`, { withCredentials: true });
                    // Transformamos: de [Matricula] -> [Seccion]
                    data = res.data.map(matricula => matricula.seccion);
                }

                setSecciones(data);
            } catch (err) {
                console.error("Error cargando horario:", err);
                setError("No se pudo cargar el horario.");
            } finally {
                setLoading(false);
            }
        };

        cargarHorario();
    }, [userRole]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Cargando tu horario... 🕒</div>;
    if (error) return <div style={{ padding: '20px', color: 'red' }}>⚠️ {error}</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '20px', color: '#333' }}>📅 Mi Horario Semanal</h1>
            
            {secciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666', background: 'white', borderRadius: '8px' }}>
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