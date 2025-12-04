// src/pages/GestionSecciones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CreateSeccionModal from '../components/CreateSeccionModal';
import EditSeccionModal from '../components/EditSeccionModal';
import VerAlumnosModal from '../components/VerAlumnosModal';
import '../styles/GestionUsuarios.css';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function GestionSecciones() {
    const [secciones, setSecciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [seccionToEdit, setSeccionToEdit] = useState(null);

    // ✅ ESTADOS PARA EL MODAL DE ALUMNOS
    const [showAlumnosModal, setShowAlumnosModal] = useState(false);
    const [seccionParaVerAlumnos, setSeccionParaVerAlumnos] = useState(null);

    const [filtroNivel, setFiltroNivel] = useState('TODOS');
    const [filtroGrado, setFiltroGrado] = useState('TODOS');
    const [filtroActiva, setFiltroActiva] = useState('TODOS');
    const [searchTerm, setSearchTerm] = useState('');

    // 🔧 ENVUELTO EN useCallback PARA EVITAR LOOP INFINITO
    const cargarSecciones = useCallback(async () => {
        console.log('📡 Cargando secciones desde API...');
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${BASE_URL}/api/secciones`, {
                withCredentials: true,
            });
            console.log('✅ Secciones cargadas:', response.data.length);
            setSecciones(response.data);
        } catch (err) {
            console.error('❌ Error al cargar secciones:', err);
            setError('No se pudieron cargar las secciones');
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔧 useEffect CON DEPENDENCY CORRECTO
    useEffect(() => {
        console.log('🔄 GestionSecciones montado');
        cargarSecciones();
    }, [cargarSecciones]);

    const seccionesFiltradas = secciones.filter((seccion) => {
        const coincideNivel =
            filtroNivel === 'TODOS' || seccion.nivelSeccion === filtroNivel;

        const coincideGrado =
            filtroGrado === 'TODOS' ||
            (seccion.gradoSeccion &&
                seccion.gradoSeccion.toString().includes(filtroGrado));

        const coincideActiva =
            filtroActiva === 'TODOS' ||
            (filtroActiva === 'ACTIVA' ? seccion.activa : !seccion.activa);

        const termino = searchTerm.toLowerCase();
        const coincideBusqueda =
            seccion.nombre.toLowerCase().includes(termino) ||
            seccion.codigo.toLowerCase().includes(termino) ||
            seccion.tituloCurso.toLowerCase().includes(termino) ||
            seccion.nombreProfesor.toLowerCase().includes(termino);

        return coincideNivel && coincideGrado && coincideActiva && coincideBusqueda;
    });

    const handleSeccionCreated = (nuevaSeccion) => {
        console.log('✅ Nueva sección creada:', nuevaSeccion.id);
        setSecciones([...secciones, nuevaSeccion]);
    };

    const handleSeccionUpdated = (seccionActualizada) => {
        console.log('✅ Sección actualizada:', seccionActualizada.id);
        setSecciones(
            secciones.map((s) =>
                s.id === seccionActualizada.id ? seccionActualizada : s
            )
        );
    };

    const handleEdit = (seccion) => {
        console.log('📝 Editando sección:', seccion.id);
        setSeccionToEdit(seccion);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta sección?')) return;
        try {
            console.log('🗑️ Eliminando sección:', id);
            await axios.delete(`${BASE_URL}/api/secciones/${id}`, {
                withCredentials: true,
            });
            setSecciones(secciones.filter((s) => s.id !== id));
            alert('Sección eliminada exitosamente');
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || 'No se pudo eliminar la sección';
            console.error('❌ Error al eliminar:', errorMsg);
            alert(errorMsg);
        }
    };

    const handleToggleActiva = async (seccion) => {
        const accion = seccion.activa ? 'desactivar' : 'activar';
        if (!window.confirm(`¿Estás seguro de ${accion} esta sección?`)) return;
        try {
            console.log(`🔄 ${accion}do sección:`, seccion.id);
            const endpoint = seccion.activa ? 'desactivar' : 'activar';
            await axios.patch(
                `${BASE_URL}/api/secciones/${seccion.id}/${endpoint}`,
                {},
                { withCredentials: true }
            );
            setSecciones(
                secciones.map((s) =>
                    s.id === seccion.id ? { ...s, activa: !s.activa } : s
                )
            );
            alert(`Sección ${accion}da exitosamente`);
        } catch (err) {
            const errorMsg =
                err.response?.data?.message || `No se pudo ${accion} la sección`;
            console.error('❌ Error:', errorMsg);
            alert(errorMsg);
        }
    };

    // ✅ HANDLER PARA ABRIR MODAL ALUMNOS
    const handleVerAlumnos = (seccion) => {
        setSeccionParaVerAlumnos(seccion);
        setShowAlumnosModal(true);
    };

    // Helper para formatear la hora (14:00:00 -> 14:00)
    const formatHora = (hora) => (hora ? hora.substring(0, 5) : '');

    // --- ESTADOS: LOADING / ERROR (usando estilos globales) ---
    if (loading) {
        return (
            <div className="gestion-container">
                <div className="loading-state">
                    <div className="spinner" />
                    <p>Cargando secciones...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="gestion-container">
                <div className="error-box">
                    <span>⚠️ {error}</span>
                    <button className="btn-retry" onClick={cargarSecciones}>
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // --- RENDER PRINCIPAL ---
    return (
        <div className="gestion-container">
            {/* Header tipo tarjeta */}
            <div className="gestion-header">
                <div>
                    <h1>Gestión de Secciones</h1>
                    <p className="subtitle">
                        Administra las secciones activas, horarios y asignación de
                        profesores.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn-primary-action"
                >
                    + Nueva sección
                </button>
            </div>

            {/* Filtros */}
            <div className="filters-container">
                <div className="filter-group">
                    <label>Buscar</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Código, nombre, profesor..."
                        className="form-control"
                    />
                </div>

                <div className="filter-group">
                    <label>Nivel</label>
                    <select
                        value={filtroNivel}
                        onChange={(e) => setFiltroNivel(e.target.value)}
                        className="form-control"
                    >
                        <option value="TODOS">Todos</option>
                        <option value="INICIAL">Inicial</option>
                        <option value="PRIMARIA">Primaria</option>
                        <option value="SECUNDARIA">Secundaria</option>
                    </select>
                </div>

                <div className="filter-group">
                    <label>Grado</label>
                    <select
                        value={filtroGrado}
                        onChange={(e) => setFiltroGrado(e.target.value)}
                        className="form-control"
                    >
                        <option value="TODOS">Todos</option>
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>
                                {n}º Grado
                            </option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Estado</label>
                    <select
                        value={filtroActiva}
                        onChange={(e) => setFiltroActiva(e.target.value)}
                        className="form-control"
                    >
                        <option value="TODOS">Todas</option>
                        <option value="ACTIVA">Activas</option>
                        <option value="INACTIVA">Inactivas</option>
                    </select>
                </div>
            </div>

            {/* Tabla de secciones */}
            <div className="table-responsive-wrapper">
                {seccionesFiltradas.length === 0 ? (
                    <div className="empty-state-table">
                        <div>📭</div>
                        <p>No se encontraron secciones que coincidan con los filtros.</p>
                        <small>Prueba ajustando los filtros o la búsqueda.</small>
                    </div>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nombre</th>
                                <th>Curso</th>
                                <th>Nivel / Grado</th>
                                <th>🕒 Horarios</th>
                                <th>Profesor</th>
                                <th>Cupo</th>
                                <th>Periodo</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {seccionesFiltradas.map((seccion) => (
                                <tr key={seccion.id}>
                                    {/* Código */}
                                    <td>
                                        <span className="code-badge">{seccion.codigo}</span>
                                    </td>

                                    {/* Nombre sección */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="fw-bold">{seccion.nombre}</span>
                                        </div>
                                    </td>

                                    {/* Curso */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="fw-bold">{seccion.codigoCurso}</span>
                                            <span className="sub-text">{seccion.tituloCurso}</span>
                                        </div>
                                    </td>

                                    {/* Nivel / Grado */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="fw-bold">{seccion.nivelSeccion}</span>
                                            <span className="sub-text">
                                                {seccion.gradoSeccion
                                                    ? `${seccion.gradoSeccion}º grado`
                                                    : 'Sin grado'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Horarios */}
                                    <td>
                                        {seccion.horarios && seccion.horarios.length > 0 ? (
                                            <ul className="horarios-list">
                                                {seccion.horarios.map((h, idx) => (
                                                    <li key={idx}>
                                                        <strong>{h.diaSemana.substring(0, 3)}:</strong>{' '}
                                                        {formatHora(h.horaInicio)} -{' '}
                                                        {formatHora(h.horaFin)}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-muted">Sin horarios</span>
                                        )}
                                    </td>

                                    {/* Profesor */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="fw-bold">{seccion.nombreProfesor}</span>
                                            <span className="sub-text">{seccion.dniProfesor}</span>
                                        </div>
                                    </td>

                                    {/* Cupo */}
                                    <td>
                                        <span
                                            className="fw-bold"
                                            style={{
                                                color:
                                                    seccion.estudiantesMatriculados >=
                                                        seccion.capacidad
                                                        ? '#d32f2f'
                                                        : '#2e7d32',
                                            }}
                                        >
                                            {seccion.estudiantesMatriculados}/{seccion.capacidad}
                                        </span>
                                    </td>

                                    {/* Periodo */}
                                    <td>
                                        <div className="cell-content">
                                            <span className="sub-text">
                                                {new Date(
                                                    seccion.fechaInicio
                                                ).toLocaleDateString()}
                                            </span>
                                            <span className="sub-text">
                                                {new Date(seccion.fechaFin).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Estado */}
                                    <td>
                                        <span
                                            className={`status-pill ${seccion.activa ? 'active' : 'inactive'
                                                }`}
                                        >
                                            {seccion.activa ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </td>

                                    {/* Acciones */}
                                    <td className="actions-cell">
                                        <button
                                            onClick={() => handleVerAlumnos(seccion)}
                                            className="btn-icon"
                                            title="Ver lista de estudiantes"
                                        >
                                            👥
                                        </button>
                                        <button
                                            onClick={() => handleEdit(seccion)}
                                            className="btn-icon edit"
                                            title="Editar sección"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={() => handleToggleActiva(seccion)}
                                            className="btn-icon lock"
                                            title={seccion.activa ? 'Desactivar' : 'Activar'}
                                        >
                                            {seccion.activa ? '🔒' : '🔓'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(seccion.id)}
                                            className="btn-icon delete"
                                            disabled={seccion.estudiantesMatriculados > 0}
                                            title={
                                                seccion.estudiantesMatriculados > 0
                                                    ? 'No puedes eliminar una sección con alumnos'
                                                    : 'Eliminar sección'
                                            }
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modales */}
            <CreateSeccionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSeccionCreated={handleSeccionCreated}
            />

            <EditSeccionModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSeccionToEdit(null);
                }}
                seccionToEdit={seccionToEdit}
                onSeccionUpdated={handleSeccionUpdated}
            />

            {/* Modal de alumnos */}
            <VerAlumnosModal
                isOpen={showAlumnosModal}
                onClose={() => setShowAlumnosModal(false)}
                seccion={seccionParaVerAlumnos}
            />
        </div>
    );
}
