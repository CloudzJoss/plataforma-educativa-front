import React from 'react';
import '../styles/VerRecursoModal.css';

export default function VerRecursoModal({ isOpen, onClose, recurso }) {
    if (!isOpen || !recurso) return null;

    // --- LÓGICA DE RENDERIZADO ---

    // 1. Renderizar PDF
    const renderPDF = () => (
        <iframe 
            src={recurso.url} 
            title="Visor PDF"
            className="recurso-iframe"
        />
    );

    // 2. Renderizar Video (Detectar si es YouTube)
    const renderVideo = () => {
        let videoUrl = recurso.url;

        // Convertir link de YouTube normal a Embed si es necesario
        // Ej: https://www.youtube.com/watch?v=VIDEO_ID -> https://www.youtube.com/embed/VIDEO_ID
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('/').pop();
            videoUrl = `https://www.youtube.com/embed/${videoId}`;
        }

        return (
            <iframe
                src={videoUrl}
                title="Visor Video"
                className="recurso-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        );
    };

    // 3. Renderizar Imagen
    const renderImagen = () => (
        <div className="imagen-container">
            <img src={recurso.url} alt={recurso.titulo} className="recurso-img" />
        </div>
    );

    // 4. Renderizar Link Externo (Para webs que no permiten iframe)
    const renderLink = () => (
        <div className="link-fallback">
            <div className="icon-rocket">🚀</div>
            <p className="link-text">
                El enlace externo no se puede previsualizar aquí por seguridad del sitio web.
                <br />
                Haz clic abajo para abrirlo en una nueva pestaña.
            </p>
            <a 
                href={recurso.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-visualizar"
            >
                Visualizar enlace
            </a>
        </div>
    );

    // --- SELECTOR DE CONTENIDO ---
    const renderContenido = () => {
        switch (recurso.tipoArchivo) {
            case 'PDF': return renderPDF();
            case 'VIDEO': return renderVideo();
            case 'IMAGEN': return renderImagen();
            case 'LINK': return renderLink();
            default: return renderLink(); // Fallback seguro
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container-large" onClick={(e) => e.stopPropagation()}>
                
                {/* HEADER (Naranja como en tu diseño) */}
                <div className="modal-header-orange">
                    <div className="header-content">
                        {/* Icono dinámico según tipo */}
                        <span className="header-icon">
                            {recurso.tipoArchivo === 'VIDEO' ? '▶️' : 
                             recurso.tipoArchivo === 'PDF' ? '📄' : 
                             recurso.tipoArchivo === 'LINK' ? '🔗' : '📁'}
                        </span>
                        <div>
                            <h3 className="header-title">{recurso.titulo}</h3>
                            <span className="header-subtitle">{recurso.tipoArchivo} - {recurso.descripcion || 'Sin descripción'}</span>
                        </div>
                    </div>
                    <button className="btn-close-white" onClick={onClose}>×</button>
                </div>

                {/* BODY (Contenido dinámico) */}
                <div className="modal-body-content">
                    {renderContenido()}
                </div>

                {/* FOOTER (Opcional) */}
                <div className="modal-footer-simple">
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                    {/* Botón extra para descargar/abrir en pestaña nueva siempre disponible */}
                    <a href={recurso.url} target="_blank" rel="noreferrer" className="btn-primary-outline">
                        Abrir en nueva pestaña ↗
                    </a>
                </div>
            </div>
        </div>
    );
}