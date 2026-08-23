import { useState, useEffect } from 'react'
import './ProfileSettings.css'
import { useAuth } from '../../../context/AuthContext'
import { authService } from '../../../services/authService'

import ProfileHeaderCard from './components/ProfileHeaderCard'
import SettingsNavTabs from './components/SettingsNavTabs'
import GeneralProfileTab from './components/GeneralProfileTab'
import PreferencesTab from './components/PreferencesTab'
import PrivacySecurityTab from './components/PrivacySecurityTab'
import BlockedUsersTab from './components/BlockedUsersTab'
import AvatarSelectorModal from './components/AvatarSelectorModal'

// ============================================================================
// COMPONENTE PRINCIPAL: PERFIL Y AJUSTES (COORDINADOR + CONTEXT)
// ============================================================================
function ProfileSettings({ onBackToChat, onLogout }) {
  const { user, updateProfile, changePassword } = useAuth()
  const cleanHandle = (user?.username || 'adminUser').toLowerCase()
  const isRosi = cleanHandle === 'rosi_master'

  // Perfil del usuario
  const [profile, setProfile] = useState({
    displayName: user?.displayName || (isRosi ? 'Rosa Melano' : 'Administrador Nexu'),
    username: user?.username || (isRosi ? 'rosi_master' : 'adminUser'),
    email: user?.email || (isRosi ? 'rosa@nexu.app' : 'admin@nexu.app'),
    bio: isRosi
      ? 'Especialista en interfaces reactivas y arquitectura frontend de Nexu.'
      : 'Superadministrador de la plataforma de mensajería privada Nexu.',
    avatarType: user?.avatarType || (isRosi ? 'female' : 'male'),
    gender: user?.gender || (isRosi ? 'female' : 'male'),
    presence: 'online'
  })

  useEffect(() => {
    authService.getProfile(cleanHandle).then((data) => {
      if (data) setProfile(data)
    })
  }, [cleanHandle])

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

  // Preferencias y Tema
  const [themeMode, setThemeMode] = useState('dark')
  const [notifications, setNotifications] = useState({
    desktop: true,
    soundIncoming: true,
    soundOutgoing: true,
    messagePreview: true,
    onlineAlerts: false
  })

  // Privacidad
  const [privacy, setPrivacy] = useState({
    readReceipts: true,
    lastSeen: true,
    typingIndicator: true,
    allowStrangers: false
  })

  // Sesiones de Dispositivos
  const [sessions, setSessions] = useState([])
  useEffect(() => {
    authService.getSessions(cleanHandle).then((data) => setSessions(data))
  }, [cleanHandle])

  const handleCloseSession = async (sessionId) => {
    const updated = await authService.closeSession(cleanHandle, sessionId)
    setSessions(updated)
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

  // Estado de Contraseñas
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  })

  const showToast = (msg) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  // Sonido de prueba (Web Audio API)
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

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleUsernameChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    setProfile((prev) => ({ ...prev, username: clean }))
  }

  const handleGenderChange = (newGender) => {
    setProfile((prev) => {
      let suggestedAvatar = prev.avatarType
      if (newGender === 'female') suggestedAvatar = 'female'
      else if (newGender === 'male') suggestedAvatar = 'male'
      else if (newGender === 'neutral') suggestedAvatar = 'neutral'

      const updated = { ...prev, gender: newGender, avatarType: suggestedAvatar }
      updateProfile(updated)
      return updated
    })
    showToast(`Identidad de género asignada: ${newGender === 'female' ? 'Femenino' : newGender === 'male' ? 'Masculino' : 'Neutral'}`)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    await updateProfile(profile)
    showToast('Perfil guardado y sincronizado en la sesión')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirmPass) {
      showToast('Las contraseñas no coinciden')
      return
    }

    try {
      await changePassword(passwords.current, passwords.newPass)
      setPasswords({ current: '', newPass: '', confirmPass: '' })
      showToast('Contraseña actualizada correctamente')
    } catch (err) {
      showToast(err.message || 'Error al actualizar contraseña')
    }
  }

  const handleUnblockUser = (id, name) => {
    setBlockedUsers((prev) => prev.filter((u) => u.id !== id))
    showToast(`${name} ha sido desbloqueado`)
  }

  const selectAvatarType = async (type) => {
    const updated = { ...profile, avatarType: type }
    setProfile(updated)
    await updateProfile(updated)
    setIsAvatarModalOpen(false)
    showToast('Icono de avatar actualizado')
  }

  return (
    <div className={`profile-settings-wrapper ${themeMode === 'light' ? 'theme-light' : ''}`}>
      <div className="profile-settings-container">
        {/* 1. Header Card */}
        <ProfileHeaderCard
          profile={profile}
          userInitials={userInitials}
          onBackToChat={onBackToChat}
          onLogout={onLogout}
        />

        {/* 2. Tabs */}
        <SettingsNavTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          blockedCount={blockedUsers.length}
        />

        {/* 3. Pestañas */}
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

        {activeTab === 'blocked' && (
          <BlockedUsersTab
            blockedUsers={blockedUsers}
            onUnblockUser={handleUnblockUser}
          />
        )}
      </div>

      {/* 4. Modal Avatares */}
      <AvatarSelectorModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarType={profile.avatarType}
        userInitials={userInitials}
        onSelectAvatar={selectAvatarType}
      />

      {/* 5. Toast */}
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
