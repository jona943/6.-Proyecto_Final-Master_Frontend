import { IconUserPlus } from '../../../../components/icons/Icons'

function LandingNavbar({ onNavigate, onScrollToManifiesto }) {
  return (
    <header className="landing-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo-box">N</div>
          <span className="brand-title">Nexu</span>
          <span className="brand-badge-pill">v1.0</span>
        </div>

        <nav className="navbar-actions">
          <button
            className="nav-link-btn"
            type="button"
            onClick={onScrollToManifiesto}
          >
            El Manifiesto
          </button>
          <button
            className="nav-btn-secondary"
            type="button"
            onClick={() => onNavigate && onNavigate('login')}
          >
            Iniciar sesión
          </button>
          <button
            className="nav-btn-primary"
            type="button"
            onClick={() => onNavigate && onNavigate('register')}
          >
            <IconUserPlus />
            <span>Reclamar Alias</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

export default LandingNavbar
