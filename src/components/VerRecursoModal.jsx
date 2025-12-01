import React from 'react';
import '../styles/VerRecursoModal.css';

export default function VerRecursoModal({ isOpen, onClose, recurso }) {
    if (!isOpen || !recurso) return null;

    // --- UTILIDAD: Detectar si es YouTube ---
    const isYoutubeUrl = (url) => {
        return url && (url.includes('youtube.com') || url.includes('youtu.be'));
    };

    // --- LÓGICA DE RENDERIZADO ---

    // 1. Renderizar PDF
    // TRUCO: Usamos el visor de Google Docs para evitar descargas automáticas
    // y problemas de CORS o Headers en Azure.
    const renderPDF = () => {
        // Opción A: Visor de Google (Más compatible)
        const viewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(recurso.url)}&embedded=true`;
        
        return (
            <iframe 
                src={viewerUrl}
                title="Visor PDF"
                className="recurso-iframe"
            />
        );
    };

    // 2. Renderizar Video
    const renderVideo = () => {
        let videoUrl = recurso.url;

        // Convertir link normal a Embed
        if (isYoutubeUrl(videoUrl)) {
            // Extraer ID de video (soporta v=... y youtu.be/...)
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

    // 4. Renderizar Link Externo
    const renderLink = () => (
        <div className="link-fallback">
            <div className="icon-rocket">🚀</div>
            <p className="link-text">
                El enlace externo no se puede previsualizar aquí por seguridad.
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

    // --- SELECTOR DE CONTENIDO INTELIGENTE ---
    const renderContenido = () => {
        const { tipoArchivo, url } = recurso;

        // A. Si es PDF
        if (tipoArchivo === 'PDF') return renderPDF();

        // B. Si es IMAGEN
        if (tipoArchivo === 'IMAGEN') return renderImagen();

        // C. Lógica Inteligente para Video/Link
        // Si el backend dice VIDEO, O si dice LINK pero parece YouTube -> Renderizar Video
        if (tipoArchivo === 'VIDEO' || (tipoArchivo === 'LINK' && isYoutubeUrl(url))) {
            return renderVideo();
        }

        // D. Resto de casos (Link genérico o archivo desconocido)
        return renderLink();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container-large" onClick={(e) => e.stopPropagation()}>
                
                <div className="modal-header-orange">
                    <div className="header-content">
                        <span className="header-icon">
                            {recurso.tipoArchivo === 'VIDEO' || isYoutubeUrl(recurso.url) ? '▶️' : 
                             recurso.tipoArchivo === 'PDF' ? '📄' : 
                             recurso.tipoArchivo === 'IMAGEN' ? '🖼️' : '🔗'}
                        </span>
                        <div>
                            <h3 className="header-title">{recurso.titulo}</h3>
                            <span className="header-subtitle">
                                {recurso.tipoArchivo} - {recurso.descripcion || 'Visualización'}
                            </span>
                        </div>
                    </div>
                    <button className="btn-close-white" onClick={onClose}>×</button>
                </div>

                <div className="modal-body-content">
                    {renderContenido()}
                </div>

                <div className="modal-footer-simple">
                    <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                    <a href={recurso.url} target="_blank" rel="noreferrer" className="btn-primary-outline">
                        Abrir en nueva pestaña ↗
                    </a>
                </div>
            </div>
        </div>
    );
}