import { useState, useEffect } from 'react'
import './Landing.css'

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
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconZap = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
)

const IconLock = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const IconSparkles = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
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
function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0)

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

  const scrollToVentajas = () => {
    const section = document.getElementById('seccion-ventajas')
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="landing-clean">
      {/* 1. HERO SECTION (FIRST FOLD LIMPIO & ESPACIOSO) */}
      <section className="hero-fold">
        <div className="hero-brand-mark">
          <div className="hero-logo-box">N</div>
          <span className="hero-brand-name">Nexu</span>
        </div>

        <h1 className="hero-clean-title">
          Mensajería directa, <br />
          <span className="hero-clean-highlight">libre y privada.</span>
        </h1>

        <p className="hero-clean-desc">
          Crea tu usuario, inicia sesión y chatea en tiempo real al instante. Sin números de teléfono ni complicaciones.
        </p>

        <div className="hero-actions">
          <button className="btn-action-primary" type="button">
            <IconUserPlus />
            <span>Crear usuario</span>
          </button>
          <button className="btn-action-secondary" type="button">
            <span>Iniciar sesión</span>
          </button>
        </div>

        {/* Indicador Intuitivo de Scroll */}
        <div className="scroll-cue" onClick={scrollToVentajas} title="Desliza para explorar">
          <span className="scroll-pill">
            <IconChevronDown />
          </span>
        </div>
      </section>

      {/* 2. CARRUSEL DE VENTAJAS DEL MVP */}
      <section id="seccion-ventajas" className="carousel-section">
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
