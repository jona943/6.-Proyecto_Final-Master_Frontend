import React, { memo } from 'react'
import { IconUserPlus, IconMenu, AvatarFemale, AvatarMale, AvatarNeutral } from '../../../../../components/icons/Icons'

const ChatSidebarHeader = ({
  currentUser,
  onOpenConnectModal,
  onOpenSettings
}) => {
  return (
    <header className="chat-user-header">
      <div
        className="user-header-left-box user-avatar-clickable"
        onClick={onOpenSettings}
        title="Ir a Perfil y Configuración"
        style={{ cursor: 'pointer' }}
      >
        <div className="avatar-wrapper">
          {currentUser?.avatarUrl ? (
            <div className="avatar-badge" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}>
              <img src={currentUser.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : currentUser?.avatarType === 'female' ? (
            <div className="avatar-badge" style={{ borderColor: '#ff70a6', color: '#ff70a6' }}>
              <AvatarFemale size={18} />
            </div>
          ) : currentUser?.avatarType === 'male' ? (
            <div className="avatar-badge" style={{ borderColor: '#70d6ff', color: '#70d6ff' }}>
              <AvatarMale size={18} />
            </div>
          ) : currentUser?.avatarType === 'neutral' ? (
            <div className="avatar-badge" style={{ borderColor: 'var(--accent-acid)', color: 'var(--accent-acid)' }}>
              <AvatarNeutral size={18} />
            </div>
          ) : (
            <div className="avatar-badge">{currentUser?.avatar}</div>
          )}
        </div>

        <div className="user-info-meta">
          <span className="user-display-name">
            {currentUser?.name}
          </span>
          <span className="user-handle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {currentUser?.handle}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
        <button
          className="btn-icon-subtle btn-new-chat"
          title="Conectar con nuevo usuario (+)"
          onClick={onOpenConnectModal}
          type="button"
        >
          <IconUserPlus />
        </button>
        <button
          className="btn-icon-subtle"
          title="Ajustes del chat"
          onClick={onOpenSettings}
          type="button"
        >
          <IconMenu />
        </button>
      </div>
    </header>
  )
}

export default memo(ChatSidebarHeader)
