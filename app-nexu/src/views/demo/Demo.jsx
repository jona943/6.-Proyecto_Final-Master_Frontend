import { useState, useEffect } from 'react'
import './style.css'
import Landing from '../frontend/landing/Landing.jsx'
import Login from '../frontend/login-auth/Login.jsx'
import ChatHome from '../frontend/chat/ChatHome.jsx'

function Demo() {
  const [activeView, setActiveView] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('view') || null
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
          {/* MÓDULO 1: JONATHAN */}
          <article className="module-card featured">
            <div className="card-top">
              <span className="module-badge">Módulo 01 · Presentación</span>
              <span className="branch-tag">feature/jonathan</span>
            </div>
            <h3>Landing Page</h3>
            <p className="card-desc">
              Página de aterrizaje, Hero Section con llamado a la acción (CTA), demostración interactiva de chat, características clave y pie de página.
            </p>
            <div className="card-meta">
              <span className="meta-author">Responsable: <strong>Jonathan</strong></span>
              <span className="meta-status ready">● Maqueta Lista</span>
            </div>
            <div className="card-actions">
              <button
                className="btn-launch-tab"
                onClick={() => openStandaloneView('landing')}
              >
                Abrir en nueva pestaña ↗
              </button>
            </div>
          </article>

          {/* MÓDULO 2: ROSA */}
          <article className="module-card">
            <div className="card-top">
              <span className="module-badge">Módulo 02 · Autenticación</span>
              <span className="branch-tag">feature/rosy</span>
            </div>
            <h3>Login & Autenticación</h3>
            <p className="card-desc">
              Pantallas de inicio de sesión, registro de nuevos usuarios, recuperación de contraseña y validación visual de formularios.
            </p>
            <div className="card-meta">
              <span className="meta-author">Responsable: <strong>Rosy</strong></span>
              <span className="meta-status in-progress">● En Desarrollo</span>
            </div>
            <div className="card-actions">
              <button
                className="btn-launch-tab"
                onClick={() => openStandaloneView('login')}
              >
                Abrir en nueva pestaña ↗
              </button>
            </div>
          </article>

          {/* MÓDULO 3: EMARAMA */}
          <article className="module-card">
            <div className="card-top">
              <span className="module-badge">Módulo 03 · Mensajería</span>
              <span className="branch-tag">feature/EmaRama</span>
            </div>
            <h3>Chat & Comunicación</h3>
            <p className="card-desc">
              Sidebar de contactos, canales activos, burbujas de mensajes enviadas/recibidas, barra de input y eventos en tiempo real.
            </p>
            <div className="card-meta">
              <span className="meta-author">Responsable: <strong>EmaRama</strong></span>
              <span className="meta-status in-progress">● En Desarrollo</span>
            </div>
            <div className="card-actions">
              <button
                className="btn-launch-tab"
                onClick={() => openStandaloneView('chat')}
              >
                Abrir en nueva pestaña ↗
              </button>
            </div>
          </article>
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
