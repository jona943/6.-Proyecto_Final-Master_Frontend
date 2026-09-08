import { IconCheck, IconCheckCheck, IconSearch, IconCopy } from '../../../../components/icons/Icons'

function ActiveChatFeed({
  activeChat,
  searchQuery,
  matchCount,
  isTyping,
  messagesEndRef,
  onCopyMessage
}) {
  const renderStatusIcon = (status) => {
    if (status === 'read') {
      return <span className="msg-status-icon read" title="Leído"><IconCheckCheck size={15} /></span>
    }
    if (status === 'delivered') {
      return <span className="msg-status-icon delivered" title="Entregado"><IconCheckCheck size={15} /></span>
    }
    return <span className="msg-status-icon sent" title="Enviado"><IconCheck size={14} /></span>
  }

  const renderHighlightedText = (text, query) => {
    if (!query || !query.trim()) return text

    const cleanQuery = query.trim()
    const regex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="chat-search-match">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getMessageDateLabel = (msg) => {
    if (msg.date) {
      const lower = msg.date.toLowerCase()
      if (lower.includes('hoy')) return 'Hoy'
      if (lower.includes('ayer')) return 'Ayer'
      return msg.date
    }
    return 'Hoy'
  }

  return (
    <div className="messages-container">
      {searchQuery.trim() && matchCount === 0 && (
        <div className="in-chat-no-results-banner">
          <IconSearch size={18} />
          <p>
            No se encontraron mensajes que coincidan con <strong>"{searchQuery}"</strong> en esta conversación.
          </p>
        </div>
      )}

      {activeChat.messages.length === 0 ? (
        <div className="empty-search-msg">
          <p>No hay mensajes en esta conversación. Envía el primer mensaje.</p>
        </div>
      ) : (
        activeChat.messages.map((msg, index) => {
          const isMe = msg.sender === 'me'
          const isMatching =
            searchQuery.trim() &&
            msg.text.toLowerCase().includes(searchQuery.toLowerCase().trim())

          const currentDateLabel = getMessageDateLabel(msg)
          const prevMessage = activeChat.messages[index - 1]
          const prevDateLabel = prevMessage ? getMessageDateLabel(prevMessage) : null
          const shouldShowDivider = index === 0 || currentDateLabel !== prevDateLabel

          return (
            <div key={msg.id || index} style={{ display: 'contents' }}>
              {shouldShowDivider && (
                <div className="date-divider">
                  <span>{currentDateLabel}</span>
                </div>
              )}
              <div
                className={`message-row ${isMe ? 'me' : 'them'} ${isMatching ? 'highlighted-row' : ''}`}
              >
                {!isMe && (
                  <div className="msg-avatar-tiny">
                    {activeChat.avatar}
                  </div>
                )}

                <div className="message-bubble-wrapper">
                  <div className="message-actions-overlay">
                    <button
                      className="btn-msg-hover"
                      title="Copiar texto"
                      onClick={() => onCopyMessage(msg.text)}
                      type="button"
                    >
                      <IconCopy size={14} />
                    </button>
                  </div>

                  <div className={`message-bubble ${isMatching ? 'search-active-bubble' : ''}`}>
                    <p className="message-text">
                      {renderHighlightedText(msg.text, searchQuery)}
                    </p>
                    <div className="message-meta">
                      <span className="message-time">{msg.time}</span>
                      {isMe && renderStatusIcon(msg.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}

      {isTyping && (
        <div className="typing-indicator-row">
          <div className="typing-bubble">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}

export default ActiveChatFeed
