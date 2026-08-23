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

function ManifestoCarouselSection({
  activeLawIndex,
  onSelectLawIndex,
  onNextLaw,
  onPrevLaw
}) {
  const currentLaw = MANIFESTO_LAWS[activeLawIndex]

  return (
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
              onClick={() => onSelectLawIndex(index)}
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
