function LandingFooter({ onScrollToManifiesto }) {
  return (
    <footer className="footer-clean">
      <div className="footer-content">
        <div className="footer-brand-row">
          <div className="footer-logo">
            <div className="logo-tiny">N</div>
            <span>Nexu</span>
          </div>
          <span className="footer-pill">Protocol v1.0</span>
        </div>

        <div className="footer-links">
          <button
            type="button"
            className="footer-link-btn"
            onClick={onScrollToManifiesto}
          >
            El Manifiesto
          </button>
          <span className="footer-link-sep">·</span>
          <a href="#privacidad" className="footer-link">Privacidad</a>
          <span className="footer-link-sep">·</span>
          <a href="#terminos" className="footer-link">Términos de Servicio</a>
        </div>

        <p className="footer-copy">
          © 2026 Nexu. Protocolo de mensajería directa punto a punto. Cero rastreo, cero publicidad.
        </p>
      </div>
    </footer>
  )
}

export default LandingFooter
