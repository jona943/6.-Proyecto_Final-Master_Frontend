import { IconArrowLeft, IconLogOut, renderAvatarBadge } from './SettingsIcons'

function ProfileHeaderCard({
  profile,
  userInitials,
  onBackToChat,
  onLogout
}) {
  return (
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
          {renderAvatarBadge(profile.avatarType, userInitials, 40)}
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
  )
}

export default ProfileHeaderCard
