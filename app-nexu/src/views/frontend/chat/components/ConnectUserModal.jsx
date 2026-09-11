import { IconUserPlus, IconX, IconCheck, IconClock } from '../../../../components/icons/Icons'
import './ConnectUserModal.css'

function ConnectUserModal({
  isOpen,
  onClose,
  searchAlias,
  onSearchChange,
  searchError,
  searchedUser,
  userSuggestions = [],
  sentRequests = [],
  chats = [],
  incomingRequests = [],
  outgoingRequests = [],
  onSendRequest,
  onAcceptRequest,
  onSelectExistingContact
}) {
  if (!isOpen) return null

  const getUserStatus = (targetUsername) => {
    if (!targetUsername) return { type: 'none' }
    const clean = targetUsername.replace(/^@/, '').trim().toLowerCase()

    // 1. ¿Ya es un contacto conectado y activo?
    const existingChat = chats?.find((c) => {
      if (c.isBot || c.isDisconnected || c.isPending) return false
      const h = (c.handle || '').replace(/^@/, '').trim().toLowerCase()
      const n = (c.name || '').replace(/^@/, '').trim().toLowerCase()
      const id = (c.id || '').trim().toLowerCase()
      return h === clean || n === clean || id === clean
    })
    if (existingChat) {
      return { type: 'connected', chat: existingChat }
    }

    // 2. ¿Nos envió una solicitud entrante pendiente?
    const incomingReq = incomingRequests?.find((r) => {
      const fromU = (r.fromUser?.username || r.requesterUsername || '').replace(/^@/, '').trim().toLowerCase()
      return fromU === clean
    })
    if (incomingReq) {
      return { type: 'incoming', request: incomingReq }
    }

    // 3. ¿Tiene una solicitud saliente pendiente enviada por nosotros?
    const isOutgoing =
      sentRequests?.some((u) => (u || '').replace(/^@/, '').trim().toLowerCase() === clean) ||
      outgoingRequests?.some((r) => {
        const toU = (r.toUser?.username || r.targetUsername || '').replace(/^@/, '').trim().toLowerCase()
        return toU === clean
      })
    if (isOutgoing) {
      return { type: 'outgoing' }
    }

    return { type: 'none' }
  }

  const renderUserAvatar = (userItem, existingChat = null, size = 38) => {
    const avatarSrc = userItem?.avatarUrl || existingChat?.avatarUrl
    const initials =
      userItem?.avatar ||
      (userItem?.name || userItem?.username || '?').replace(/^@/, '').slice(0, 2).toUpperCase()

    return (
      <div
        className="user-avatar-modal"
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          maxWidth: size,
          maxHeight: size,
          fontSize: size <= 34 ? '0.75rem' : '0.82rem'
        }}
      >
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={userItem?.name || userItem?.username}
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              if (e.currentTarget.nextSibling) {
                e.currentTarget.nextSibling.style.display = 'flex'
              }
            }}
          />
        ) : null}
        <span
          style={{
            display: avatarSrc ? 'none' : 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {initials}
        </span>
      </div>
    )
  }

  const renderUserAction = (userItem, status, isLarge = false) => {
    if (status.type === 'connected') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="badge-contact-status connected">
            <IconCheck size={12} /> Contacto
          </span>
          {onSelectExistingContact && status.chat && (
            <button
              type="button"
              className="btn-open-chat-subtle"
              onClick={() => onSelectExistingContact(status.chat.id)}
              title="Abrir conversación activa"
            >
              Abrir
            </button>
          )}
        </div>
      )
    }

    if (status.type === 'incoming') {
      return (
        <button
          type="button"
          className="btn-accept-req"
          style={{
            flex: 'none',
            padding: isLarge ? '0.55rem 1rem' : '0.45rem 0.8rem',
            fontSize: isLarge ? '0.85rem' : '0.8rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem'
          }}
          onClick={() => onAcceptRequest && onAcceptRequest(status.request)}
          title="Aceptar solicitud de este usuario"
        >
          <IconCheck size={13} /> Aceptar
        </button>
      )
    }

    if (status.type === 'outgoing') {
      return (
        <span className="badge-contact-status pending">
          <IconClock size={12} /> Enviada
        </span>
      )
    }

    return (
      <button
        type="button"
        className="btn-accept-req"
        style={{
          flex: 'none',
          padding: isLarge ? '0.55rem 1rem' : '0.45rem 0.8rem',
          fontSize: isLarge ? '0.85rem' : '0.8rem'
        }}
        onClick={() => onSendRequest(userItem)}
      >
        Enviar Solicitud
      </button>
    )
  }

  return (
    <div className="connect-modal-backdrop" onClick={onClose}>
      <div className="connect-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="connect-modal-header">
          <div className="connect-modal-title">
            <IconUserPlus /> Conectar con un usuario
          </div>
          <button
            type="button"
            className="btn-icon-subtle"
            onClick={onClose}
            title="Cerrar modal"
          >
            <IconX />
          </button>
        </div>

        <p className="connect-modal-desc">
          Ingresa el alias exacto o parcial (3 a 10 caracteres) para enviar una solicitud de conexión privada.
        </p>

        <div className="connect-input-box">
          <span className="input-prefix-at">@</span>
          <input
            type="text"
            className="connect-input-field"
            placeholder="ej. rosi_master"
            value={searchAlias}
            onChange={(e) => onSearchChange(e.target.value)}
            maxLength={10}
            autoFocus
          />
          <span className={`connect-char-count ${searchAlias.length === 10 ? 'limit' : ''}`}>
            {searchAlias.length}/10
          </span>
        </div>

        {searchError && (
          <div className="connect-error-msg">
            <span>{searchError}</span>
          </div>
        )}

        {searchedUser && (() => {
          const status = getUserStatus(searchedUser.username)
          return (
            <div className="user-found-card">
              <div className="user-found-meta">
                {renderUserAvatar(searchedUser, status.chat, 40)}
                <div>
                  <div className="user-found-name">{searchedUser.name}</div>
                  <div className="user-found-handle">{searchedUser.handle}</div>
                </div>
              </div>

              {renderUserAction(searchedUser, status, true)}
            </div>
          )
        })()}

        {userSuggestions && userSuggestions.length > 0 && (
          <div className="connect-suggestions-box" style={{ marginTop: '1rem' }}>
            <span
              className="input-hint"
              style={{
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.5rem',
                color: 'var(--text-muted, #94a3b8)'
              }}
            >
              Sugerencias de usuarios registrados:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {userSuggestions.map((sug) => {
                const status = getUserStatus(sug.username)
                return (
                  <div key={sug.username} className="user-found-card" style={{ padding: '0.6rem 0.8rem' }}>
                    <div className="user-found-meta">
                      {renderUserAvatar(sug, status.chat, 34)}
                      <div>
                        <div className="user-found-name" style={{ fontSize: '0.85rem' }}>{sug.name}</div>
                        <div className="user-found-handle" style={{ fontSize: '0.75rem' }}>{sug.handle}</div>
                      </div>
                    </div>

                    {renderUserAction(sug, status, false)}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConnectUserModal
