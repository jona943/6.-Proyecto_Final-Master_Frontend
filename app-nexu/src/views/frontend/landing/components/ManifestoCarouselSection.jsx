import { useState, useEffect } from 'react'
import sovereignIdentityImg from '../assets/sovereign-identity.jpg'
import invisibleNetworkImg from '../assets/invisible-network.jpg'
import pureSilenceImg from '../assets/pure-silence.jpg'
import { IconLock, IconChevronLeft, IconChevronRight } from '../../../../components/icons/Icons'

export const MANIFESTO_LAWS = [
  {
    id: 'law-01',
    number: '01',
    shortLabel: 'Identidad Soberana',
    tag: 'LEY 01 · IDENTIDAD SOBERANA',
    title: 'Tu privacidad no le pertenece a una tarjeta SIM',
    contrast: 'Las grandes aplicaciones atan tu cuenta a tu chip móvil, exponiendo tus contactos y operadora.',
    solution: 'En Nexu, tu @alias único es tu sola credencial. Cero números telefónicos, cero metadatos atados.',
    badge: '0% Números Telefónicos',
    image: sovereignIdentityImg,
    imageAlt: 'Arte conceptual de Identidad Soberana Nexu'
  },
  {
    id: 'law-02',
    number: '02',
    shortLabel: 'Red Invisible',
    tag: 'LEY 02 · RED INVISIBLE',
    title: 'Sin directorios públicos. Si no te invitan, no existes',
    contrast: 'Los directorios abiertos permiten que cualquier extraño te rastree, indexe o envíe spam.',
    solution: 'Bandeja ciega absoluta: nadie sabe que estás en la red a menos que tú le compartas tu @alias.',
    badge: 'Bandeja Ciega · Cero Rastreo',
    image: invisibleNetworkImg,
    imageAlt: 'Arte conceptual de Red Invisible Nexu'
  },
  {
    id: 'law-03',
    number: '03',
    shortLabel: 'Silencio Absoluto',
    tag: 'LEY 03 · SILENCIO ABSOLUTO',
    title: 'Cero algoritmos de retención. Solo tú y tu conversación',
    contrast: 'Notificaciones basura, bots y feeds diseñados para retener tu atención de forma artificial.',
    solution: 'Canales directos persona a persona, con cifrado estricto y total ausencia de algoritmos.',
    badge: '100% Mensajería Directa',
    image: pureSilenceImg,
    imageAlt: 'Arte conceptual de Silencio y Comunicación Pura Nexu'
  }
]

function ManifestoCarouselSection({
  activeLawIndex,
  onSelectLawIndex,
  onNextLaw,
  onPrevLaw
}) {
  const currentLaw = MANIFESTO_LAWS[activeLawIndex]
  const [touchStartX, setTouchStartX] = useState(null)
  const [touchEndX, setTouchEndX] = useState(null)

  // Detección de gesto táctil (Swipe)
  const handleTouchStart = (e) => {
    setTouchEndX(null)
    setTouchStartX(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return
    const distance = touchStartX - touchEndX
    const minSwipeDistance = 45

    if (distance > minSwipeDistance) {
      onNextLaw() // Deslizar hacia la izquierda -> siguiente
    } else if (distance < -minSwipeDistance) {
      onPrevLaw() // Deslizar hacia la derecha -> anterior
    }
  }

  // Auto-centrado magnético al 70% de avance hacia Escasez
  useEffect(() => {
    let lastScrollY = window.scrollY
    let isSnapping = false
    let snapTimeout = null

    const handleScroll = () => {
      const scrollY = window.scrollY
      const isScrollingDown = scrollY > lastScrollY
      lastScrollY = scrollY

      const manifestoEl = document.getElementById('el-manifiesto')
      const scarcityEl = document.getElementById('escasez')
      if (!manifestoEl || !scarcityEl) return

      const navbarHeight = window.innerWidth <= 768 ? 58 : 65
      const manifestoTop = Math.max(manifestoEl.offsetTop - navbarHeight, 0)
      const scarcityTop = Math.max(scarcityEl.offsetTop - navbarHeight, 0)

      if (scrollY >= manifestoTop) {
        const vh = window.innerHeight || 800
        const fadeThreshold = Math.min(vh * 0.45, 380)
        const progress = Math.min(Math.max((scrollY - manifestoTop) / fadeThreshold, 0), 1)

        // Si se avanza más del 70% hacia abajo, centra suavemente la Diapositiva 3 (Escasez)
        if (isScrollingDown && progress >= 0.7 && scrollY < scarcityTop - 25 && !isSnapping) {
          isSnapping = true
          window.scrollTo({ top: scarcityTop, behavior: 'smooth' })

          clearTimeout(snapTimeout)
          snapTimeout = setTimeout(() => {
            isSnapping = false
          }, 750)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(snapTimeout)
    }
  }, [])

  return (
    <section id="el-manifiesto" className="manifesto-section">
      {/* Horizonte de luz de transición desde el Hero */}
      <div className="manifesto-horizon-light" aria-hidden="true" />
      <div className="manifesto-ambient-glow" aria-hidden="true" />

      <div className="manifesto-container">
        {/* Cabecera Compacta y Tabs Integrados */}
        <div className="manifesto-top-bar">
          <div className="manifesto-badge-group">
            <div className="manifesto-tag-pill">
              <IconLock />
              <span>EL MANIFIESTO</span>
            </div>
            <h2 className="manifesto-compact-title">Tres Leyes Inquebrantables</h2>
          </div>

          {/* Selector Interactivo de Leyes (Tabs) */}
          <div className="manifesto-tabs-bar">
            {MANIFESTO_LAWS.map((law, index) => (
              <button
                key={law.id}
                type="button"
                className={`manifesto-tab-btn ${activeLawIndex === index ? 'active' : ''}`}
                onClick={() => onSelectLawIndex(index)}
              >
                <span className="tab-number">{law.number}</span>
                <span className="tab-label">{law.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta Activa del Carrusel con Soporte Táctil (Swipe) */}
        <div
          className="manifesto-carousel-card"
          key={activeLawIndex}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Contenedor Visual de la Imagen (4:3 Compacto) */}
          <div className="manifesto-visual-box">
            <div className="manifesto-img-wrapper">
              <img
                src={currentLaw.image}
                alt={currentLaw.imageAlt}
                className="manifesto-img"
              />
              <div className="manifesto-img-overlay" />
              <div className="manifesto-img-badge">
                <span className="manifesto-badge-dot" />
                <span>{currentLaw.badge}</span>
              </div>
            </div>
          </div>

          {/* Contenido Editorial de la Ley */}
          <div className="manifesto-text-box">
            <div className="manifesto-law-meta">
              <span className="law-number-box">{currentLaw.number}</span>
              <span className="law-tag-text">{currentLaw.tag}</span>
            </div>

            <h3 className="manifesto-law-title">{currentLaw.title}</h3>

            <div className="manifesto-comparison-box">
              <div className="comp-row comp-contrast">
                <span className="comp-badge comp-badge-vulnerable">Problema de la industria</span>
                <p className="comp-text">{currentLaw.contrast}</p>
              </div>
              <div className="comp-row comp-solution">
                <span className="comp-badge comp-badge-sovereign">El estándar Nexu</span>
                <p className="comp-text">{currentLaw.solution}</p>
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
                onClick={() => onSelectLawIndex(index)}
                aria-label={`Ir a Ley ${law.number}`}
              />
            ))}
          </div>

          <div className="manifesto-nav-btns">
            <button
              className="manifesto-nav-arrow"
              onClick={onPrevLaw}
              aria-label="Ley anterior"
              type="button"
            >
              <IconChevronLeft />
            </button>
            <button
              className="manifesto-nav-arrow"
              onClick={onNextLaw}
              aria-label="Siguiente ley"
              type="button"
            >
              <IconChevronRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ManifestoCarouselSection
