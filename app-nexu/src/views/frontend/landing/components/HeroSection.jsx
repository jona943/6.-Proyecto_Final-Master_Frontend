import heroMonolithImg from '../assets/hero-monolith.jpg'
import { IconShield, IconArrowRight, IconChevronDown } from '../../../../components/icons/Icons'

function HeroSection({
  claimAlias,
  onClaimAliasChange,
  validation,
  onClaimSubmit,
  onScrollToManifiesto
}) {
  return (
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
          <form className="hero-claim-form" onSubmit={onClaimSubmit}>
            <div className="claim-input-group">
              <span className="claim-prefix">@</span>
              <input
                type="text"
                className="claim-input"
                placeholder="tu_alias"
                value={claimAlias}
                onChange={(e) => onClaimAliasChange(e.target.value)}
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
            onClick={onScrollToManifiesto}
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
  )
}

export default HeroSection
