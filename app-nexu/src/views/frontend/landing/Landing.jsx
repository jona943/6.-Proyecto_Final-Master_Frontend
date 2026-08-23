import { useState } from 'react'
import './Landing.css'
import { validateAlias } from '../../../utils/validators'

import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import ManifestoCarouselSection, { MANIFESTO_LAWS } from './components/ManifestoCarouselSection'
import ScarcityCtaSection from './components/ScarcityCtaSection'
import LandingFooter from './components/LandingFooter'

// ============================================================================
// COMPONENTE PRINCIPAL: LANDING PAGE (COORDINADOR + UTILS)
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

  // Validación pura extraída a src/utils/validators.js
  const validation = validateAlias(claimAlias)

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
      {/* 0. Navbar Superior */}
      <LandingNavbar
        onNavigate={onNavigate}
        onScrollToManifiesto={scrollToManifiesto}
      />

      {/* 1. Hero Cinematográfico */}
      <HeroSection
        claimAlias={claimAlias}
        onClaimAliasChange={setClaimAlias}
        validation={validation}
        onClaimSubmit={handleClaimSubmit}
        onScrollToManifiesto={scrollToManifiesto}
      />

      {/* 2. El Manifiesto: Carrusel Interactivo */}
      <ManifestoCarouselSection
        activeLawIndex={activeLawIndex}
        onSelectLawIndex={setActiveLawIndex}
        onNextLaw={nextLaw}
        onPrevLaw={prevLaw}
      />

      {/* 3. Escasez Matemática y Cierre (CTA Final) */}
      <ScarcityCtaSection onNavigate={onNavigate} />

      {/* 4. Footer Minimalista */}
      <LandingFooter onScrollToManifiesto={scrollToManifiesto} />
    </div>
  )
}

export default Landing
