// src/components/Info.jsx
import React from "react";
import "../styles/Info.css";

export default function Info() {
  return (
    <section className="Contenido">
      <main className="info">
        {/* HERO / CABECERA */}
        <header className="info-hero">
          <div className="info-hero-text">
            <p className="info-eyebrow">Institución Educativa</p>
            <h1>Formando líderes para el futuro</h1>
            <p className="info-subtitle">
              Acompañamos a nuestros estudiantes desde sus primeros pasos
              hasta su ingreso a la educación superior, promoviendo valores,
              pensamiento crítico e innovación.
            </p>
          </div>

          <div className="info-hero-highlights">
            <div className="highlight-card">
              <span className="highlight-icon">🎓</span>
              <h3>Excelencia académica</h3>
              <p>
                Plan de estudios actualizado y docentes comprometidos con el
                aprendizaje significativo.
              </p>
            </div>
            <div className="highlight-card">
              <span className="highlight-icon">🤝</span>
              <h3>Formación en valores</h3>
              <p>
                Desarrollamos habilidades socioemocionales y una sólida ética
                personal y ciudadana.
              </p>
            </div>
            <div className="highlight-card">
              <span className="highlight-icon">💻</span>
              <h3>Innovación educativa</h3>
              <p>
                Uso responsable de la tecnología y proyectos que impulsan la
                creatividad y la investigación.
              </p>
            </div>
          </div>
        </header>

        {/* GRID PRINCIPAL DE SECCIONES */}
        <div className="info-grid">
          {/* Sección: Nosotros */}
          <section id="nosotros" className="section-block section-accent">
            <div className="section-header">
              <span className="section-pill">Nosotros</span>
              <h2>Nuestra Institución</h2>
            </div>
            <p>
              Somos una institución educativa comprometida con la excelencia
              académica y el desarrollo integral de nuestros estudiantes.
              Nuestra misión es formar líderes con pensamiento crítico, valores
              sólidos y las habilidades necesarias para enfrentar los retos del
              futuro.
            </p>
            <p>
              Promovemos un ambiente seguro, inclusivo y colaborativo, donde la
              familia y la escuela trabajan de la mano para acompañar cada
              etapa del crecimiento de nuestros alumnos.
            </p>
          </section>

          {/* Sección: Programas */}
          <section id="programas" className="section-block">
            <div className="section-header">
              <span className="section-pill section-pill-secondary">
                Programas
              </span>
              <h2>Programas Educativos</h2>
              <p className="section-description">
                Ofrecemos una propuesta formativa continua, pensada para cada
                etapa del desarrollo:
              </p>
            </div>

            <div className="programs-grid">
              <article className="program-card">
                <h3>Educación Inicial</h3>
                <p className="program-tag">Nido y Preescolar</p>
                <p>
                  Espacios seguros y lúdicos donde los más pequeños
                  desarrollan su autonomía, creatividad y habilidades sociales.
                </p>
              </article>

              <article className="program-card">
                <h3>Educación Primaria</h3>
                <p className="program-tag">1.º a 6.º grado</p>
                <p>
                  Acompañamos el descubrimiento del mundo con énfasis en la
                  comprensión lectora, el razonamiento lógico y el trabajo en
                  equipo.
                </p>
              </article>

              <article className="program-card">
                <h3>Educación Secundaria</h3>
                <p className="program-tag">Formación integral</p>
                <p>
                  Preparamos a los estudiantes para los desafíos académicos y
                  profesionales, fortaleciendo su identidad y proyecto de vida.
                </p>
              </article>

              <article className="program-card">
                <h3>Bachillerato Internacional (IB)</h3>
                <p className="program-tag">Enfoque global</p>
                <p>
                  Programas con estándares internacionales que impulsan la
                  investigación, la reflexión y la ciudadanía global.
                </p>
              </article>

              <article className="program-card program-card-full">
                <h3>Actividades extracurriculares</h3>
                <p className="program-tag">Más allá del aula</p>
                <ul className="program-list">
                  <li>Deportes: fútbol, vóley, básquet, atletismo.</li>
                  <li>Arte: música, teatro, danza y artes plásticas.</li>
                  <li>Tecnología: robótica, programación y proyectos STEAM.</li>
                </ul>
              </article>
            </div>
          </section>

          {/* Sección: Contáctanos */}
          <section id="contactanos" className="section-block section-contact">
            <div className="section-header">
              <span className="section-pill section-pill-accent">
                Contáctanos
              </span>
              <h2>Estamos para ayudarte</h2>
              <p className="section-description">
                ¿Tienes dudas sobre nuestros procesos de admisión, pensiones o
                servicios? Escríbenos o visítanos.
              </p>
            </div>

            <div className="contact-grid">
              <div className="contact-details">
                <div className="contact-item">
                  <span className="contact-icon">📍</span>
                  <div>
                    <h3>Dirección</h3>
                    <p>Av. del Saber 123, Ciudad del Conocimiento</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <div>
                    <h3>Teléfono</h3>
                    <p>(+51) 1 555-1234</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">✉️</span>
                  <div>
                    <h3>Email</h3>
                    <p>admision@mi-escuela.edu</p>
                  </div>
                </div>

                <div className="contact-item">
                  <span className="contact-icon">⏰</span>
                  <div>
                    <h3>Horario de atención</h3>
                    <p>Lunes a Viernes de 8:00 a.m. a 4:00 p.m.</p>
                  </div>
                </div>
              </div>

              <div className="contact-cta">
                <h3>¿Listo para conocer más?</h3>
                <p>
                  Podemos orientarte sobre vacantes, procesos de matrícula y
                  recorridos por la institución.
                </p>
                <button className="contact-button" type="button">
                  Solicitar información
                </button>
                <p className="contact-note">
                  Te responderemos a la brevedad en nuestro horario de atención.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </section>
  );
}
