import { useState, useEffect } from 'react'
import './Landing.css'
import heroMonolithImg from './assets/hero-monolith.jpg'

// ============================================================================
// ICONOS SVG VECTORIALES NATIVOS (Minimalistas, Nítidos & Zero-Bloat)
// ============================================================================
const IconUserPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="20" y1="8" x2="20" y2="14"></line>
    <line x1="23" y1="11" x2="17" y2="11"></line>
  </svg>
)

const IconUser = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
)

const IconZap = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
)

const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const IconSparkles = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"></path>
  </svg>
)

const IconChevronLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
)

const IconChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
)

const IconChevronDown = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
)

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

// ============================================================================
// VENTAJAS DEL MVP SIMPLIFICADO
// ============================================================================
const ADVANTAGES = [
  {
    id: 'alias',
    tag: '01 · Registro Rápido',
    title: 'Identidad por Alias',
    desc: 'Regístrate en segundos eligiendo tu nombre de usuario único. Sin números de teléfono ni datos obligatorios.',
    icon: <IconUser />
  },
  {
    id: 'direct-chat',
    tag: '02 · Tiempo Real',
    title: 'Mensajería Directa 1 a 1',
    desc: 'Conexión instantánea al milisegundo para chatear directamente con otra persona sin intermediarios ni retrasos.',
    icon: <IconZap />
  },
  {
    id: 'auth',
    tag: '03 · Seguridad',
    title: 'Acceso Rápido y Seguro',
    desc: 'Inicia sesión con tu alias y contraseña para volver a tus conversaciones con total privacidad y protección.',
    icon: <IconLock />
  },
  {
    id: 'design',
    tag: '04 · Experiencia',
    title: 'Diseño Oscuro Minimalista',
    desc: 'Interfaz nocturna pulida sin distracciones, anuncios ni algoritmos. Enfocada 100% en la conversación.',
    icon: <IconSparkles />
  }
]

// ============================================================================
// COMPONENTE PRINCIPAL LANDING
// ============================================================================
function Landing({ onNavigate }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [claimAlias, setClaimAlias] = useState('')

  // Auto-avance del carrusel cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ADVANTAGES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % ADVANTAGES.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + ADVANTAGES.length) % ADVANTAGES.length)
  }

  const scrollToManifiesto = () => {
    const section = document.getElementById('el-manifiesto')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Validación interactiva en tiempo real (3 a 10 caracteres alfanuméricos)
  const getValidationState = () => {
    const trimmed = claimAlias.trim().replace(/^@/, '')
    if (!trimmed) {
      return {
        state: 'idle',
        msg: 'Introduce de 3 a 10 caracteres alfanuméricos',
        value: ''
      }
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      return {
        state: 'error',
        msg: 'Solo letras, números y guión bajo (_)',
        value: trimmed
      }
    }
    if (trimmed.length < 3) {
      return {
        state: 'warning',
        msg: `${trimmed.length}/3 caracteres mínimos`,
        value: trimmed
      }
    }
    if (trimmed.length > 10) {
      return {
        state: 'error',
        msg: 'Máximo 10 caracteres permitidos',
        value: trimmed
      }
    }
    return {
      state: 'valid',
      msg: `@${trimmed.toLowerCase()} está disponible para reclamar`,
      value: trimmed.toLowerCase()
    }
  }

  const validation = getValidationState()

  const handleClaimSubmit = (e) => {
    e.preventDefault()
    if (validation.state === 'valid') {
      try {
        sessionStorage.setItem('nexu_prefilled_alias', validation.value)
      } catch (err) {
        console.warn('Storage not available', err)
      }
      onNavigate && onNavigate('register')
    }
  }

  return (
    <div className="landing-clean">
      {/* 0. NAVBAR SUPERIOR FLOTANTE DE CRISTAL */}
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
              onClick={scrollToManifiesto}
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

      {/* 1. HERO CINEMATOGRÁFICO: EL PORTAL DE ENTRADA */}
      <section className="hero-cinematic-section">
        <div className="hero-ambient-glow" aria-hidden="true" />

        <div className="hero-content-wrapper">
          {/* Badge superior de protocolo */}
          <div className="hero-pill-badge">
            <IconShield />
            <span>PROTOCOLO DIRECTO · SIN NÚMEROS DE TELÉFONO</span>
          </div>

          {/* Titular Principal */}
          <h1 className="hero-cinematic-title">
            El internet se volvió demasiado ruidoso.<br />
            <span className="hero-glow-highlight">Creamos un santuario.</span>
          </h1>

          {/* Subtítulo Narrativo */}
          <p className="hero-cinematic-desc">
            Sin números de teléfono, sin directorios públicos que te expongan y sin algoritmos de retención.
            Tu identidad soberana por alias, directa, privada e instantánea.
          </p>

          {/* Widget de Reclamar Alias en Vivo */}
          <div className="hero-claim-box">
            <form className="hero-claim-form" onSubmit={handleClaimSubmit}>
              <div className="claim-input-group">
                <span className="claim-prefix">@</span>
                <input
                  type="text"
                  className="claim-input"
                  placeholder="tu_alias"
                  value={claimAlias}
                  onChange={(e) => setClaimAlias(e.target.value)}
                  maxLength={12}
                  autoComplete="off"
                  spellCheck="false"
                  aria-label="Escribe tu alias para verificar disponibilidad"
                />
              </div>

              <button
                type="submit"
                className={`btn-claim-submit ${validation.state === 'valid' ? 'is-valid' : ''}`}
                disabled={validation.state !== 'valid'}
              >
                <span>Reclamar Identidad</span>
                <IconArrowRight />
              </button>
            </form>

            {/* Estado interactivo de validación en tiempo real */}
            <div className={`claim-status-bar status-${validation.state}`}>
              <span className="status-indicator-dot" />
              <span className="status-text">{validation.msg}</span>
            </div>
          </div>

          {/* Acceso Rápido Demo */}
          <div className="hero-demo-access">
            <span className="demo-access-label">Cuentas demo oficiales:</span>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => onNavigate && onNavigate('login')}
            >
              @adminUser
            </button>
            <span className="demo-sep">·</span>
            <button
              type="button"
              className="demo-pill-btn"
              onClick={() => onNavigate && onNavigate('login')}
            >
              @rosi_master
            </button>
          </div>

          {/* Showcase Visual: Monolito de Obsidiana */}
          <div className="hero-monolith-card">
            <div className="monolith-frame">
              <img
                src={heroMonolithImg}
                alt="Arquitectura de Monolito Nexu"
                className="monolith-image"
                loading="eager"
              />
              <div className="monolith-overlay" />
              <div className="monolith-tag-badge">
                <span className="monolith-dot-live" />
                <span>NEXU CORE · ENCRIPTACIÓN SOBERANA DIRECTA</span>
              </div>
            </div>
          </div>

          {/* Indicador sutil de scroll al Manifiesto */}
          <div className="hero-scroll-wrapper">
            <button
              className="scroll-cue-btn"
              onClick={scrollToManifiesto}
              type="button"
              aria-label="Explorar el Manifiesto de Nexu"
            >
              <span className="scroll-cue-text">El Manifiesto</span>
              <span className="scroll-icon-wrap">
                <IconChevronDown />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. CARRUSEL DE VENTAJAS (EL MANIFIESTO) */}
      <section id="el-manifiesto" className="carousel-section">
        <div className="carousel-container">
          {/* Tarjeta Activa del Carrusel */}
          <div className="carousel-card">
            <div className="card-header-bar">
              <span className="slide-tag">{ADVANTAGES[currentSlide].tag}</span>
              <div className="slide-icon-box">{ADVANTAGES[currentSlide].icon}</div>
            </div>

            <div className="slide-content">
              <h2>{ADVANTAGES[currentSlide].title}</h2>
              <p>{ADVANTAGES[currentSlide].desc}</p>
            </div>

            {/* Controles de Navegación del Carrusel */}
            <div className="carousel-footer">
              <div className="carousel-dots">
                {ADVANTAGES.map((adv, index) => (
                  <button
                    key={adv.id}
                    className={`dot-indicator ${currentSlide === index ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Ir a ventaja ${index + 1}`}
                  />
                ))}
              </div>

              <div className="carousel-nav-btns">
                <button
                  className="nav-arrow"
                  onClick={prevSlide}
                  aria-label="Ventaja anterior"
                >
                  <IconChevronLeft />
                </button>
                <button
                  className="nav-arrow"
                  onClick={nextSlide}
                  aria-label="Siguiente ventaja"
                >
                  <IconChevronRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER MINIMALISTA */}
      <footer className="footer-clean">
        <div className="footer-content">
          <div className="footer-logo">
            <div className="logo-tiny">N</div>
            <span>Nexu v1.0</span>
          </div>

          <div className="footer-links">
            <a href="#seccion-ventajas">Ventajas</a>
            <span>·</span>
            <a href="#privacidad">Privacidad</a>
            <span>·</span>
            <a href="#terminos">Términos</a>
          </div>

          <p className="footer-copy">
            © 2026 Nexu. Mensajería directa construida con React + Vite.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
