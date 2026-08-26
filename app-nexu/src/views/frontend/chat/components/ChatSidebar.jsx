import { useState, useRef, useEffect } from 'react'
import {
  IconSearch,
  IconUserPlus,
  IconMenu,
  IconInfo,
  IconShield,
  IconLink,
  IconLock,
  IconCheck,
  AvatarFemale,
  AvatarMale,
  AvatarNeutral
} from '../../../../components/icons/Icons'

const PRESENCE_OPTIONS = [
  {
    id: 'online',
    label: 'En línea',
    desc: 'Disponible y activo para recibir mensajes'
  },
  {
    id: 'away',
    label: 'Ausente',
    desc: 'Inactivo temporalmente o en descanso'
  },
  {
    id: 'dnd',
    label: 'No molestar',
    desc: 'Silenciar alertas y avisos'
  }
]

function ChatSidebar({
  mobileView,
  currentUser,
  presenceStatus,
  onSelectPresence,
  onOpenSettings,
  onOpenConnectModal,
  onToggleDetailsPanel,
  showDetailsPanel,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  chatsCount,
  incomingRequests,
  onAcceptRequest,
  onRejectRequest,
  filteredChats,
  activeChatId,
  onSelectChat,
  onCopyInviteLink
}) {
  const [isPresenceMenuOpen, setIsPresenceMenuOpen] = useState(false)
  const presenceMenuRef = useRef(null)

  // Cerrar menú de presencia al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (presenceMenuRef.current && !presenceMenuRef.current.contains(e.target)) {
        setIsPresenceMenuOpen(false)
      }
    }
    if (isPresenceMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPresenceMenuOpen])

  const getPresenceLabel = (status) => {
    if (status === 'online') return 'En línea'
    if (status === 'away') return 'Ausente'
    if (status === 'dnd') return 'No molestar'
    return 'Desconectado'
  }

  return (
    <aside className={`chat-sidebar ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>
      {/* 1. Encabezado del Usuario Activo */}
      <header className="chat-user-header">
        <div className="user-header-left-box">
          <div
            className="avatar-wrapper user-avatar-clickable"
            onClick={() => setIsPresenceMenuOpen((prev) => !prev)}
            title="Haz clic para cambiar tu estado de presencia"
          >
            {currentUser.avatarType === 'female' ? (
              <div className="avatar-badge" style={{ borderColor: '#ff70a6', color: '#ff70a6' }}>
                <AvatarFemale size={18} />
              </div>
            ) : currentUser.avatarType === 'male' ? (
              <div className="avatar-badge" style={{ borderColor: '#70d6ff', color: '#70d6ff' }}>
                <AvatarMale size={18} />
              </div>
            ) : currentUser.avatarType === 'neutral' ? (
              <div className="avatar-badge" style={{ borderColor: 'var(--accent-acid)', color: 'var(--accent-acid)' }}>
                <AvatarNeutral size={18} />
              </div>
            ) : currentUser.avatarType === 'shield' ? (
              <div className="avatar-badge" style={{ borderColor: '#ffd670', color: '#ffd670' }}>
                <IconShield />
              </div>
            ) : (
              <div className="avatar-badge">{currentUser.avatar}</div>
            )}
            <span className={`user-status-dot ${presenceStatus}`}></span>
          </div>

          <div className="user-info-meta">
            <div className="user-name-row">
              <span className="user-display-name">{currentUser.name}</span>
              <span className="tag-active-pill">TÚ</span>
            </div>
            <button
              type="button"
              className="presence-status-trigger-btn"
              onClick={() => setIsPresenceMenuOpen((prev) => !prev)}
              title="Cambiar estado"
            >
              <span className={`status-dot-sm ${presenceStatus}`}></span>
              <span>{currentUser.handle} · {getPresenceLabel(presenceStatus)}</span>
            </button>
          </div>
        </div>

        {/* Menú Flotante de Selector de Presencia */}
        {isPresenceMenuOpen && (
          <div className="presence-popover-menu" ref={presenceMenuRef}>
            <div className="presence-popover-header">
              <span>Tu Estado de Presencia</span>
            </div>
            <div className="presence-options-list">
              {PRESENCE_OPTIONS.map((opt) => {
                const isSelected = presenceStatus === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={`presence-option-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (onSelectPresence) onSelectPresence(opt.id)
                      setIsPresenceMenuOpen(false)
                    }}
                  >
                    <span className={`status-dot-lg ${opt.id}`}></span>
                    <div className="presence-option-text">
                      <strong>{opt.label}</strong>
                      <small>{opt.desc}</small>
                    </div>
                    {isSelected && <IconCheck size={14} />}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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
            title="Ajustes del chat (3 rayitas)"
            onClick={onOpenSettings}
            type="button"
          >
            <IconMenu />
          </button>
          <button
            className={`btn-icon-subtle ${showDetailsPanel ? 'active' : ''}`}
            title="Detalles de usuario"
            onClick={onToggleDetailsPanel}
            type="button"
          >
            <IconInfo />
          </button>
        </div>
      </header>

      {/* 2. Buscador y Filtros */}
      <div className="chat-search-bar-box">
        <div className="search-input-wrapper">
          <IconSearch />
          <input
            type="text"
            placeholder="Buscar contactos..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {chatsCount > 0 && (
          <div className="filter-pills">
            <button
              className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => onFilterChange('all')}
            >
              Todos ({chatsCount})
            </button>
            <button
              className={`filter-pill-btn ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => onFilterChange('unread')}
            >
              No leídos
            </button>
            <button
              className={`filter-pill-btn ${activeFilter === 'online' ? 'active' : ''}`}
              onClick={() => onFilterChange('online')}
            >
              En línea
            </button>
          </div>
        )}
      </div>

      {/* 3. Lista de Conversaciones o Estado Vacío */}
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
                <div className="pending-request-actions">
                  <button
                    type="button"
                    className="btn-accept-req"
                    onClick={() => onAcceptRequest(req)}
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    className="btn-reject-req"
                    onClick={() => onRejectRequest(req.id)}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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
                  <div className={`avatar-badge ${chat.isBot ? 'system-avatar' : ''}`}>
                    {chat.avatar}
                  </div>
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
    </aside>
  )
}

export default ChatSidebar
