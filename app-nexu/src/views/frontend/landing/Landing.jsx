import { useState, useEffect } from 'react'
import './Landing.css'
import { validateAlias } from '../../../utils/validators'
import { session, STORAGE_KEYS } from '../../../services/storageService'
import { api } from '../../../services/api'

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

  // Estado interactivo de validación (conectado al Backend)
  const [validation, setValidation] = useState({
    state: 'idle',
    msg: 'Introduce de 3 a 10 caracteres',
    value: ''
  })

  // Consulta reactiva al Backend con debounce (300ms)
  useEffect(() => {
    // 1. Verificación local inmediata de formato y caracteres
    const localVal = validateAlias(claimAlias)

    if (localVal.state !== 'valid') {
      setValidation(localVal)
      return
    }

    // 2. Si el formato es válido, indicamos estado de carga
    setValidation({
      state: 'warning',
      msg: 'Consultando disponibilidad en el protocolo...',
      value: localVal.value
    })

    // 3. Temporizador debounce para no saturar al servidor mientras el usuario escribe
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkAlias(localVal.value)

        if (res.success && res.data) {
          if (res.data.available) {
            setValidation({
              state: 'valid',
              msg: `@${localVal.value} está libre para reclamar`,
              value: localVal.value
            })
          } else {
            setValidation({
              state: 'error',
              msg: res.data.message || `@${localVal.value} ya está en uso`,
              value: localVal.value
            })
          }
        } else {
          setValidation({
            state: 'error',
            msg: res.error || 'No se pudo conectar con el servidor',
            value: localVal.value
          })
        }
      } catch (_err) {
        console.error('Error de red al consultar alias:', _err)
        setValidation({
          state: 'error',
          msg: 'Error al verificar alias en el servidor',
          value: localVal.value
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [claimAlias])

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
