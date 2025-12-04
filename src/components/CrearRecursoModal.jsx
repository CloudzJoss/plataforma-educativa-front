// src/components/CreateRecursoModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function CrearRecursoModal({ isOpen, onClose, sesionId, momentoInicial, onRecursoCreado }) {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState(''); 
    const [url, setUrl] = useState('');
    const [archivo, setArchivo] = useState(null); // Para manejar el input file
    
    // Tipos de recurso disponibles
    const [tipoArchivo, setTipoArchivo] = useState('LINK'); 
    
    const [momento, setMomento] = useState('ANTES');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reiniciar formulario al abrir
    useEffect(() => {
        if (isOpen) {
            setTitulo('');
            setDescripcion('');
            setUrl('');
            setArchivo(null);
            setTipoArchivo('LINK');
            setMomento(momentoInicial || 'ANTES');
            setError(null);
        }
    }, [isOpen, momentoInicial]);

    if (!isOpen) return null;

    // Lógica para saber qué input mostrar
    const esArchivoFisico = ['PDF', 'ARCHIVO', 'IMAGEN'].includes(tipoArchivo);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // --- 1. Validaciones ---
            if (!titulo.trim()) throw new Error("El título es obligatorio");
            if (!esArchivoFisico && !url.trim()) throw new Error("La URL es obligatoria");
            if (esArchivoFisico && !archivo) throw new Error("Debes adjuntar un archivo");

            // --- 2. Preparar FormData (CORRECCIÓN PRINCIPAL) ---
            const formData = new FormData();
            
            // Campos básicos
            formData.append('titulo', titulo);
            formData.append('tipoArchivo', tipoArchivo);
            formData.append('momento', momento);
            formData.append('sesionId', sesionId);
            
            // Campo opcional descripción (solo si tiene texto para evitar enviar "undefined")
            if (descripcion) {
                formData.append('descripcion', descripcion);
            }

            // Campos condicionales según el DTO de Java
            if (esArchivoFisico) {
                // 'archivo' coincide con: private MultipartFile archivo;
                formData.append('archivo', archivo); 
            } else {
                // 'urlExterna' coincide con: private String urlExterna;
                formData.append('urlExterna', url); 
            }

            // --- 3. Enviar al Backend ---
            // Axios detecta FormData y configura automáticamente el header 'multipart/form-data'
            await axios.post(`${BASE_URL}/api/recursos`, formData, { 
                withCredentials: true 
            });
            
            onRecursoCreado(); 
            onClose();

        } catch (err) {
            console.error("Error creando recurso:", err);
            // Intentar obtener el mensaje de error del backend si existe
            const mensajeBackend = err.response?.data?.message || err.response?.data;
            setError(mensajeBackend || err.message || "No se pudo guardar el recurso.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget}>
            <div className="modal fixed-modal" style={{ maxWidth: '600px' }}>
                {/* Botón X superior derecho */}
                <button className="modal-close" onClick={onClose}>×</button>
                
                <div className="modal-body">
                    <h2 className="modal-title" style={{textAlign: 'center', marginBottom: '20px'}}>
                        Agregar Recurso ({momento})
                    </h2>
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        
                        {/* 1. TÍTULO */}
                        <div className="form-group">
                            <label>Título del recurso*</label>
                            <input 
                                type="text" 
                                value={titulo} 
                                onChange={e => setTitulo(e.target.value)} 
                                placeholder="Ej: Diapositivas de la clase" 
                                className="modal-input"
                            />
                        </div>

                        {/* 2. DESCRIPCIÓN */}
                        <div className="form-group">
                            <label>Descripción (Opcional)</label>
                            <textarea 
                                value={descripcion} 
                                onChange={e => setDescripcion(e.target.value)} 
                                placeholder="Breve descripción del contenido..." 
                                className="modal-input"
                                rows="3"
                                style={{resize: 'vertical'}}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {/* 3. TIPO DE RECURSO */}
                            <div className="form-group">
                                <label>Tipo de Recurso</label>
                                <select 
                                    value={tipoArchivo} 
                                    onChange={e => setTipoArchivo(e.target.value)}
                                    className="modal-select"
                                >
                                    <optgroup label="Enlaces">
                                        <option value="LINK">🔗 Enlace Web</option>
                                        <option value="VIDEO">▶️ Video YouTube/Vimeo</option>
                                    </optgroup>
                                    <optgroup label="Archivos">
                                        <option value="PDF">📄 Documento PDF</option>
                                        <option value="IMAGEN">🖼️ Imagen</option>
                                        <option value="ARCHIVO">📁 Archivo General</option>
                                    </optgroup>
                                </select>
                            </div>

                            {/* 4. MOMENTO */}
                            <div className="form-group">
                                <label>Momento</label>
                                <select 
                                    value={momento} 
                                    onChange={e => setMomento(e.target.value)}
                                    className="modal-select"
                                >
                                    <option value="ANTES">⏮️ Antes</option>
                                    <option value="DURANTE">🔥 Durante</option>
                                    <option value="DESPUES">⏭️ Después</option>
                                </select>
                            </div>
                        </div>

                        {/* 5. INPUT DINÁMICO (LINK O ARCHIVO) */}
                        <div className="form-group" style={{marginTop: '10px'}}>
                            <label>
                                {esArchivoFisico ? 'Adjuntar Archivo*' : 'Enlace / URL*'}
                            </label>
                            
                            {esArchivoFisico ? (
                                <div className="file-upload-wrapper">
                                    <input 
                                        type="file" 
                                        id="fileInput"
                                        onChange={e => setArchivo(e.target.files[0])} 
                                        className="file-input-hidden"
                                    />
                                    <label htmlFor="fileInput" className="file-upload-btn">
                                        {archivo ? `📄 ${archivo.name}` : '📂 Seleccionar archivo del equipo'}
                                    </label>
                                </div>
                            ) : (
                                <input 
                                    type="url" 
                                    value={url} 
                                    onChange={e => setUrl(e.target.value)} 
                                    placeholder="https://..." 
                                    className="modal-input"
                                />
                            )}
                        </div>

                        {error && (
                            <div className="auth-error" style={{ 
                                color: '#d32f2f', 
                                backgroundColor: '#ffebee', 
                                padding: '10px', 
                                borderRadius: '4px',
                                marginTop: '10px',
                                fontSize: '0.9em'
                            }}>
                                {typeof error === 'string' ? error : JSON.stringify(error)}
                            </div>
                        )}

                        {/* BOTONES DE ACCIÓN */}
                        <div className="modal-actions" style={{ marginTop: '25px', display: 'flex', gap: '10px' }}>
                            <button 
                                type="submit" 
                                className="btn-save" 
                                disabled={loading}
                            >
                                {loading ? 'Guardando...' : 'Guardar Recurso'}
                            </button>
                            <button 
                                type="button" 
                                className="btn-close-secondary" 
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
