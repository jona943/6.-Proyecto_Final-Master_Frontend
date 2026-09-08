import React, { memo } from 'react'
import { IconShield, IconUserPlus, IconLink, IconLock } from '../../../../../components/icons/Icons'

const ChatSidebarFeed = ({
  incomingRequests,
  chatsCount,
  filteredChats,
  activeChatId,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onOpenConnectModal,
  onCopyInviteLink,
  onSelectChat
}) => {
  return (
    <div className="conversations-feed">
      {/* Solicitudes de Conexión Entrantes */}
      {incomingRequests.length > 0 && (
        <div className="sidebar-pending-requests">
          <span className="input-hint" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
            Solicitudes de Conexión ({incomingRequests.length})
          </span>
          {incomingRequests.map((req) => (
            <div key={req.id} className="pending-request-card">
              <div className="pending-request-header">
                <div className="avatar-badge">{req.fromUser.avatar}</div>
                <div>
                  <div className="user-found-name">{req.fromUser.name}</div>
                  <div className="user-found-handle">{req.fromUser.handle}</div>
                </div>
              </div>
              <div className="pending-request-actions" style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-accept-req"
                  style={{ flex: '1 1 auto', padding: '0.45rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => onAcceptRequest(req)}
                >
                  Aceptar
                </button>
                <button
                  type="button"
                  className="btn-reject-req"
                  style={{ flex: '1 1 auto', padding: '0.45rem 0.6rem', fontSize: '0.78rem' }}
                  onClick={() => onRejectRequest(req.id)}
                >
                  Rechazar
                </button>
                <button
                  type="button"
                  className="btn-reject-req"
                  style={{ flex: '1 1 auto', padding: '0.45rem 0.6rem', fontSize: '0.78rem', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  onClick={() => onBlockUser && onBlockUser(req)}
                  title="Rechazar y bloquear usuario"
                >
                  Bloquear
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lista de Chats o Estado Vacío */}
      {chatsCount === 0 ? (
        <div className="sidebar-empty-state">
          <div className="sidebar-empty-icon">
            <IconShield />
          </div>
          <div>
            <h4 className="sidebar-empty-title">Bandeja Privada</h4>
            <p className="sidebar-empty-desc">
              No tienes conversaciones activas aún. Conecta mediante un alias o comparte tu enlace directo.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            <button
              type="button"
              className="btn-connect-primary"
              onClick={onOpenConnectModal}
              title="Conectar mediante alias de usuario"
            >
              <IconUserPlus />
              <span>Conectar con un usuario</span>
            </button>

            <button
              type="button"
              className="btn-invite-link"
              onClick={onCopyInviteLink}
              title="Copiar enlace de conexión directa"
            >
              <IconLink />
              <span>Copiar mi enlace directo</span>
            </button>
          </div>

          <div className="sidebar-privacy-box">
            <span className="sidebar-privacy-tag">
              <IconLock /> Cero Spam · Punto a Punto
            </span>
            <p className="sidebar-privacy-text">
              Solo los usuarios con solicitudes aceptadas pueden enviarte mensajes.
            </p>
          </div>
        </div>
      ) : filteredChats.length === 0 ? (
        <div className="empty-search-msg">
          <p>No se encontraron resultados</p>
        </div>
      ) : (
        filteredChats.map((chat) => {
          const lastMsg = chat.messages[chat.messages.length - 1]
          const isSelected = chat.id === activeChatId

          return (
            <button
              key={chat.id}
              className={`conversation-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="avatar-wrapper">
                {chat.avatarUrl ? (
                  <div className="avatar-badge" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                    <img src={chat.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div className={`avatar-badge ${chat.isBot ? 'system-avatar' : ''}`}>
                    {chat.avatar}
                  </div>
                )}
                <span className={`user-status-dot ${chat.status}`}></span>
              </div>

              <div className="conv-details">
                <div className="conv-top-row">
                  <span className="conv-name">{chat.name}</span>
                  <span className="conv-time">{lastMsg ? lastMsg.time : ''}</span>
                </div>

                <div className="conv-bottom-row">
                  <span className="conv-preview">
                    {lastMsg ? (
                      <>
                        {lastMsg.sender === 'me' && <span>Tú: </span>}
                        {lastMsg.text}
                      </>
                    ) : (
                      <em>Sin mensajes</em>
                    )}
                  </span>

                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </button>
          )
        })
      )}
    </div>
  )
}

export default memo(ChatSidebarFeed)
