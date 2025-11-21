// src/components/EditSeccionModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function EditSeccionModal({ isOpen, onClose, seccionToEdit, onSeccionUpdated }) {
    // --- Estados del Formulario ---
    const [nombre, setNombre] = useState('');
    const [nivelSeccion, setNivelSeccion] = useState('SECUNDARIA');
    const [gradoSeccion, setGradoSeccion] = useState('');
    const [turno, setTurno] = useState('MAÑANA');
    const [aula, setAula] = useState('');
    const [capacidad, setCapacidad] = useState(30);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cursoId, setCursoId] = useState('');
    const [profesorDni, setProfesorDni] = useState('');

    // --- Estados auxiliares ---
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCursos, setLoadingCursos] = useState(false);
    const [error, setError] = useState(null);
    const nombreInputRef = useRef(null);

    // --- Cargar datos de la sección al abrir ---
    useEffect(() => {
        if (isOpen && seccionToEdit) {
            setNombre(seccionToEdit.nombre || '');
            setNivelSeccion(seccionToEdit.nivelSeccion || 'SECUNDARIA');
            setGradoSeccion(seccionToEdit.gradoSeccion || '');
            setTurno(seccionToEdit.turno || 'MAÑANA');
            setAula(seccionToEdit.aula || '');
            setCapacidad(seccionToEdit.capacidad || 30);
            setFechaInicio(seccionToEdit.fechaInicio || '');
            setFechaFin(seccionToEdit.fechaFin || '');
            setCursoId(seccionToEdit.cursoId || '');
            setProfesorDni(seccionToEdit.dniProfesor || '');
            setError(null);
            cargarCursos();
            setTimeout(() => nombreInputRef.current?.focus(), 0);
        }
    }, [isOpen, seccionToEdit]);

    const cargarCursos = async () => {
        setLoadingCursos(true);
        try {
            const response = await axios.get('http://localhost:8081/api/cursos', {
                withCredentials: true
            });
            setCursos(response.data);
        } catch (err) {
            console.error('Error al cargar cursos:', err);
            setError('No se pudieron cargar los cursos disponibles');
        } finally {
            setLoadingCursos(false);
        }
    };

    if (!isOpen || !seccionToEdit) {
        return null;
    }

    // --- Manejo de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const API_URL = `http://localhost:8081/api/secciones/${seccionToEdit.id}`;

        const payload = {
            nombre: nombre.trim(),
            nivelSeccion: nivelSeccion,
            gradoSeccion: gradoSeccion.trim(),
            turno: turno,
            aula: aula.trim(),
            capacidad: parseInt(capacidad),
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            cursoId: parseInt(cursoId),
            profesorDni: profesorDni.trim()
        };

        // Validación
        if (!payload.nombre || !payload.gradoSeccion || !payload.fechaInicio ||
            !payload.fechaFin || !payload.cursoId || !payload.profesorDni) {
            setError('Todos los campos obligatorios deben ser completados');
            setLoading(false);
            return;
        }

        if (payload.capacidad < 1 || payload.capacidad > 100) {
            setError('La capacidad debe estar entre 1 y 100');
            setLoading(false);
            return;
        }

        // Evitar peticiones si no hay cambios
        if (payload.nombre === seccionToEdit.nombre &&
            payload.nivelSeccion === seccionToEdit.nivelSeccion &&
            payload.gradoSeccion === seccionToEdit.gradoSeccion &&
            payload.turno === seccionToEdit.turno &&
            payload.aula === (seccionToEdit.aula || '') &&
            payload.capacidad === seccionToEdit.capacidad &&
            payload.fechaInicio === seccionToEdit.fechaInicio &&
            payload.fechaFin === seccionToEdit.fechaFin &&
            payload.cursoId === seccionToEdit.cursoId &&
            payload.profesorDni === seccionToEdit.dniProfesor) {
            setError('No se realizaron cambios.');
            setLoading(false);
            return;
        }

        try {
            console.log('Enviando solicitud para actualizar sección:', payload);

            const response = await axios.put(API_URL, payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Sección actualizada exitosamente:', response.data);
            onSeccionUpdated(response.data);
            onClose();

        } catch (err) {
            console.error('Error al actualizar sección:', err);

            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;

                if (status === 401) {
                    setError('No estás autenticado. Por favor, inicia sesión nuevamente.');
                } else if (status === 403) {
                    setError('No tienes permisos de Administrador para editar secciones.');
                } else if (status === 404) {
                    setError('La sección no existe o fue eliminada.');
                } else if (status === 400 && errorData?.message) {
                    setError(errorData.message);
                } else if (status === 500) {
                    const errorMsg = errorData?.message || errorData?.error || 'Error interno del servidor';
                    setError(`Error del servidor: ${errorMsg}`);
                } else if (errorData?.message) {
                    setError(errorData.message);
                } else {
                    setError(`Error del servidor: ${status}`);
                }
            } else if (err.request) {
                setError('No se pudo conectar con el servidor. Verifica tu conexión.');
            } else {
                setError('Ocurrió un error inesperado: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
            <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="edit-seccion-title">
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
                <div className="modal-body">
                    <h2 id="edit-seccion-title" className="modal-title">
                        Editar Sección
                    </h2>

                    <div style={{
                        fontSize: '0.9em',
                        color: '#666',
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span><strong>Código:</strong> {seccionToEdit.codigo}</span>
                        <span style={{ fontSize: '0.85em', color: '#999' }}>
                            (El código no se puede modificar)
                        </span>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <label>
                            Nombre de la Sección*
                            <input
                                ref={nombreInputRef}
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                placeholder="Ej: Matemática - 5to A - Mañana"
                                required
                            />
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label>
                                Nivel*
                                <select
                                    value={nivelSeccion}
                                    onChange={(e) => setNivelSeccion(e.target.value)}
                                    required
                                >
                                    <option value="INICIAL">Inicial</option>
                                    <option value="PRIMARIA">Primaria</option>
                                    <option value="SECUNDARIA">Secundaria</option>
                                </select>
                            </label>

                            <label>
                                Grado*
                                <input
                                    type="text"
                                    value={gradoSeccion}
                                    onChange={(e) => setGradoSeccion(e.target.value)}
                                    placeholder="Ej: 5to A"
                                    required
                                />
                            </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label>
                                Turno*
                                <select
                                    value={turno}
                                    onChange={(e) => setTurno(e.target.value)}
                                    required
                                >
                                    <option value="MAÑANA">Mañana</option>
                                    <option value="TARDE">Tarde</option>
                                    <option value="NOCHE">Noche</option>
                                </select>
                            </label>

                            <label>
                                Aula
                                <input
                                    type="text"
                                    value={aula}
                                    onChange={(e) => setAula(e.target.value)}
                                    placeholder="Ej: Aula 101"
                                />
                            </label>
                        </div>

                        <label>
                            Capacidad Máxima*
                            <input
                                type="number"
                                value={capacidad}
                                onChange={(e) => setCapacidad(e.target.value)}
                                min="1"
                                max="100"
                                required
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '0.85em' }}>
                                Estudiantes matriculados: {seccionToEdit.estudiantesMatriculados || 0}
                            </small>
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label>
                                Fecha de Inicio*
                                <input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    required
                                />
                            </label>

                            <label>
                                Fecha de Fin*
                                <input
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    required
                                />
                            </label>
                        </div>

                        <label>
                            Curso*
                            <select
                                value={cursoId}
                                onChange={(e) => setCursoId(e.target.value)}
                                required
                                disabled={loadingCursos}
                            >
                                <option value="">
                                    {loadingCursos ? 'Cargando cursos...' : 'Selecciona un curso'}
                                </option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.codigo} - {curso.titulo} ({curso.nivelDestino})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            DNI del Profesor*
                            <input
                                type="text"
                                value={profesorDni}
                                onChange={(e) => setProfesorDni(e.target.value)}
                                placeholder="Ej: 12345678"
                                required
                            />
                            <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '0.85em' }}>
                                Profesor actual: {seccionToEdit.nombreProfesor}
                            </small>
                        </label>

                        {error && (
                            <div className="auth-error" style={{
                                color: '#d32f2f',
                                backgroundColor: '#ffebee',
                                padding: '12px',
                                borderRadius: '4px',
                                marginTop: '10px',
                                border: '1px solid #ef5350'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={loading || loadingCursos}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}