import React, { memo } from 'react'
import { IconShield, IconUserPlus, IconLink, IconLock } from '../../../../../components/icons/Icons'

const ChatSidebarFeed = ({
  incomingRequests = [],
  outgoingRequests = [],
  onCancelRequest,
  chatsCount,
  filteredChats,
  activeChatId,
  onAcceptRequest,
  onRejectRequest,
  onBlockUser,
  onOpenConnectModal,
  onCopyInviteLink,
  onSelectChat,
  activeFilter
}) => {
  return (
    <div className="conversations-feed">
      {/* Solicitudes de Conexión Entrantes y Salientes */}
      {activeFilter === 'requests' && (incomingRequests.length > 0 || outgoingRequests.length > 0) && (
        <div className="sidebar-pending-requests">
          {incomingRequests.length > 0 && (
            <>
              <span className="input-hint" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginTop: '0.5rem' }}>
                Recibidas ({incomingRequests.length})
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
                  <div className="pending-request-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button
                        type="button"
                        className="btn-accept-req"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}
                        onClick={() => onAcceptRequest(req)}
                      >
                        Aceptar
                      </button>
                      <button
                        type="button"
                        className="btn-reject-req"
                        style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem' }}
                        onClick={() => onRejectRequest(req.id)}
                      >
                        Rechazar
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-reject-req"
                      style={{ padding: '0.45rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.08)', color: '#ef4444', borderColor: 'transparent' }}
                      onClick={() => onBlockUser && onBlockUser(req)}
                      title="Rechazar y bloquear usuario"
                    >
                      Bloquear usuario
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {outgoingRequests.length > 0 && (
            <>
              <span className="input-hint" style={{ textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginTop: '1rem' }}>
                Enviadas ({outgoingRequests.length})
              </span>
              {outgoingRequests.map((req) => (
                <div key={req.id} className="pending-request-card" style={{ opacity: 0.8 }}>
                  <div className="pending-request-header">
                    <div className="avatar-badge" style={{ background: 'transparent', border: '1px solid var(--border-subtle)' }}>{req.toUser.avatar}</div>
                    <div>
                      <div className="user-found-name">{req.toUser.name}</div>
                      <div className="user-found-handle" style={{ fontSize: '0.75rem' }}>Pendiente de aceptación...</div>
                    </div>
                  </div>
                  <div className="pending-request-actions">
                    <button
                      type="button"
                      className="btn-reject-req"
                      style={{ width: '100%', padding: '0.45rem' }}
                      onClick={() => onCancelRequest && onCancelRequest(req.id, req.toUser.username)}
                    >
                      Cancelar solicitud
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeFilter === 'requests' && incomingRequests.length === 0 && outgoingRequests.length === 0 && (
        <div className="sidebar-empty-state">
          <div>
            <h4 className="sidebar-empty-title">Sin solicitudes</h4>
            <p className="sidebar-empty-desc">No tienes solicitudes de conexión pendientes.</p>
          </div>
        </div>
      )}

      {/* Lista de Chats o Estado Vacío */}
      {chatsCount === 0 && activeFilter !== 'requests' ? (
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
      ) : activeFilter === 'requests' ? null : filteredChats.length === 0 ? (
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
                  <div className="avatar-badge" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-subtle)', borderRadius: '50%' }}>
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
