import { useState } from 'react'
import './Landing.css'

import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import ManifestoCarouselSection, { MANIFESTO_LAWS } from './components/ManifestoCarouselSection'
import ScarcityCtaSection from './components/ScarcityCtaSection'
import LandingFooter from './components/LandingFooter'

// ============================================================================
// COMPONENTE PRINCIPAL: LANDING PAGE (COORDINADOR MODULAR)
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
      {/* 0. Navbar Superior Flotante de Cristal */}
      <LandingNavbar
        onNavigate={onNavigate}
        onScrollToManifiesto={scrollToManifiesto}
      />

      {/* 1. Hero Cinematográfico: Portal de Entrada */}
      <HeroSection
        claimAlias={claimAlias}
        onClaimAliasChange={setClaimAlias}
        validation={validation}
        onClaimSubmit={handleClaimSubmit}
        onScrollToManifiesto={scrollToManifiesto}
      />

      {/* 2. El Manifiesto: Las 3 Leyes en Carrusel Interactivo */}
      <ManifestoCarouselSection
        activeLawIndex={activeLawIndex}
        onSelectLawIndex={setActiveLawIndex}
        onNextLaw={nextLaw}
        onPrevLaw={prevLaw}
      />

      {/* 3. Escasez Matemática y Cierre (CTA Final) */}
      <ScarcityCtaSection onNavigate={onNavigate} />

      {/* 4. Footer Minimalista y Sobrio */}
      <LandingFooter onScrollToManifiesto={scrollToManifiesto} />
    </div>
  )
}

export default Landing
