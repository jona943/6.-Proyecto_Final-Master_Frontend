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
// ICONOS DE IDENTIDAD DE GÉNERO Y AVATAR VECTORIAL NATIVO
// ============================================================================
const AvatarNeutral = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"></circle>
    <path d="M6 21v-2a6 6 0 0 1 12 0v2"></path>
  </svg>
)

const AvatarFemale = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z"></path>
    <circle cx="12" cy="7" r="4"></circle>
    <path d="M8 8c0 3 1.8 5 4 5s4-2 4-5"></path>
  </svg>
)

const AvatarMale = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z"></path>
    <circle cx="12" cy="7" r="4"></circle>
    <path d="M9 4.5l3-2 3 2"></path>
  </svg>
)

const AvatarShield = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const AVATAR_TYPES = [
  { id: 'initials', label: 'Iniciales Neón' },
  { id: 'neutral', label: 'Icono Neutral' },
  { id: 'female', label: 'Icono Femenino' },
  { id: 'male', label: 'Icono Masculino' },
  { id: 'shield', label: 'Escudo Privado' }
]

// ============================================================================
// COMPONENTE PRINCIPAL: ProfileSettings
// ============================================================================
function ProfileSettings({ onBackToChat, onLogout, currentUserHandle, onUpdateUser }) {
  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'settings' | 'privacy' | 'blocked'

  // Identificación dinámica de la cuenta activa (2 cuentas: adminUser o rosi_master)
  const cleanHandle = currentUserHandle ? currentUserHandle.replace(/^@/, '').toLowerCase() : 'adminuser'
  const isRosi = cleanHandle === 'rosi_master'
  const isAdmin = cleanHandle === 'adminuser'

  // Perfil del Usuario persistido o inicializado
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(`nexu_profile_${cleanHandle}`)
      if (saved) return JSON.parse(saved)
    } catch {}

    return {
      displayName: isRosi ? 'Rosy Master' : isAdmin ? 'Admin User' : cleanHandle,
      username: isRosi ? 'rosi_master' : isAdmin ? 'adminUser' : cleanHandle,
      gender: isRosi ? 'female' : 'male', // 'neutral' | 'female' | 'male'
      avatarType: isRosi ? 'female' : 'initials', // 'initials' | 'neutral' | 'female' | 'male' | 'shield'
      email: `${cleanHandle}@nexu.app`,
      bio: isRosi
        ? 'Especialista Frontend · Desarrollo modular en React con enfoque en privacidad.'
        : 'Administrador del Sistema · Gestión de identidades y seguridad punto a punto.',
      presence: 'online'
    }
  })

  // Iniciales tipográficas automáticas
  const userInitials = (profile.displayName || profile.username || 'AU')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Renderizador de avatar vectorial
  const renderAvatar = (type, initials, size = 48) => {
    const isBig = size >= 50
    if (type === 'initials') {
      return (
        <div
          className="avatar-badge-neon"
          style={{ width: size, height: size, fontSize: isBig ? '1.5rem' : size > 36 ? '0.9rem' : '0.75rem' }}
        >
          {initials}
        </div>
      )
    }
    if (type === 'female') {
      return (
        <div className="avatar-badge-neon female" style={{ width: size, height: size }}>
          <AvatarFemale size={size * 0.55} />
        </div>
      )
    }
    if (type === 'male') {
      return (
        <div className="avatar-badge-neon male" style={{ width: size, height: size }}>
          <AvatarMale size={size * 0.55} />
        </div>
      )
    }
    if (type === 'shield') {
      return (
        <div className="avatar-badge-neon shield" style={{ width: size, height: size }}>
          <AvatarShield size={size * 0.52} />
        </div>
      )
    }
    return (
      <div className="avatar-badge-neon neutral" style={{ width: size, height: size }}>
        <AvatarNeutral size={size * 0.55} />
      </div>
    )
  }

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
    readReceipts: true,
    lastSeen: true,
    typingIndicator: true,
    allowStrangers: false
  })

  // Dispositivos y Sesiones Activas Registradas
  const [sessions, setSessions] = useState(() => getUserSessions(cleanHandle))

  const handleCloseSession = (sessionId) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId)
      try {
        localStorage.setItem(`nexu_sessions_${cleanHandle}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    showToast('Sesión cerrada en el dispositivo secundario')
  }

  // Contactos Bloqueados
  const [blockedUsers, setBlockedUsers] = useState([
    {
      id: 'usr-b1',
      name: 'Spam Bot Publicidad',
      handle: '@crypto_promo_99',
      avatarType: 'neutral',
      initials: 'SP',
      date: '14 Feb 2026'
    }
  ])

  // Modales y Toasts
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Estado del formulario de cambio de contraseña
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  })

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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(0.2, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.35)
        showToast('Sonido de notificación reproducido')
      }
    } catch {
      showToast('Tono de notificación simulado')
    }
  }

  // Manejar cambios en campos de perfil
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  // Sanitizador de Alias: solo alfanumérico y máximo 10 caracteres
  const handleUsernameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    setProfile((prev) => ({ ...prev, username: clean }))
  }

  // Cambio de sexo/género con asignación de icono representativo
  const handleGenderChange = (newGender) => {
    setProfile((prev) => {
      let suggestedAvatar = prev.avatarType
      if (newGender === 'female') suggestedAvatar = 'female'
      else if (newGender === 'male') suggestedAvatar = 'male'
      else if (newGender === 'neutral') suggestedAvatar = 'neutral'

      const updated = {
        ...prev,
        gender: newGender,
        avatarType: suggestedAvatar
      }
      try {
        localStorage.setItem(`nexu_profile_${cleanHandle}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    showToast(`Identidad de género asignada: ${newGender === 'female' ? 'Femenino' : newGender === 'male' ? 'Masculino' : 'Neutral'}`)
  }

  // Guardar perfil y persistir en storage
  const handleSaveProfile = (e) => {
    e.preventDefault()
    try {
      localStorage.setItem(`nexu_profile_${cleanHandle}`, JSON.stringify(profile))
      if (profile.username && profile.username.toLowerCase() !== cleanHandle) {
        localStorage.setItem(`nexu_profile_${profile.username.toLowerCase()}`, JSON.stringify(profile))
      }
    } catch {}
    if (onUpdateUser && profile.username) {
      onUpdateUser(profile.username)
    }
    showToast('Perfil guardado y sincronizado con la bandeja de chat')
  }

  // Manejar cambio de contraseña validando contra las 2 cuentas oficiales
  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    const expectedPass = localStorage.getItem(`nexu_custom_pass_${cleanHandle}`) || (isRosi ? 'Nexu2026Pass!' : '12345678')

    if (passwords.current !== expectedPass) {
      showToast('La contraseña actual es incorrecta')
      return
    }

    if (passwords.newPass.length < 8) {
      showToast('La nueva contraseña debe tener al menos 8 caracteres')
      return
    }

    if (passwords.newPass !== passwords.confirmPass) {
      showToast('Las contraseñas no coinciden')
      return
    }

    try {
      localStorage.setItem(`nexu_custom_pass_${cleanHandle}`, passwords.newPass)
    } catch {}

    setPasswords({ current: '', newPass: '', confirmPass: '' })
    showToast('Contraseña actualizada y guardada correctamente')
  }

  // Desbloquear usuario
  const handleUnblockUser = (id, name) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id))
    showToast(`${name} ha sido desbloqueado`)
  }

  // Selección de Avatar
  const selectAvatarType = (type) => {
    setProfile((prev) => {
      const updated = { ...prev, avatarType: type }
      try {
        localStorage.setItem(`nexu_profile_${cleanHandle}`, JSON.stringify(updated))
      } catch {}
      return updated
    })
    setIsAvatarModalOpen(false)
    showToast('Icono de avatar actualizado')
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
              {renderAvatar(profile.avatarType, userInitials, 40)}
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
        {/* 2. BARRA DE PESTAÑAS (TABS FUNCIONALES)                           */}
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
                  <p>Configura tu icono vectorial, nombre visible, sexo y estado de presencia.</p>
                </div>
              </div>

              {/* Fila Hero del Perfil con Avatar Vectorial y Datos Rápidos */}
              <div className="profile-hero-row">
                <div className="avatar-edit-container">
                  {renderAvatar(profile.avatarType, userInitials, 100)}
                  <button
                    className="avatar-change-badge"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Cambiar estilo de avatar"
                    type="button"
                  >
                    <IconCamera />
                  </button>
                </div>

                <div className="profile-hero-details">
                  <span className="hero-display-name">{profile.displayName}</span>
                  <span className="hero-username-handle">@{profile.username}</span>
                  <span className="hero-join-date">
                    Cuenta activa: {isRosi ? 'Rosy Master (Frontend Specialist)' : 'Admin User (System Admin)'} · Nexu v1.0
                  </span>
                </div>
              </div>

              {/* Selector de Sexo / Identidad de Género */}
              <div className="form-group">
                <label className="form-label">
                  <span>Identidad de Género / Sexo</span>
                  <span className="form-label-hint">Asigna tu icono representativo</span>
                </label>
                <div className="gender-selector-grid">
                  <button
                    type="button"
                    className={`gender-option-btn ${profile.gender === 'neutral' ? 'active' : ''}`}
                    onClick={() => handleGenderChange('neutral')}
                  >
                    <AvatarNeutral size={18} />
                    <div className="gender-btn-meta">
                      <span className="gender-btn-title">Prefiero no especificar</span>
                      <span className="gender-btn-sub">Icono neutral o iniciales</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`gender-option-btn ${profile.gender === 'female' ? 'active' : ''}`}
                    onClick={() => handleGenderChange('female')}
                  >
                    <AvatarFemale size={18} />
                    <div className="gender-btn-meta">
                      <span className="gender-btn-title">Femenino</span>
                      <span className="gender-btn-sub">Icono femenino</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className={`gender-option-btn ${profile.gender === 'male' ? 'active' : ''}`}
                    onClick={() => handleGenderChange('male')}
                  >
                    <AvatarMale size={18} />
                    <div className="gender-btn-meta">
                      <span className="gender-btn-title">Masculino</span>
                      <span className="gender-btn-sub">Icono masculino</span>
                    </div>
                  </button>
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
                  <label className="form-label" htmlFor="username">
                    <span>Alias Único (Handle)</span>
                    <span className="form-label-hint">{profile.username.length}/10</span>
                  </label>
                  <div className="form-input-container">
                    <span className="form-input-prefix">@</span>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      className="form-input has-prefix"
                      value={profile.username}
                      onChange={handleUsernameChange}
                      maxLength={10}
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
                    showToast('Modo Oscuro (Obsidian Carbon) activado')
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
                    showToast('Modo Claro activado')
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
                    <span className="toggle-title">Confirmación de Lectura (Doble Check)</span>
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

            {/* Cambio de Contraseña */}
            <section className="settings-section-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <h3>Cambio de Contraseña</h3>
                  <p>Mantén tu cuenta protegida actualizando tu clave periódicamente.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="form-grid-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="currentPassword">Contraseña Actual</label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
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
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="form-input"
                    placeholder="Repite la nueva contraseña"
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
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
                        {renderAvatar(user.avatarType, user.initials, 40)}
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
      {/* 7. MODAL DE GALERÍA DE AVATARES VECTORIALES                         */}
      {/* =================================================================== */}
      {isAvatarModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAvatarModalOpen(false)}>
          <div className="modal-dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Elige tu Icono de Identidad</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsAvatarModalOpen(false)}
                type="button"
              >
                <IconX />
              </button>
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Selecciona el estilo de icono vectorial que te representará en la red de Nexu:
            </p>

            <div className="avatar-vector-picker-grid">
              {AVATAR_TYPES.map((av) => (
                <div
                  key={av.id}
                  className={`avatar-vector-option-card ${profile.avatarType === av.id ? 'selected' : ''}`}
                  onClick={() => selectAvatarType(av.id)}
                >
                  {renderAvatar(av.id, userInitials, 52)}
                  <span className="avatar-option-label">{av.label}</span>
                </div>
              ))}
            </div>

            <div className="form-actions-bar">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setIsAvatarModalOpen(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. TOAST NOTIFICATION                                               */}
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
