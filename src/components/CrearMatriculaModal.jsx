// src/components/CrearMatriculaModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/GestionUsuarios.css'; // Reutilizamos estilos

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function CrearMatriculaModal({ isOpen, onClose, onMatriculaCreated }) {
    const [alumnos, setAlumnos] = useState([]);
    const [secciones, setSecciones] = useState([]);
    
    const [selectedAlumno, setSelectedAlumno] = useState('');
    const [selectedSeccion, setSelectedSeccion] = useState('');
    const [observaciones, setObservaciones] = useState('');
    
    const [loadingData, setLoadingData] = useState(false);
    const [saving, setSaving] = useState(false);

    // Filtros internos del modal
    const [filtroAlumno, setFiltroAlumno] = useState('');
    const [filtroSeccion, setFiltroSeccion] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarDatos();
            // Resetear formulario
            setSelectedAlumno('');
            setSelectedSeccion('');
            setObservaciones('');
            setFiltroAlumno('');
            setFiltroSeccion('');
        }
    }, [isOpen]);

    const cargarDatos = async () => {
        setLoadingData(true);
        try {
            // 1. Cargar Usuarios (Filtraremos solo alumnos en el front por simplicidad o backend si existe endpoint)
            const resUsuarios = await axios.get(`${BASE_URL}/api/usuarios`, { withCredentials: true });
            const listaAlumnos = resUsuarios.data.filter(u => u.rol === 'ALUMNO');
            setAlumnos(listaAlumnos);

            // 2. Cargar Secciones Activas
            const resSecciones = await axios.get(`${BASE_URL}/api/secciones/activas`, { withCredentials: true });
            setSecciones(resSecciones.data);

        } catch (error) {
            console.error("Error cargando datos para matrícula", error);
            alert("Error al cargar listas de alumnos o secciones.");
        } finally {
            setLoadingData(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedAlumno || !selectedSeccion) {
            alert("Debes seleccionar un alumno y una sección.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                alumnoId: parseInt(selectedAlumno),
                seccionId: parseInt(selectedSeccion),
                observaciones: observaciones
            };

            await axios.post(`${BASE_URL}/api/matriculas/admin/registrar`, payload, { withCredentials: true });
            
            alert("✅ Matrícula registrada exitosamente.");
            onMatriculaCreated();
            onClose();
        } catch (error) {
            console.error(error);
            const msg = error.response?.data?.message || "Error al registrar la matrícula.";
            alert("❌ " + msg);
        } finally {
            setSaving(false);
        }
    };

    // Filtros visuales para las listas
    const alumnosFiltrados = alumnos.filter(a => 
        (a.nombres + ' ' + a.apellidos).toLowerCase().includes(filtroAlumno.toLowerCase()) ||
        (a.dniAlumno && a.dniAlumno.includes(filtroAlumno))
    );

    const seccionesFiltradas = secciones.filter(s => 
        s.nombre.toLowerCase().includes(filtroSeccion.toLowerCase()) ||
        s.tituloCurso.toLowerCase().includes(filtroSeccion.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2>📝 Registrar Nueva Matrícula</h2>
                    <button onClick={onClose} className="close-btn">&times;</button>
                </div>

                <div className="modal-body">
                    {loadingData ? <p>Cargando datos...</p> : (
                        <form onSubmit={handleSubmit} className="form-grid" style={{ display: 'block' }}>
                            
                            {/* SELECCIÓN DE ALUMNO */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>1. Buscar y Seleccionar Alumno:</label>
                                <input 
                                    type="text" 
                                    placeholder="🔍 Filtrar por nombre o DNI..." 
                                    value={filtroAlumno}
                                    onChange={e => setFiltroAlumno(e.target.value)}
                                    className="search-input-modal"
                                    style={{ marginBottom: '5px', width: '100%', padding: '8px' }}
                                />
                                <select 
                                    value={selectedAlumno} 
                                    onChange={e => setSelectedAlumno(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #2e7d32', borderRadius: '4px' }}
                                    size={5} // Muestra 5 opciones a la vez
                                >
                                    {alumnosFiltrados.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.apellidos}, {a.nombres} (DNI: {a.dniAlumno})
                                        </option>
                                    ))}
                                    {alumnosFiltrados.length === 0 && <option disabled>No se encontraron alumnos</option>}
                                </select>
                                {selectedAlumno && <small style={{color: 'green'}}>Alumno seleccionado ID: {selectedAlumno}</small>}
                            </div>

                            {/* SELECCIÓN DE SECCIÓN */}
                            <div className="form-group" style={{ marginBottom: '20px' }}>
                                <label>2. Buscar y Seleccionar Sección:</label>
                                <input 
                                    type="text" 
                                    placeholder="🔍 Filtrar por curso o nombre de sección..." 
                                    value={filtroSeccion}
                                    onChange={e => setFiltroSeccion(e.target.value)}
                                    className="search-input-modal"
                                    style={{ marginBottom: '5px', width: '100%', padding: '8px' }}
                                />
                                <select 
                                    value={selectedSeccion} 
                                    onChange={e => setSelectedSeccion(e.target.value)}
                                    style={{ width: '100%', padding: '10px', border: '1px solid #1976d2', borderRadius: '4px' }}
                                    size={5}
                                >
                                    {seccionesFiltradas.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.tituloCurso} - {s.nombre} ({s.horarios && s.horarios.length > 0 ? s.horarios[0].diaSemana : 'Sin horario'})
                                        </option>
                                    ))}
                                    {seccionesFiltradas.length === 0 && <option disabled>No se encontraron secciones</option>}
                                </select>
                                {selectedSeccion && <small style={{color: '#1976d2'}}>Sección seleccionada ID: {selectedSeccion}</small>}
                            </div>

                            <div className="form-group">
                                <label>Observaciones (Opcional):</label>
                                <textarea 
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    rows="2"
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button type="button" onClick={onClose} className="btn-cancel" disabled={saving}>Cancelar</button>
                                <button type="submit" className="btn-save" disabled={saving}>
                                    {saving ? 'Registrando...' : '✅ Registrar Matrícula'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}