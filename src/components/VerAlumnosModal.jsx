import React, { useState, useEffect, useCallback } from 'react'; // ✅ 1. Importar useCallback
import axios from 'axios';
import '../styles/GestionUsuarios.css'; 

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function VerAlumnosModal({ isOpen, onClose, seccion }) {
    const [alumnos, setAlumnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ 2. Envolver la función en useCallback
    const cargarAlumnos = useCallback(async () => {
        if (!seccion) return; // Validación de seguridad

        setLoading(true);
        try {
            const response = await axios.get(
                `${BASE_URL}/api/matriculas/seccion/${seccion.id}/alumnos`, 
                { withCredentials: true }
            );
            setAlumnos(response.data);
        } catch (error) {
            console.error("Error cargando alumnos", error);
            alert("Error al cargar la lista de alumnos");
        } finally {
            setLoading(false);
        }
    }, [seccion]); // Dependencia: Solo se recrea si cambia la 'seccion'

    // ✅ 3. Agregar cargarAlumnos a las dependencias del useEffect
    useEffect(() => {
        if (isOpen && seccion) {
            cargarAlumnos();
        } else {
            setAlumnos([]);
            setSearchTerm('');
        }
    }, [isOpen, seccion, cargarAlumnos]);

    // Filtro Frontend
    const alumnosFiltrados = alumnos.filter(m => 
        m.nombreAlumno.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                        <p><strong>Sección:</strong> {seccion.nombre} ({seccion.codigo})</p>
                        <p><strong>Curso:</strong> {seccion.tituloCurso}</p>
                    </div>

                    <input 
                        type="text" 
                        placeholder="🔍 Buscar estudiante por nombre o código..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                    />

                    {loading ? (
                        <p style={{ textAlign: 'center' }}>Cargando estudiantes...</p>
                    ) : (
                        <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee' }}>
                            <table className="users-table" style={{ width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'white' }}>
                                    <tr>
                                        <th>Código</th>
                                        <th>Estudiante</th>
                                        <th>DNI</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosFiltrados.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                                No hay alumnos encontrados.
                                            </td>
                                        </tr>
                                    ) : (
                                        alumnosFiltrados.map((matricula) => (
                                            <tr key={matricula.id}>
                                                <td>{matricula.codigoEstudiante || '---'}</td>
                                                <td>{matricula.nombreAlumno}</td>
                                                <td>{matricula.dniAlumno}</td>
                                                <td>
                                                    <span style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.85em',
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
                        Total estudiantes: {alumnosFiltrados.length}
                    </div>
                </div>
            </div>
        </div>
    );
}