import { useState } from 'react'
import './Landing.css'
import { validateAlias } from '../../../utils/validators'
import { session, STORAGE_KEYS } from '../../../services/storageService'

import LandingNavbar from './components/LandingNavbar'
import HeroSection from './components/HeroSection'
import ManifestoCarouselSection, { MANIFESTO_LAWS } from './components/ManifestoCarouselSection'
import ScarcityCtaSection from './components/ScarcityCtaSection'

// ============================================================================
// COMPONENTE PRINCIPAL: LANDING PAGE (COORDINADOR + STORAGE + UTILS)
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

  // Validación pura
  const validation = validateAlias(claimAlias)

  const handleClaimSubmit = (e) => {
    e.preventDefault()
    if (validation.state === 'valid') {
      session.set(STORAGE_KEYS.PREFILLED_ALIAS, validation.value)
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

      {/* 1. Carta 1: Hero Cinematográfico (100dvh) */}
      <HeroSection
        claimAlias={claimAlias}
        onClaimAliasChange={setClaimAlias}
        validation={validation}
        onClaimSubmit={handleClaimSubmit}
        onScrollToManifiesto={scrollToManifiesto}
      />

      {/* 2. Carta 2: El Manifiesto (100dvh) */}
      <ManifestoCarouselSection
        activeLawIndex={activeLawIndex}
        onSelectLawIndex={setActiveLawIndex}
        onNextLaw={nextLaw}
        onPrevLaw={prevLaw}
      />

      {/* 3. Carta 3: Escasez Matemática e Invitación Final Integrada (100dvh) */}
      <ScarcityCtaSection
        onNavigate={onNavigate}
        onScrollToManifiesto={scrollToManifiesto}
      />
    </div>
  )
}

export default Landing
