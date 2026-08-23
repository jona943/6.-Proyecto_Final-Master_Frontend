import { useState, useEffect } from 'react'
import './ProfileSettings.css'
import { getUserSessions } from '../chat/mockData.js'

import ProfileHeaderCard from './components/ProfileHeaderCard'
import SettingsNavTabs from './components/SettingsNavTabs'
import GeneralProfileTab from './components/GeneralProfileTab'
import PreferencesTab from './components/PreferencesTab'
import PrivacySecurityTab from './components/PrivacySecurityTab'
import BlockedUsersTab from './components/BlockedUsersTab'
import AvatarSelectorModal from './components/AvatarSelectorModal'

// ============================================================================
// COMPONENTE PRINCIPAL: PERFIL Y AJUSTES (COORDINADOR MODULAR)
// ============================================================================
function ProfileSettings({ currentUserHandle = 'adminUser', onBackToChat, onLogout, onUpdateUser }) {
  const cleanHandle = (currentUserHandle || 'adminUser').replace(/^@/, '').toLowerCase()
  const isRosi = cleanHandle === 'rosi_master'

  // Carga inicial sincronizada con almacenamiento local
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(`nexu_profile_${cleanHandle}`)
      if (saved) return JSON.parse(saved)
    } catch {}
    
    return {
      displayName: isRosi ? 'Rosa Melano' : 'Administrador Nexu',
      username: isRosi ? 'rosi_master' : 'adminUser',
      email: isRosi ? 'rosa@nexu.app' : 'admin@nexu.app',
      bio: isRosi 
        ? 'Especialista en interfaces reactivas y arquitectura frontend de Nexu.' 
        : 'Superadministrador de la plataforma de mensajería privada Nexu.',
      avatarType: isRosi ? 'female' : 'male',
      gender: isRosi ? 'female' : 'male',
      presence: 'online'
    }
  })

  const userInitials = profile.displayName
    ? profile.displayName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'NX'

  // Pestaña activa ('profile' | 'settings' | 'privacy' | 'blocked')
  const [activeTab, setActiveTab] = useState('profile')

  // Preferencias Generales y Tema
  const [themeMode, setThemeMode] = useState('dark')
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

  // Dispositivos y Sesiones Activas
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

  // Notificación Toast temporal
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

  // Manejar cambio de contraseña
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
        
        {/* 1. Header Card Principal */}
        <ProfileHeaderCard
          profile={profile}
          userInitials={userInitials}
          onBackToChat={onBackToChat}
          onLogout={onLogout}
        />

        {/* 2. Barra de Pestañas Funcionales */}
        <SettingsNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          blockedCount={blockedUsers.length}
        />

        {/* 3. Pestaña 1: Mi Perfil */}
        {activeTab === 'profile' && (
          <GeneralProfileTab
            profile={profile}
            userInitials={userInitials}
            isRosi={isRosi}
            onOpenAvatarModal={() => setIsAvatarModalOpen(true)}
            onGenderChange={handleGenderChange}
            onPresenceChange={(presence) => setProfile({ ...profile, presence })}
            onProfileChange={handleProfileChange}
            onUsernameChange={handleUsernameChange}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {/* 4. Pestaña 2: Ajustes & Tema */}
        {activeTab === 'settings' && (
          <PreferencesTab
            themeMode={themeMode}
            onThemeChange={(mode) => {
              setThemeMode(mode)
              showToast(`Modo ${mode === 'dark' ? 'Oscuro (Obsidian Carbon)' : 'Claro'} activado`)
            }}
            notifications={notifications}
            onNotificationToggle={(key, val) => setNotifications({ ...notifications, [key]: val })}
            onPlayChimeSound={playChimeSound}
          />
        )}

        {/* 5. Pestaña 3: Privacidad & Seguridad */}
        {activeTab === 'privacy' && (
          <PrivacySecurityTab
            privacy={privacy}
            onPrivacyToggle={(key, val) => setPrivacy({ ...privacy, [key]: val })}
            passwords={passwords}
            onPasswordsChange={(key, val) => setPasswords({ ...passwords, [key]: val })}
            onPasswordSubmit={handlePasswordSubmit}
            sessions={sessions}
            onCloseSession={handleCloseSession}
          />
        )}

        {/* 6. Pestaña 4: Usuarios Bloqueados */}
        {activeTab === 'blocked' && (
          <BlockedUsersTab
            blockedUsers={blockedUsers}
            onUnblockUser={handleUnblockUser}
          />
        )}
      </div>

      {/* 7. Modal de Selección de Avatares */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarType={profile.avatarType}
        userInitials={userInitials}
        onSelectAvatar={selectAvatarType}
      />

      {/* 8. Toast de Notificación */}
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
