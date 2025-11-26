// src/components/CreateSeccionModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function CreateSeccionModal({ isOpen, onClose, onSeccionCreated }) {
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

    // --- Cargar cursos al abrir el modal ---
    useEffect(() => {
        if (isOpen) {
            limpiarFormulario();
            cargarCursos();
            setTimeout(() => nombreInputRef.current?.focus(), 0);
        }
    }, [isOpen]);

    const limpiarFormulario = () => {
        setNombre('');
        setNivelSeccion('SECUNDARIA');
        setGradoSeccion('');
        setTurno('MAÑANA');
        setAula('');
        setCapacidad(30);
        setFechaInicio('');
        setFechaFin('');
        setCursoId('');
        setProfesorDni('');
        setError(null);
    };

    const cargarCursos = async () => {
        setLoadingCursos(true);
        try {
            // ✅ URL ORIGINAL NO MODIFICADA
            const response = await axios.get('https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/cursos', {
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

    // --- 🟢 LÓGICA NUEVA: Filtrado de Cursos y Grados ---

    // 1. Filtrar cursos para que solo salgan los del nivel seleccionado
    const cursosFiltrados = cursos.filter(curso => 
        (curso.nivelDestino || curso.nivel) === nivelSeccion
    );

    // 2. Definir los rangos de grados según el nivel
    const obtenerOpcionesGrado = () => {
        switch (nivelSeccion) {
            case 'INICIAL':
                return ['1', '2', '3']; // 1 a 3
            case 'PRIMARIA':
                return ['1', '2', '3', '4', '5', '6']; // 1 a 6
            case 'SECUNDARIA':
                return ['1', '2', '3', '4', '5']; // 1 a 5
            default:
                return [];
        }
    };

    // 3. Manejador para cambio de nivel (Resetea curso y grado para evitar errores)
    const handleNivelChange = (e) => {
        setNivelSeccion(e.target.value);
        setCursoId('');     // Limpia el curso seleccionado porque cambia la lista
        setGradoSeccion(''); // Limpia el grado porque cambia el rango
    };

    if (!isOpen) {
        return null;
    }

    // --- Manejo de Envío ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // ✅ URL ORIGINAL NO MODIFICADA
        const API_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net/api/secciones';

        // Formateamos el grado para enviarlo (Ej: "5º Grado" o solo "5" según prefieras)
        // Aquí lo envío formateado para que se vea bien en la tabla luego.
        const gradoFinal = gradoSeccion ? `${gradoSeccion}º Grado` : '';

        const payload = {
            nombre: nombre.trim(),
            nivelSeccion: nivelSeccion,
            gradoSeccion: gradoFinal, 
            turno: turno,
            aula: aula.trim(),
            capacidad: parseInt(capacidad),
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            cursoId: parseInt(cursoId),
            profesorDni: profesorDni.trim()
        };

        // Validación
        if (!payload.nombre || !gradoSeccion || !payload.fechaInicio || 
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

        try {
            console.log('Enviando solicitud para crear sección:', payload);

            const response = await axios.post(API_URL, payload, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            console.log('Sección creada exitosamente:', response.data);
            onSeccionCreated(response.data);
            onClose();

        } catch (err) {
            console.error('Error al crear sección:', err);
            // ... (Manejo de errores original)
            if (err.response) {
                const status = err.response.status;
                const errorData = err.response.data;
                if (status === 400 && errorData?.message) {
                    setError(errorData.message);
                } else {
                    setError(errorData?.message || 'Error al crear la sección');
                }
            } else {
                setError('Error de conexión');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
            <div className="modal fixed-modal" role="dialog" aria-modal="true" aria-labelledby="create-seccion-title">
                <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
                <div className="modal-body">
                    <h2 id="create-seccion-title" className="modal-title">Crear Nueva Sección</h2>

                    <p style={{
                        fontSize: '0.9em',
                        color: '#666',
                        marginBottom: '20px',
                        padding: '10px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        borderLeft: '3px solid #2196F3'
                    }}>
                        ℹ️ El código de la sección se generará automáticamente.
                    </p>

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
                                    onChange={handleNivelChange}
                                    required
                                >
                                    <option value="INICIAL">Inicial</option>
                                    <option value="PRIMARIA">Primaria</option>
                                    <option value="SECUNDARIA">Secundaria</option>
                                </select>
                            </label>

                            <label>
                                Grado*
                                <select
                                    value={gradoSeccion}
                                    onChange={(e) => setGradoSeccion(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona</option>
                                    {obtenerOpcionesGrado().map((num) => (
                                        <option key={num} value={num}>{num}º</option>
                                    ))}
                                </select>
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
                                Aula (Libre)
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
                                    {loadingCursos ? 'Cargando cursos...' : 
                                     cursosFiltrados.length === 0 ? 'No hay cursos para este nivel' : 'Selecciona un curso'}
                                </option>
                                {cursosFiltrados.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.codigo} - {curso.titulo}
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
                                Ingresa el DNI del profesor asignado a esta sección
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
                                {loading ? 'Creando...' : 'Crear Sección'}
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