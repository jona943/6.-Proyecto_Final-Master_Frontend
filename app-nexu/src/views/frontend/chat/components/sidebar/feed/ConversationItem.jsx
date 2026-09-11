import React from 'react'
import { IconStar, IconBot } from '../../../../../../components/icons/Icons'

const ConversationItem = ({ chat, isSelected, onSelectChat, onContextMenu }) => {
  const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null

  const hasUnread = (chat.unreadCount || 0) > 0

  return (
    <button
      type="button"
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectChat(chat.id)}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault()
          onContextMenu(e, chat)
        }
      }}
    >
      <div className="avatar-wrapper">
        {chat.avatarUrl ? (
          <div
            className="avatar-badge"
            style={{
              padding: 0,
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%'
            }}
          >
            <img
              src={chat.avatarUrl}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
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
          <span className={`conv-name ${hasUnread ? 'has-unread' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            {chat.name}
            {chat.isBot && (
              <span className="bot-pill-badge" title="Asistente de Inteligencia Artificial / Sistema">
                <IconBot size={10} /> BOT
              </span>
            )}
            {chat.isFavorite && (
              <span title="Favorito" style={{ color: 'var(--accent-acid, #d4ff00)', display: 'inline-flex' }}>
                <IconStar size={11} filled />
              </span>
            )}
          </span>
          <span className={`conv-time ${hasUnread ? 'has-unread' : ''}`}>{lastMsg ? lastMsg.time : ''}</span>
        </div>

        <div className="conv-bottom-row">
          <span className={`conv-preview ${hasUnread ? 'has-unread' : ''}`}>
            {lastMsg ? (
              <>
                {lastMsg.sender === 'me' && <span>Tú: </span>}
                {lastMsg.text}
              </>
            ) : (
              <em>Sin mensajes</em>
            )}
          </span>

          {hasUnread && (
            <span className="unread-badge">{chat.unreadCount}</span>
          )}
        </div>
      </div>
    </button>
  )
}

export default ConversationItem
