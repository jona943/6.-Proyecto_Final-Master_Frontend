import { IconUserPlus } from '../../../../components/icons/Icons'

function ScarcityCtaSection({ onNavigate, onScrollToManifiesto }) {
  return (
    <section id="escasez" className="scarcity-cta-section">
      {/* Horizonte de luz de transición desde el Manifiesto */}
      <div className="scarcity-horizon-light" aria-hidden="true" />
      <div className="scarcity-ambient-glow" aria-hidden="true" />

      <div className="scarcity-container">
        {/* Tarjeta de Escasez Matemática e Invitación Final (Carta 3) */}
        <div className="scarcity-card">
          <div className="scarcity-meta-tag">
            <span className="scarcity-dot" />
            <span>NAMESPACE FINITO · 3 A 10 CARACTERES</span>
          </div>

          <h2 className="scarcity-title">
            Cuando un alias es reclamado, el registro se sella para siempre.
          </h2>

          <p className="scarcity-desc">
            El protocolo Nexu restringe los identificadores a combinaciones alfanuméricas estrictas. Sin números aleatorios obligatorios (#0042), sin sufijos comerciales y sin reventa de identificadores. Tu @alias es tu soberanía digital a perpetuidad.
          </p>

          <div className="scarcity-metrics-row">
            <div className="metric-box">
              <span className="metric-value">3 - 10</span>
              <span className="metric-label">Caracteres estrictos</span>
            </div>
            <div className="metric-box">
              <span className="metric-value">0</span>
              <span className="metric-label">Números de teléfono</span>
            </div>
            <div className="metric-box">
              <span className="metric-value">100%</span>
              <span className="metric-label">Propiedad por credencial</span>
            </div>
          </div>

          <div className="scarcity-actions">
            <button
              type="button"
              className="btn-final-primary"
              onClick={() => onNavigate && onNavigate('register')}
            >
              <IconUserPlus />
              <span>Reclamar mi Alias</span>
            </button>
            <button
              type="button"
              className="btn-final-secondary"
              onClick={() => onNavigate && onNavigate('login')}
            >
              <span>Iniciar sesión</span>
            </button>
          </div>
        </div>
      </div>

      {/* Micro-Footer Integrado en la Base de la Carta 3 */}
      <div className="scarcity-footer-bar">
        <div className="scarcity-footer-brand">
          <span className="logo-tiny">N</span>
          <span>Nexu</span>
          <span className="footer-pill">v1.0</span>
        </div>

        <div className="scarcity-footer-links">
          <button
            type="button"
            className="scarcity-footer-link"
            onClick={onScrollToManifiesto}
          >
            El Manifiesto
          </button>
          <span>·</span>
          <a href="#privacidad" className="scarcity-footer-link">Privacidad</a>
          <span>·</span>
          <a href="#terminos" className="scarcity-footer-link">Términos de Servicio</a>
        </div>

        <p className="scarcity-footer-copy">
          © 2026 Nexu · Cero rastreo, cero publicidad.
        </p>
      </div>
    </section>
  )
}

export default ScarcityCtaSection
