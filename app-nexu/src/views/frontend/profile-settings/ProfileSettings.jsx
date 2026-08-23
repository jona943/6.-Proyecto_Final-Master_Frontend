import { useState, useEffect } from 'react'
import './ProfileSettings.css'
import { getUserSessions } from '../chat/mockData.js'

// ============================================================================
// ICONOS SVG VECTORIALES NATIVOS (Nítidos, Ligeros & Minimalistas)
// ============================================================================
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconSliders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"></line>
    <line x1="4" y1="10" x2="4" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12" y2="3"></line>
    <line x1="20" y1="21" x2="20" y2="16"></line>
    <line x1="20" y1="12" x2="20" y2="3"></line>
    <line x1="1" y1="14" x2="7" y2="14"></line>
    <line x1="9" y1="8" x2="15" y2="8"></line>
    <line x1="17" y1="16" x2="23" y2="16"></line>
  </svg>
)

const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const IconUserX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="8.5" cy="7" r="4"></circle>
    <line x1="18" y1="8" x2="23" y2="13"></line>
    <line x1="23" y1="8" x2="18" y2="13"></line>
  </svg>
)

const IconIdCard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
)

const IconCamera = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
)

const IconVolume2 = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
)

const IconLaptop = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="2" y1="20" x2="22" y2="20"></line>
  </svg>
)

const IconSmartphone = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
    <line x1="12" y1="18" x2="12.01" y2="18"></line>
  </svg>
)

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const IconLogOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

// ============================================================================
// AVATARES PREESTABLECIDOS PARA SELECCIÓN
// ============================================================================
const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80'
]

// ============================================================================
// COMPONENTE PRINCIPAL: ProfileSettings
// ============================================================================
function ProfileSettings({ onBackToChat, onLogout, currentUserHandle }) {
  // Pestaña Activa
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'settings' | 'privacy' | 'blocked'

  // Perfil del Usuario basado en la sesión activa
  const [profile, setProfile] = useState(() => {
    const handle = currentUserHandle ? currentUserHandle.replace(/^@/, '') : 'adminUser'
    const isRosi = handle.toLowerCase() === 'rosi_master'
    const isAdmin = handle.toLowerCase() === 'adminuser'
    return {
      displayName: isRosi ? 'Rosy Master' : isAdmin ? 'Admin User' : handle,
      username: handle,
      email: `${handle.toLowerCase()}@nexu.app`,
      bio: 'Usuario activo de Nexu · Mensajería directa, libre y privada.',
      avatar: AVATAR_OPTIONS[isAdmin ? 1 : 0],
      presence: 'online' // 'online' | 'away' | 'dnd' | 'offline'
    }
  })

  // Preferencias Generales y Tema
  const [themeMode, setThemeMode] = useState('dark') // 'dark' | 'light'
  const [notifications, setNotifications] = useState({
    desktop: true,
    soundIncoming: true,
    soundOutgoing: true,
    messagePreview: true,
    onlineAlerts: false
  })

  // Privacidad y Seguridad
  const [privacy, setPrivacy] = useState({
    readReceipts: true, // doble check azul
    lastSeen: true,
    typingIndicator: true,
    allowStrangers: false
  })

  // Dispositivos y Sesiones Activas Registradas
  const [sessions, setSessions] = useState(() => getUserSessions(currentUserHandle))

  const handleCloseSession = (sessionId) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId)
      try {
        const clean = (currentUserHandle || 'adminUser').replace(/^@/, '').toLowerCase()
        localStorage.setItem(`nexu_sessions_${clean}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    showToast('Sesión cerrada en el dispositivo secundario')
  }

  // Lista de Contactos Bloqueados Mock
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: 'usr-b1',
      name: 'Spam Bot Publicidad',
      handle: '@crypto_promo_99',
      avatar: AVATAR_OPTIONS[7],
      date: '14 Feb 2026'
    },
    {
      id: 'usr-b2',
      name: 'Usuario Sospechoso',
      handle: '@phantom_guest',
      avatar: AVATAR_OPTIONS[4],
      date: '18 Feb 2026'
    }
  ])

  // Modales y Drawers
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [isContactDrawerOpen, setIsContactDrawerOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Mostrar notificación Toast temporal
  const showToast = (msg) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Reproductor de sonido sintético ligero (Web Audio API)
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(587.33, ctx.currentTime) // Nota D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1) // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
        showToast('🔔 Sonido de notificación reproducido')
      }
    } catch {
      showToast('🔔 Tono de notificación simulado')
    }
  }

  // Manejar cambios en campos de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveProfile = (e) => {
    e.preventDefault()
    showToast('✨ Perfil y estado actualizados correctamente')
  }

  // Desbloquear usuario
  const handleUnblockUser = (id, name) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id))
    showToast(`✅ ${name} ha sido desbloqueado`)
  }

  // Selección de Avatar
  const selectAvatar = (url) => {
    setProfile((prev) => ({ ...prev, avatar: url }))
    setIsAvatarModalOpen(false)
    showToast('📸 Foto de perfil actualizada')
  }

  return (
    <div className={`profile-settings-wrapper ${themeMode === 'light' ? 'theme-light' : ''}`}>
      <div className="profile-settings-container">
        
        {/* ================================================================= */}
        {/* 1. HEADER CARD PRINCIPAL                                          */}
        {/* ================================================================= */}
        <header className="profile-header-card">
          <div className="header-meta-left">
            <span className="module-badge-tag">
              <span>●</span> Módulo 04 · Perfil & Preferencias
            </span>
            <h1 className="profile-title">Perfil y Configuración</h1>
            <p className="profile-subtitle">
              Administra tu presencia, identidad, privacidad y apariencia visual de Nexu.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="header-user-quick">
              <img src={profile.avatar} alt="Avatar" className="quick-avatar" />
              <div className="quick-info">
                <span className="quick-name">{profile.displayName}</span>
                <span className="quick-status-label">
                  <span className={`status-dot ${profile.presence}`}></span>
                  {profile.presence === 'online' && 'En línea'}
                  {profile.presence === 'away' && 'Ausente'}
                  {profile.presence === 'dnd' && 'No molestar'}
                  {profile.presence === 'offline' && 'Desconectado'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              {onBackToChat && (
                <button
                  className="btn-secondary"
                  onClick={onBackToChat}
                  type="button"
                  title="Regresar a los chats"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <IconArrowLeft />
                  <span>Volver al chat</span>
                </button>
              )}
              {onLogout && (
                <button
                  className="btn-danger-outline"
                  onClick={onLogout}
                  type="button"
                  title="Cerrar sesión y volver al inicio"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1rem', fontSize: '0.85rem' }}
                >
                  <IconLogOut />
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* 2. BARRA DE PESTAÑAS (TABS)                                       */}
        {/* ================================================================= */}
        <nav className="profile-nav-tabs">
          <button
            className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            type="button"
          >
            <IconUser />
            <span>Mi Perfil</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            type="button"
          >
            <IconSliders />
            <span>Ajustes & Tema</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
            type="button"
          >
            <IconShield />
            <span>Privacidad & Seguridad</span>
          </button>

          <button
            className={`nav-tab-btn ${activeTab === 'blocked' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocked')}
            type="button"
          >
            <IconUserX />
            <span>Bloqueados ({blockedUsers.length})</span>
          </button>

          <button
            className="nav-tab-btn"
            onClick={() => setIsContactDrawerOpen(true)}
            type="button"
            title="Ver Drawer de contacto de prueba"
          >
            <IconIdCard />
            <span>Ficha de Contacto ↗</span>
          </button>
        </nav>

        {/* ================================================================= */}
        {/* 3. PESTAÑA 1: MI PERFIL                                           */}
        {/* ================================================================= */}
        {activeTab === 'profile' && (
          <div className="tab-content-area">
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Identidad de Usuario</h3>
                  <p>Configura tu foto de perfil, nombre visible y biografía pública.</p>
                </div>
              </div>

              {/* Fila Hero del Perfil con Avatar y Datos Rápidos */}
              <div className="profile-hero-row">
                <div className="avatar-edit-container">
                  <img src={profile.avatar} alt="Foto de perfil" className="main-avatar-img" />
                  <button
                    className="avatar-change-badge"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Cambiar foto de perfil"
                    type="button"
                  >
                    <IconCamera />
                  </button>
                </div>

                <div className="profile-hero-details">
                  <span className="hero-display-name">{profile.displayName}</span>
                  <span className="hero-username-handle">@{profile.username}</span>
                  <span className="hero-join-date">Miembro de Nexu desde Febrero de 2026</span>
                </div>
              </div>

              {/* Selector de Estado de Presencia */}
              <div className="form-group">
                <label className="form-label">
                  <span>Estado de Presencia</span>
                  <span className="form-label-hint">Visible para tus contactos</span>
                </label>

                <div className="presence-selector-grid">
                  <button
                    type="button"
                    className={`presence-option-btn ${profile.presence === 'online' ? 'active' : ''}`}
                    onClick={() => setProfile({ ...profile, presence: 'online' })}
                  >
                    <span className="status-dot online"></span>
                    <div className="presence-text">
                      <span className="presence-label">En línea</span>
                      <span className="presence-desc">Recibe alertas y mensajes al instante</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`presence-option-btn ${profile.presence === 'away' ? 'active' : ''}`}
                    onClick={() => setProfile({ ...profile, presence: 'away' })}
                  >
                    <span className="status-dot away"></span>
                    <div className="presence-text">
                      <span className="presence-label">Ausente</span>
                      <span className="presence-desc">Temporalmente inactivo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`presence-option-btn ${profile.presence === 'dnd' ? 'active' : ''}`}
                    onClick={() => setProfile({ ...profile, presence: 'dnd' })}
                  >
                    <span className="status-dot dnd"></span>
                    <div className="presence-text">
                      <span className="presence-label">No molestar</span>
                      <span className="presence-desc">Sin notificaciones de sonido</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`presence-option-btn ${profile.presence === 'offline' ? 'active' : ''}`}
                    onClick={() => setProfile({ ...profile, presence: 'offline' })}
                  >
                    <span className="status-dot offline"></span>
                    <div className="presence-text">
                      <span className="presence-label">Desconectado</span>
                      <span className="presence-desc">Ocultar estado activo</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Formulario de Datos */}
              <form onSubmit={handleSaveProfile} className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="displayName">Nombre Completo</label>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    className="form-input"
                    value={profile.displayName}
                    onChange={handleProfileChange}
                    placeholder="Ej. Víctor Gil"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="username">Alias Único (Handle)</label>
                  <div className="form-input-container">
                    <span className="form-input-prefix">@</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-input has-prefix"
                      value={profile.username}
                      onChange={handleProfileChange}
                      placeholder="usuario"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="email">Correo Electrónico Vinculado</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="bio">
                    <span>Biografía / Estado Personal</span>
                    <span className="form-label-hint">{profile.bio.length}/160 caracteres</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    maxLength={160}
                    className="form-textarea"
                    value={profile.bio}
                    onChange={handleProfileChange}
                    placeholder="Escribe algo sobre ti..."
                  />
                </div>

                <div className="form-actions-bar" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn-primary">
                    <IconCheck />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* 4. PESTAÑA 2: AJUSTES & PREFERENCIAS (TEMA, NOTIFICACIONES)       */}
        {/* ================================================================= */}
        {activeTab === 'settings' && (
          <div className="tab-content-area">
            {/* Selector de Tema */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Apariencia & Tema Visual</h3>
                  <p>Personaliza los contrastes y estilo general de la plataforma.</p>
                </div>
              </div>

              <div className="theme-selector-grid">
                <div
                  className={`theme-card-option ${themeMode === 'dark' ? 'active' : ''}`}
                  onClick={() => {
                    setThemeMode('dark')
                    showToast('🌙 Modo Oscuro (Obsidian Carbon) activado')
                  }}
                >
                  <div className="theme-preview-box dark">
                    <div className="preview-side"></div>
                    <div className="preview-body">
                      <div className="preview-line accent"></div>
                      <div className="preview-line"></div>
                      <div className="preview-line" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <span className="theme-label-name">Modo Oscuro (Predeterminado)</span>
                </div>

                <div
                  className={`theme-card-option ${themeMode === 'light' ? 'active' : ''}`}
                  onClick={() => {
                    setThemeMode('light')
                    showToast('☀️ Modo Claro activado')
                  }}
                >
                  <div className="theme-preview-box light">
                    <div className="preview-side"></div>
                    <div className="preview-body">
                      <div className="preview-line accent"></div>
                      <div className="preview-line"></div>
                      <div className="preview-line" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                  <span className="theme-label-name">Modo Claro</span>
                </div>
              </div>
            </section>

            {/* Notificaciones y Sonidos */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Notificaciones & Alertas Sonoras</h3>
                  <p>Configura cómo y cuándo deseas ser notificado al recibir mensajes.</p>
                </div>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={playChimeSound}
                >
                  <IconVolume2 />
                  <span>Probar Sonido</span>
                </button>
              </div>

              <div className="settings-toggle-list">
                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Notificaciones de Escritorio</span>
                    <span className="toggle-desc">Mostrar ventanas emergentes al recibir nuevos mensajes</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={notifications.desktop}
                      onChange={(e) => setNotifications({ ...notifications, desktop: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Sonido al Recibir Mensajes</span>
                    <span className="toggle-desc">Emitir un tono audible con cada mensaje entrante</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={notifications.soundIncoming}
                      onChange={(e) => setNotifications({ ...notifications, soundIncoming: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Sonido al Enviar Mensajes</span>
                    <span className="toggle-desc">Efecto suave de confirmación al presionar enviar</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={notifications.soundOutgoing}
                      onChange={(e) => setNotifications({ ...notifications, soundOutgoing: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Vista Previa del Mensaje</span>
                    <span className="toggle-desc">Mostrar texto y remitente en los avisos de notificación</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={notifications.messagePreview}
                      onChange={(e) => setNotifications({ ...notifications, messagePreview: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* 5. PESTAÑA 3: SEGURIDAD & PRIVACIDAD                              */}
        {/* ================================================================= */}
        {activeTab === 'privacy' && (
          <div className="tab-content-area">
            {/* Privacidad de Lectura y Conexión */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Control de Privacidad</h3>
                  <p>Decide qué información compartes en tus conversaciones.</p>
                </div>
              </div>

              <div className="settings-toggle-list">
                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Confirmación de Lectura (Doble Check Azul ✓✓)</span>
                    <span className="toggle-desc">Permite a otros saber cuando has leído sus mensajes</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={privacy.readReceipts}
                      onChange={(e) => setPrivacy({ ...privacy, readReceipts: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Mostrar Última Hora de Conexión</span>
                    <span className="toggle-desc">Tus contactos podrán ver cuándo estuviste activo por última vez</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={privacy.lastSeen}
                      onChange={(e) => setPrivacy({ ...privacy, lastSeen: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>

                <div className="toggle-item-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Indicador de "Escribiendo..."</span>
                    <span className="toggle-desc">Muestra a tu destinatario cuando estás redactando una respuesta</span>
                  </div>
                  <label className="switch-control">
                    <input
                      type="checkbox"
                      checked={privacy.typingIndicator}
                      onChange={(e) => setPrivacy({ ...privacy, typingIndicator: e.target.checked })}
                    />
                    <span className="slider-round"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Cambio de Contraseña Simulado */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Cambio de Contraseña</h3>
                  <p>Mantén tu cuenta protegida actualizando tu clave periódicamente.</p>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  showToast('🔒 Contraseña actualizada correctamente')
                }}
                className="form-grid-2col"
              >
                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
                  <input
                    id="newPassword"
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div className="form-actions-bar" style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" className="btn-secondary">
                    <span>Actualizar Contraseña</span>
                  </button>
                </div>
              </form>
            </section>

            {/* Sesiones Activas */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Dispositivos y Sesiones Activas</h3>
                  <p>Equipos donde tu cuenta de Nexu se encuentra actualmente iniciada.</p>
                </div>
              </div>

              <div className="security-session-list">
                {sessions.map((sess) => (
                  <div key={sess.id} className="session-card">
                    <div className="session-device-meta">
                      <div className="device-icon-box">
                        {sess.platform === 'Mobile' || sess.platform === 'Tablet' ? (
                          <IconSmartphone />
                        ) : (
                          <IconLaptop />
                        )}
                      </div>
                      <div className="device-text">
                        <span className="device-name">
                          {sess.browser} en {sess.deviceName}
                          {sess.isCurrent && (
                            <span className="badge-current-session">Sesión Actual</span>
                          )}
                        </span>
                        <span className="device-location">
                          {sess.ip} · Último acceso: {sess.lastLoginDate} ({sess.lastLoginTime}) · {sess.lastActive}
                        </span>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        type="button"
                        className="btn-danger-outline"
                        onClick={() => handleCloseSession(sess.id)}
                      >
                        Cerrar Sesión
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* 6. PESTAÑA 4: USUARIOS BLOQUEADOS                                 */}
        {/* ================================================================= */}
        {activeTab === 'blocked' && (
          <div className="tab-content-area">
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Lista de Usuarios Bloqueados</h3>
                  <p>
                    Las personas en esta lista no podrán enviarte mensajes, llamarte ni ver tu estado en línea.
                  </p>
                </div>
              </div>

              {blockedUsers.length > 0 ? (
                <div className="blocked-users-list">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="blocked-user-row">
                      <div className="blocked-user-info">
                        <img src={user.avatar} alt={user.name} className="blocked-avatar" />
                        <div className="blocked-names">
                          <span className="blocked-name">{user.name}</span>
                          <span className="blocked-handle">{user.handle} · Bloqueado el {user.date}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleUnblockUser(user.id, user.name)}
                      >
                        Desbloquear
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-blocked-state">
                  <IconShield />
                  <p>No tienes ningún usuario bloqueado en este momento.</p>
                </div>
              )}
            </section>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 7. MODAL DE GALERÍA DE AVATARES                                     */}
      {/* =================================================================== */}
      {isAvatarModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Elige un nuevo Avatar</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAvatarModalOpen(false)}
                type="button"
              >
                <IconX />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Selecciona una de las opciones predefinidas para tu identidad en Nexu:
            </p>

            <div className="avatar-grid-picker">
              {AVATAR_OPTIONS.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`avatar-pick-option ${profile.avatar === imgUrl ? 'selected' : ''}`}
                  onClick={() => selectAvatar(imgUrl)}
                >
                  <img src={imgUrl} alt={`Avatar opción ${idx + 1}`} />
                </button>
              ))}
            </div>

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. DRAWER DE INFORMACIÓN DE CONTACTO                                */}
      {/* =================================================================== */}
      {isContactDrawerOpen && (
        <div className="contact-drawer-overlay" onClick={() => setIsContactDrawerOpen(false)}>
          <div className="contact-drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Ficha de Contacto</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsContactDrawerOpen(false)}
                type="button"
              >
                <IconX />
              </button>
            </div>

            <div className="drawer-body-content">
              <div className="drawer-contact-hero">
                <img
                  src={AVATAR_OPTIONS[3]}
                  alt="Contacto"
                  className="drawer-contact-avatar"
                />
                <span className="drawer-contact-name">Jonathan Gómez</span>
                <span className="drawer-contact-handle">@jonathan · En línea</span>
              </div>

              <p className="drawer-contact-bio">
                "Desarrollando la Landing Page y coordinando el proyecto colaborativo Nexu 🚀"
              </p>

              <div className="drawer-action-buttons">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setIsContactDrawerOpen(false)
                    showToast('💬 Abriendo chat directo con Jonathan...')
                  }}
                >
                  Iniciar Chat
                </button>
                <button
                  type="button"
                  className="btn-danger-outline"
                  onClick={() => showToast('🚫 Usuario silenciado temporalmente')}
                >
                  Silenciar
                </button>
              </div>

              <div className="drawer-details-card">
                <div className="drawer-detail-item">
                  <span className="detail-key">Correo Electrónico</span>
                  <span className="detail-val">jonathan@nexu.app</span>
                </div>

                <div className="drawer-detail-item">
                  <span className="detail-key">Grupos en Común</span>
                  <span className="detail-val">Frontend Master Squad (4 integrantes)</span>
                </div>

                <div className="drawer-detail-item">
                  <span className="detail-key">Archivos Compartidos</span>
                  <span className="detail-val">12 imágenes · 3 documentos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 9. TOAST NOTIFICATION                                               */}
      {/* =================================================================== */}
      {toastMessage && (
        <div className="profile-toast-alert">
          <span className="toast-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default ProfileSettings
