import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function CrearRecursoModal({ isOpen, onClose, sesionId, momentoInicial, onRecursoCreado }) {
    const [titulo, setTitulo] = useState('');
    const [url, setUrl] = useState('');
    const [tipoArchivo, setTipoArchivo] = useState('LINK'); // LINK, PDF, VIDEO, TAREA
    const [momento, setMomento] = useState('ANTES');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cuando se abre el modal, seteamos el momento según la columna donde se hizo clic
    useEffect(() => {
        if (isOpen && momentoInicial) {
            setMomento(momentoInicial);
            setTitulo('');
            setUrl('');
            setTipoArchivo('LINK');
            setError(null);
        }
    }, [isOpen, momentoInicial]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const payload = {
                titulo,
                url,
                tipoArchivo,
                momento,
                sesionId: sesionId
            };

            // Asegúrate de tener este endpoint en tu Backend (RecursoController)
            await axios.post(`${BASE_URL}/api/recursos`, payload, { withCredentials: true });
            
            // Avisamos al padre (AulaVirtual) que recargue los datos
            onRecursoCreado(); 
            onClose();
        } catch (err) {
            console.error("Error creando recurso:", err);
            setError("No se pudo guardar el recurso. Intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal fixed-modal" style={{ maxWidth: '500px' }}>
                <button className="modal-close" onClick={onClose}>×</button>
                <div className="modal-body">
                    <h2 className="modal-title">Agregar Recurso ({momento})</h2>
                    
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <label>Título del recurso*
                            <input 
                                type="text" 
                                value={titulo} 
                                onChange={e => setTitulo(e.target.value)} 
                                placeholder="Ej: Diapositivas de la clase" 
                                required 
                            />
                        </label>

                        <label>Enlace / URL*
                            <input 
                                type="url" 
                                value={url} 
                                onChange={e => setUrl(e.target.value)} 
                                placeholder="https://..." 
                                required 
                            />
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <label>Tipo
                                <select value={tipoArchivo} onChange={e => setTipoArchivo(e.target.value)}>
                                    <option value="LINK">🔗 Enlace Web</option>
                                    <option value="PDF">📄 Documento PDF</option>
                                    <option value="VIDEO">▶️ Video Youtube</option>
                                    <option value="TAREA">📝 Tarea / Entrega</option>
                                </select>
                            </label>

                            <label>Momento
                                <select value={momento} onChange={e => setMomento(e.target.value)}>
                                    <option value="ANTES">⏮️ Antes</option>
                                    <option value="DURANTE">🔥 Durante</option>
                                    <option value="DESPUES">⏭️ Después</option>
                                </select>
                            </label>
                        </div>

                        {error && <div className="auth-error" style={{ color: 'red', marginTop: 10 }}>{error}</div>}

                        <div className="modal-actions" style={{ marginTop: 20 }}>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Recurso'}
                            </button>
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}