import { useState } from 'react'
import './Landing.css'
import heroMonolithImg from './assets/hero-monolith.jpg'
import sovereignIdentityImg from './assets/sovereign-identity.jpg'
import invisibleNetworkImg from './assets/invisible-network.jpg'
import pureSilenceImg from './assets/pure-silence.jpg'

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

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
)

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
// EL MANIFIESTO: LAS 3 LEYES FUNDACIONALES DE NEXU
// ============================================================================
const MANIFESTO_LAWS = [
  {
    id: 'law-01',
    number: '01',
    shortLabel: 'Identidad Soberana',
    tag: 'LEY 01 · IDENTIDAD SOBERANA',
    title: 'Tu privacidad no le pertenece a tu tarjeta SIM',
    contrast: 'WhatsApp te exige tu número telefónico real, exponiendo tu identidad física, país y contactos a cualquiera.',
    solution: 'En Nexu, tu @alias único es tu sola credencial. Cero números de teléfono requeridos, cero metadatos atados a tu chip móvil.',
    badge: '0% Números Telefónicos · Identidad Soberana',
    image: sovereignIdentityImg,
    imageAlt: 'Arte conceptual de Identidad Soberana Nexu'
  },
  {
    id: 'law-02',
    number: '02',
    shortLabel: 'Red Invisible',
    tag: 'LEY 02 · RED INVISIBLE',
    title: 'Sin directorios públicos. Si no te invitan, no existes',
    contrast: 'Telegram y Discord indexan usuarios en directorios abiertos donde cualquiera puede rastrearte o enviarte spam.',
    solution: 'Nexu opera con bandeja ciega. No existe barra de búsqueda global. Nadie sabe que estás en la red a menos que tú le entregues tu @alias directamente.',
    badge: 'Bandeja Ciega · Cero Rastreo Público',
    image: invisibleNetworkImg,
    imageAlt: 'Arte conceptual de Red Invisible Nexu'
  },
  {
    id: 'law-03',
    number: '03',
    shortLabel: 'Silencio Absoluto',
    tag: 'LEY 03 · SILENCIO Y PUNTO A PUNTO',
    title: 'Cero ruido masivo. Solo tú y tu conversación',
    contrast: 'Las grandes plataformas monetizan la distracción: notificaciones basura, bots caóticos y canales masivos sin control.',
    solution: 'Descartamos los algoritmos para devolverle el valor a una conversación real: comunicación pura, instantánea y protegida entre dos personas.',
    badge: '0 Bots · 0 Algoritmos · 100% Mensajería Directa',
    image: pureSilenceImg,
    imageAlt: 'Arte conceptual de Silencio y Comunicación Pura Nexu'
  }
]

// ============================================================================
// COMPONENTE PRINCIPAL LANDING
// ============================================================================
function Landing({ onNavigate }) {
  const [claimAlias, setClaimAlias] = useState('')
  const [activeLawIndex, setActiveLawIndex] = useState(0)

  const nextLaw = () => {
    setActiveLawIndex((prev) => (prev + 1) % MANIFESTO_LAWS.length)
  }

  const prevLaw = () => {
    setActiveLawIndex((prev) => (prev - 1 + MANIFESTO_LAWS.length) % MANIFESTO_LAWS.length)
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

      {/* 2. EL MANIFIESTO: LAS 3 LEYES DE NEXU EN MODO CARRUSEL INTERACTIVO */}
      <section id="el-manifiesto" className="manifesto-section">
        <div className="manifesto-container">
          {/* Cabecera del Manifiesto */}
          <div className="manifesto-header">
            <div className="manifesto-tag-pill">
              <IconLock />
              <span>EL MANIFIESTO DE NEXU</span>
            </div>
            <h2 className="manifesto-main-title">
              Tres leyes inquebrantables.<br />
              <span className="hero-glow-highlight">Creado contra el ruido masivo.</span>
            </h2>
            <p className="manifesto-main-desc">
              No competimos imitando a las grandes plataformas. Ganamos donde ellas fallaron: privacidad de raíz, cero invasión de datos y silencio absoluto.
            </p>
          </div>

          {/* Selector Interactivo de Leyes (Tabs) */}
          <div className="manifesto-tabs-bar">
            {MANIFESTO_LAWS.map((law, index) => (
              <button
                key={law.id}
                type="button"
                className={`manifesto-tab-btn ${activeLawIndex === index ? 'active' : ''}`}
                onClick={() => setActiveLawIndex(index)}
              >
                <span className="tab-number">{law.number}</span>
                <span className="tab-label">{law.shortLabel}</span>
              </button>
            ))}
          </div>

          {/* Tarjeta Activa del Carrusel */}
          <div className="manifesto-carousel-card" key={activeLawIndex}>
            {/* Contenedor Visual de la Imagen */}
            <div className="manifesto-visual-box">
              <div className="manifesto-img-wrapper">
                <img
                  src={MANIFESTO_LAWS[activeLawIndex].image}
                  alt={MANIFESTO_LAWS[activeLawIndex].imageAlt}
                  className="manifesto-img"
                />
                <div className="manifesto-img-overlay" />
                <div className="manifesto-img-badge">
                  <span className="manifesto-badge-dot" />
                  <span>{MANIFESTO_LAWS[activeLawIndex].badge}</span>
                </div>
              </div>
            </div>

            {/* Contenido Editorial de la Ley */}
            <div className="manifesto-text-box">
              <div className="manifesto-law-meta">
                <span className="law-number-box">{MANIFESTO_LAWS[activeLawIndex].number}</span>
                <span className="law-tag-text">{MANIFESTO_LAWS[activeLawIndex].tag}</span>
              </div>

              <h3 className="manifesto-law-title">{MANIFESTO_LAWS[activeLawIndex].title}</h3>

              <div className="manifesto-comparison-box">
                <div className="comp-row comp-contrast">
                  <span className="comp-badge comp-badge-vulnerable">Problema de la industria</span>
                  <p className="comp-text">{MANIFESTO_LAWS[activeLawIndex].contrast}</p>
                </div>
                <div className="comp-row comp-solution">
                  <span className="comp-badge comp-badge-sovereign">El estándar Nexu</span>
                  <p className="comp-text">{MANIFESTO_LAWS[activeLawIndex].solution}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Navegación del Carrusel (Dots y Flechas) */}
          <div className="manifesto-carousel-controls">
            <div className="manifesto-dots">
              {MANIFESTO_LAWS.map((law, index) => (
                <button
                  key={law.id}
                  className={`dot-indicator ${activeLawIndex === index ? 'active' : ''}`}
                  onClick={() => setActiveLawIndex(index)}
                  aria-label={`Ir a Ley ${law.number}`}
                />
              ))}
            </div>

            <div className="manifesto-nav-btns">
              <button
                className="manifesto-nav-arrow"
                onClick={prevLaw}
                aria-label="Ley anterior"
                type="button"
              >
                <IconChevronLeft />
              </button>
              <button
                className="manifesto-nav-arrow"
                onClick={nextLaw}
                aria-label="Siguiente ley"
                type="button"
              >
                <IconChevronRight />
              </button>
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
