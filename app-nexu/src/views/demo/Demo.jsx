import { useState, useEffect } from 'react'
import './style.css'
import Landing from '../frontend/landing/Landing.jsx'
import Login from '../frontend/login-auth/Login.jsx'
import ChatHome from '../frontend/chat/ChatHome.jsx'
import { MODULES_DATA, checkBranchStatus } from './moduleValidator.js'

function Demo() {
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('view') || null
  })

  // Estado con las validaciones de estatus por módulo
  const [modulesStatus, setModulesStatus] = useState(() => {
    const initial = {}
    MODULES_DATA.forEach((mod) => {
      initial[mod.id] = mod.initialStatus
    })
    return initial
  })

  // Sincronizar estado si el usuario usa las flechas atrás/adelante del navegador
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setActiveView(params.get('view') || null)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Validar dinámicamente el estatus de las ramas contra GitHub / main
  useEffect(() => {
    let isMounted = true

    async function validateAllModules() {
      for (const mod of MODULES_DATA) {
        const result = await checkBranchStatus(mod.branch)
        if (isMounted) {
          setModulesStatus((prev) => ({
            ...prev,
            [mod.id]: result
          }))
        }
      }
    }

    validateAllModules()

    return () => {
      isMounted = false
    }
  }, [])

  const openStandaloneView = (viewName) => {
    window.open(`?view=${viewName}`, '_blank', 'noopener,noreferrer')
  }

  const navigateToHub = () => {
    window.history.pushState({}, '', window.location.pathname)
    setActiveView(null)
  }

  // =========================================================================
  // 1. MODO AISLADO (RENDERIZACIÓN PURA DE CADA INTEGRANTE)
  // =========================================================================
  if (activeView === 'landing' || activeView === 'login' || activeView === 'chat') {
    return (
      <div className="standalone-canvas">
        {/* Componente puro sin contenedor restrictivo */}
        {activeView === 'landing' && <Landing />}
        {activeView === 'login' && <Login />}
        {activeView === 'chat' && <ChatHome />}

        {/* Botón flotante no intrusivo para volver al Hub */}
        <button
          className="floating-hub-btn"
          onClick={navigateToHub}
          title="Regresar al panel de control"
        >
          <span className="hub-btn-icon">⚡</span>
          <span>Volver al Hub Demo</span>
        </button>
      </div>
    )
  }

  // =========================================================================
  // 2. PANEL DE CONTROL / HUB PRINCIPAL
  // =========================================================================
  return (
    <div className="hub-container">
      {/* Header del Hub */}
      <header className="hub-header">
        <div className="hub-brand">
          <div className="hub-logo-badge">N</div>
          <div>
            <h1 className="hub-title">Nexu · Developer Hub</h1>
            <p className="hub-subtitle">Panel de orquestación y monitoreo de módulos en desarrollo</p>
          </div>
        </div>
        <div className="hub-status-badge">
          <span className="live-dot"></span>
          <span>Entorno Local Activo</span>
        </div>
      </header>

      {/* Cuadrícula de Módulos */}
      <main className="hub-main">
        <div className="hub-intro">
          <h2>Módulos del Proyecto Frontend</h2>
          <p>
            Haz clic en <strong>Abrir en nueva pestaña</strong> en cualquier módulo para visualizar
            su renderizado puro a pantalla completa con márgenes y bordes reales.
          </p>
        </div>

        <div className="modules-grid">
          {MODULES_DATA.map((mod) => {
            const status = modulesStatus[mod.id] || mod.initialStatus
            return (
              <article key={mod.id} className="module-card">
                <div className="card-top">
                  <span className="module-badge">{mod.badge}</span>
                  <span className="branch-tag">{mod.branch}</span>
                </div>
                <h3>{mod.title}</h3>
                <p className="card-desc">{mod.desc}</p>
                <div className="card-meta">
                  <span className="meta-author">
                    Responsable: <strong>{mod.author}</strong>
                  </span>
                  <span className={`meta-status ${status.type}`}>
                    {status.label}
                  </span>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-launch-tab"
                    onClick={() => openStandaloneView(mod.id)}
                  >
                    Abrir en nueva pestaña ↗
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* Footer del Hub */}
      <footer className="hub-footer">
        <p>Nexu App · DEV.F Master Frontend · Proyecto Colaborativo</p>
      </footer>
    </div>
  )
}

export default Demo
