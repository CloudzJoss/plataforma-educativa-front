// src/components/EditSeccionModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function EditSeccionModal({ isOpen, onClose, seccionToEdit, onSeccionUpdated }) {
    const [nombre, setNombre] = useState('');
    const [nivelSeccion, setNivelSeccion] = useState('SECUNDARIA');
    const [gradoSeccion, setGradoSeccion] = useState('');
    const [aula, setAula] = useState('');
    const [capacidad, setCapacidad] = useState(30);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [cursoId, setCursoId] = useState('');
    const [profesorDni, setProfesorDni] = useState('');
    const [horarios, setHorarios] = useState([]);
    const [tempDia, setTempDia] = useState('MONDAY');
    const [tempInicio, setTempInicio] = useState('');
    const [tempFin, setTempFin] = useState('');
    const [cursos, setCursos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingCursos, setLoadingCursos] = useState(false);
    const [error, setError] = useState(null);
    const nombreInputRef = useRef(null);

    const formatDateForInput = (isoDate) => {
        if (!isoDate) return '';
        return isoDate.split('T')[0];
    };

    useEffect(() => {
        if (isOpen && seccionToEdit) {
            cargarCursos();
            setNombre(seccionToEdit.nombre || '');
            setNivelSeccion(seccionToEdit.nivelSeccion || 'SECUNDARIA');
            const gradoNum = seccionToEdit.gradoSeccion ? seccionToEdit.gradoSeccion.replace(/\D/g, '') : '';
            setGradoSeccion(gradoNum);
            setAula(seccionToEdit.aula || '');
            setCapacidad(seccionToEdit.capacidad || 30);
            setFechaInicio(formatDateForInput(seccionToEdit.fechaInicio));
            setFechaFin(formatDateForInput(seccionToEdit.fechaFin));
            setCursoId(seccionToEdit.cursoId || '');
            setProfesorDni(seccionToEdit.dniProfesor || ''); 
            setHorarios(seccionToEdit.horarios || []);
            setError(null);
            setTimeout(() => nombreInputRef.current?.focus(), 0);
        }
    }, [isOpen, seccionToEdit]);

    const cargarCursos = async () => {
        setLoadingCursos(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/cursos`, { withCredentials: true });
            setCursos(response.data);
        } catch (err) {
            console.error('Error al cargar cursos:', err);
        } finally {
            setLoadingCursos(false);
        }
    };

    const validarCruceHorarioLocal = (nuevoHorario) => {
        return horarios.some(h => {
            if (h.diaSemana !== nuevoHorario.diaSemana) return false;
            const inicioNuevo = nuevoHorario.horaInicio;
            const finNuevo = nuevoHorario.horaFin;
            const inicioEx = h.horaInicio;
            const finEx = h.horaFin;
            return inicioNuevo < finEx && finNuevo > inicioEx;
        });
    };

    const agregarHorario = () => {
        if (!tempDia || !tempInicio || !tempFin) {
            alert("Complete los campos del horario");
            return;
        }
        if (tempInicio >= tempFin) {
            alert("La hora de inicio debe ser anterior a la de fin");
            return;
        }
        const fmtInicio = tempInicio.length === 5 ? tempInicio + ":00" : tempInicio;
        const fmtFin = tempFin.length === 5 ? tempFin + ":00" : tempFin;
        const nuevoHorario = {
            diaSemana: tempDia,
            horaInicio: fmtInicio, 
            horaFin: fmtFin
        };
        if (validarCruceHorarioLocal(nuevoHorario)) {
            alert(`⚠️ Error: Ya hay un horario asignado el ${tempDia} que choca con ${tempInicio} - ${tempFin}`);
            return;
        }
        setHorarios([...horarios, nuevoHorario]);
        setTempInicio('');
        setTempFin('');
    };

    const eliminarHorario = (index) => {
        const nuevos = [...horarios];
        nuevos.splice(index, 1);
        setHorarios(nuevos);
    };

    const cursosFiltrados = cursos.filter(curso => (curso.nivelDestino || curso.nivel) === nivelSeccion);
    
    const obtenerOpcionesGrado = () => {
        switch (nivelSeccion) {
            case 'INICIAL': return ['1', '2', '3'];
            case 'PRIMARIA': return ['1', '2', '3', '4', '5', '6'];
            case 'SECUNDARIA': return ['1', '2', '3', '4', '5'];
            default: return [];
        }
    };

    const handleNivelChange = (e) => {
        setNivelSeccion(e.target.value);
        setCursoId('');
        setGradoSeccion('');
    };

    if (!isOpen || !seccionToEdit) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (horarios.length === 0) {
            setError("Debe agregar al menos un horario.");
            setLoading(false);
            return;
        }

        const payload = {
            id: seccionToEdit.id,
            nombre: nombre.trim(),
            nivelSeccion: nivelSeccion,
            gradoSeccion: `${gradoSeccion}º Grado`,
            aula: aula.trim(),
            capacidad: parseInt(capacidad),
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            cursoId: parseInt(cursoId),
            profesorDni: profesorDni.trim(),
            horarios: horarios
        };

        try {
            const response = await axios.put(`${BASE_URL}/api/secciones/${seccionToEdit.id}`, payload, { withCredentials: true });
            onSeccionUpdated(response.data);
            onClose();
        } catch (err) {
            // 🚨 MANEJO DE ERROR MEJORADO 🚨
            const msg = err.response?.data?.message || '';
            console.error("Error backend:", msg);

            if (
                msg.toLowerCase().includes('profesor') || 
                msg.toLowerCase().includes('horario') || 
                msg.toLowerCase().includes('cruce') ||
                msg.toLowerCase().includes('conflict') ||
                msg.toLowerCase().includes('overlap')
            ) {
                setError('⛔ NO SE PUEDE ACTUALIZAR: El profesor tiene un cruce de horarios con otra sección.');
            } else {
                setError(msg || 'Error al actualizar la sección');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.currentTarget === e.target && onClose()}>
            <div className="modal fixed-modal" style={{ maxWidth: '600px' }}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-body">
                    <h2 className="modal-title">✏️ Editar Sección: {seccionToEdit.codigo}</h2>

                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <label> Nombre* <input ref={nombreInputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required /> </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label> Nivel* <select value={nivelSeccion} onChange={handleNivelChange} required>
                                <option value="INICIAL">Inicial</option>
                                <option value="PRIMARIA">Primaria</option>
                                <option value="SECUNDARIA">Secundaria</option>
                            </select></label>

                            <label> Grado* <select value={gradoSeccion} onChange={(e) => setGradoSeccion(e.target.value)} required>
                                <option value="">Selecciona</option>
                                {obtenerOpcionesGrado().map((num) => <option key={num} value={num}>{num}º</option>)}
                            </select></label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label> Aula <input type="text" value={aula} onChange={(e) => setAula(e.target.value)} placeholder="Ej: 101" /> </label>
                            <label> Capacidad* <input type="number" value={capacidad} onChange={(e) => setCapacidad(e.target.value)} min="1" required /> </label>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label> Inicio* <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required /> </label>
                            <label> Fin* <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required /> </label>
                        </div>

                        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '4px', border: '1px solid #eee' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em' }}>🕒 Horarios Semanales</h4>
                            
                            <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                <select value={tempDia} onChange={(e) => setTempDia(e.target.value)} style={{ flex: 2 }}>
                                    <option value="MONDAY">Lunes</option>
                                    <option value="TUESDAY">Martes</option>
                                    <option value="WEDNESDAY">Miércoles</option>
                                    <option value="THURSDAY">Jueves</option>
                                    <option value="FRIDAY">Viernes</option>
                                    <option value="SATURDAY">Sábado</option>
                                </select>
                                <input type="time" value={tempInicio} onChange={(e) => setTempInicio(e.target.value)} style={{ flex: 1 }} />
                                <input type="time" value={tempFin} onChange={(e) => setTempFin(e.target.value)} style={{ flex: 1 }} />
                                <button type="button" onClick={agregarHorario} style={{ backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px' }}>+</button>
                            </div>

                            {horarios.length > 0 && (
                                <div style={{ backgroundColor: '#e8f5e9', padding: '8px', borderRadius: '4px', marginBottom: '10px', fontSize: '0.85em', color: '#2e7d32' }}>
                                    ✅ {horarios.length} horario{horarios.length !== 1 ? 's' : ''}
                                </div>
                            )}

                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                {horarios.map((h, idx) => (
                                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: '5px', marginBottom: '5px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.85em' }}>
                                        <span>
                                            <strong>{h.diaSemana}:</strong> {h.horaInicio.substring(0, 5)} - {h.horaFin.substring(0, 5)}
                                        </span>
                                        <button type="button" onClick={() => eliminarHorario(idx)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>
                                    </li>
                                ))}
                                {horarios.length === 0 && <li style={{ color: '#999', textAlign: 'center', fontSize: '0.8em' }}>No hay horarios asignados</li>}
                            </ul>
                        </div>

                        <label style={{ marginTop: '15px' }}> Curso* <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} required disabled={loadingCursos}>
                                <option value="">Selecciona un curso</option>
                                {cursosFiltrados.map((curso) => <option key={curso.id} value={curso.id}>{curso.codigo} - {curso.titulo}</option>)}
                            </select>
                        </label>

                        <label> DNI Profesor* <input type="text" value={profesorDni} onChange={(e) => setProfesorDni(e.target.value)} required /> </label>

                        {/* 🛑 AQUI SE MUESTRA EL ERROR CLARO */}
                        {error && (
                            <div className="auth-error" style={{ 
                                color: '#d32f2f', 
                                marginTop: '15px', 
                                padding: '10px', 
                                backgroundColor: '#ffebee', 
                                borderRadius: '4px',
                                border: '1px solid #ffcdd2',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="submit" className="btn-submit" disabled={loading} style={{ backgroundColor: '#f57c00' }}> 
                                {loading ? 'Guardando...' : 'Guardar Cambios'} 
                            </button>
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}> Cancelar </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}