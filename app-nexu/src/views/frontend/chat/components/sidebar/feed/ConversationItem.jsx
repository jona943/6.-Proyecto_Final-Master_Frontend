import React from 'react'

const ConversationItem = ({ chat, isSelected, onSelectChat }) => {
  const lastMsg = chat.messages && chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null

  return (
    <button
      type="button"
      className={`conversation-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelectChat(chat.id)}
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
}

export default ConversationItem
