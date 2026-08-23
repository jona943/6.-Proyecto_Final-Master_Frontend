import { IconUserPlus } from './LandingIcons'

function ScarcityCtaSection({ onNavigate }) {
  return (
    <section className="scarcity-cta-section">
      <div className="scarcity-container">
        {/* Bloque de Escasez Matemática */}
        <div className="scarcity-card">
          <div className="scarcity-meta-tag">
            <span className="scarcity-dot" />
            <span>NAMESPACE FINITO · 3 A 10 CARACTERES</span>
          </div>

          <h3 className="scarcity-title">
            Cuando un alias es reclamado, el registro se sella para siempre.
          </h3>

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
        </div>

        {/* Tarjeta de Acción Final (CTA) */}
        <div className="final-cta-card">
          <div className="final-cta-glow" aria-hidden="true" />
          <div className="final-cta-content">
            <h2 className="final-cta-title">
              El silencio es una decisión.
            </h2>
            <p className="final-cta-desc">
              Crea tu usuario único en segundos y entra al santuario de comunicación directa y privada.
            </p>

            <div className="final-cta-actions">
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
      </div>
    </section>
  )
}

export default ScarcityCtaSection
