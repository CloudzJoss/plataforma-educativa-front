// src/components/EditarInfoSesionModal.jsx
import React, { useState, useEffect } from 'react';
import '../styles/AulaVirtual.css'; 
import axios from 'axios';

// Asegúrate de que esta URL coincida con tu backend
const BASE_URL = 'https://plataforma-edu-back-gpcsh9h7fddkfvfb.chilecentral-01.azurewebsites.net';

export default function EditarInfoSesionModal({ isOpen, onClose, sesion, onUpdate }) {
    const [tema, setTema] = useState('');
    const [resultado, setResultado] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (sesion) {
            setTema(sesion.tema || '');
            // Mapeamos el campo 'resultado' de la sesión
            setResultado(sesion.resultado || '');
        }
    }, [sesion]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Enviamos 'resultado' en lugar de descripcion
            await axios.patch(
                `${BASE_URL}/api/sesiones/${sesion.id}/info`,
                { tema, resultado },
                { withCredentials: true }
            );
            onUpdate(); // Recargar datos en el padre
            onClose();
        } catch (error) {
            console.error("Error al actualizar sesión", error);
            alert("Error al actualizar la información.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>✏️ Editar Información de la Clase</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Temática:</label>
                        <input
                            type="text"
                            value={tema}
                            onChange={(e) => setTema(e.target.value)}
                            placeholder="Ej: Introducción al Voleibol"
                            maxLength={200}
                            className="form-control"
                        />
                    </div>
                    <div className="form-group" style={{marginTop: '15px'}}>
                        <label>Resultado de Aprendizaje:</label>
                        <textarea
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            placeholder="Ej: El estudiante aprenderá los fundamentos técnicos del saque..."
                            rows={4}
                            maxLength={500}
                            className="form-control"
                        />
                    </div>
                    <div className="modal-actions" style={{marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px'}}>
                        <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
                        <button type="submit" disabled={loading} className="btn-guardar">
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}