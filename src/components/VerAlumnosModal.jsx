import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/GestionUsuarios.css'; 

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function VerAlumnosModal({ isOpen, onClose, seccion }) {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ Usamos useCallback para que 'cargarAlumnos' sea estable y no rompa el useEffect
    const cargarAlumnos = useCallback(async () => {
        if (!seccion) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/matriculas/seccion/${seccion.id}/alumnos`, 
                { withCredentials: true }
            );
            // El backend ya debe devolver la lista ordenada por apellidos
            setAlumnos(response.data);
        } catch (error) {
            console.error("Error cargando alumnos", error);
            alert("Error al cargar la lista de alumnos");
        } finally {
            setLoading(false);
        }
    }, [seccion]); // Se recrea solo si cambia la sección

    useEffect(() => {
        if (isOpen && seccion) {
            cargarAlumnos();
        } else {
            setAlumnos([]);
            setSearchTerm('');
        }
    }, [isOpen, seccion, cargarAlumnos]); // ✅ Ahora cargarAlumnos es una dependencia válida

    // Filtro Frontend (Buscador)
    const alumnosFiltrados = alumnos.filter(m => 
        m.nombreAlumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.dniAlumno && m.dniAlumno.includes(searchTerm)) ||
        (m.codigoEstudiante && m.codigoEstudiante.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (!isOpen || !seccion) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '700px' }}>
                <div className="modal-header">
                    <h2>👥 Estudiantes Matriculados</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <div className="modal-body">
                    <div style={{ marginBottom: '15px', backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                        <p style={{ margin: '0 0 5px 0' }}><strong>Sección:</strong> {seccion.nombre} ({seccion.codigo})</p>
                        <p style={{ margin: 0 }}><strong>Curso:</strong> {seccion.tituloCurso}</p>
                    </div>

                    <input 
                        type="text" 
                        placeholder="🔍 Buscar por nombre, DNI o código..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="spinner" style={{ width: '30px', height: '30px', display: 'inline-block' }}></div>
                            <p>Cargando estudiantes...</p>
                        </div>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '4px' }}>
                            <table className="users-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 2px 2px -1px rgba(0,0,0,0.1)' }}>
                                    <tr>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>#</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Estudiante</th>
                                        <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Datos</th>
                                        <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                No se encontraron estudiantes.
                                            </td>
                                        </tr>
                                    ) : (
                                        alumnosFiltrados.map((matricula, index) => (
                                            <tr key={matricula.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '10px', color: '#888' }}>{index + 1}</td>
                                                <td style={{ padding: '10px' }}>
                                                    <strong>{matricula.nombreAlumno}</strong>
                                                </td>
                                                <td style={{ padding: '10px', fontSize: '0.9em', color: '#555' }}>
                                                    <div>🆔 {matricula.codigoEstudiante || '---'}</div>
                                                    <div>📄 {matricula.dniAlumno}</div>
                                                </td>
                                                <td style={{ padding: '10px', textAlign: 'center' }}>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '12px',
                                                        fontSize: '0.85em',
                                                        fontWeight: 'bold',
                                                        backgroundColor: matricula.estado === 'ACTIVA' ? '#e8f5e9' : '#ffebee',
                                                        color: matricula.estado === 'ACTIVA' ? '#2e7d32' : '#c62828'
                                                    }}>
                                                        {matricula.estado}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                    
                    <div style={{ marginTop: '15px', textAlign: 'right', fontSize: '0.9em', color: '#666' }}>
                        Mostrando <strong>{alumnosFiltrados.length}</strong> de {alumnos.length} estudiantes
                    </div>
                </div>
            </div>
        </div>
    );
}