import { useNavigate } from 'react-router-dom'
import { IconUserPlus } from '../../../../components/icons/Icons'
import './LandingNavbar.css'

function LandingNavbar({ onScrollToManifiesto }) {
  const navigate = useNavigate()
  return (
    <header className="landing-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo-box">N</div>
          <span className="brand-title">NexuHub</span>
          <span className="brand-badge-pill">nexuhub.me</span>
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
            onClick={() => navigate('/login')}
          >
            Iniciar sesión
          </button>
          <button
            className="nav-btn-primary"
            type="button"
            onClick={() => navigate('/register')}
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
