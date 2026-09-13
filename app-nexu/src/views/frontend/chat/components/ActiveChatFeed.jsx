import { IconCheck, IconCheckCheck, IconSearch, IconCopy } from '../../../../components/icons/Icons'
import ActiveChatAttachment from './ActiveChatAttachment'

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
    if (typeof text !== 'string') return text

    // Helper to process search highlights within any text segment
    const processSearch = (segment, keyPrefix = '') => {
      if (!query || !query.trim()) return segment
      const cleanQuery = query.trim()
      const searchRegex = new RegExp(`(${cleanQuery.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')})`, 'gi')
      const parts = segment.split(searchRegex)

      return parts.map((part, i) =>
        searchRegex.test(part) ? (
          <mark key={`${keyPrefix}-mark-${i}`} className="chat-search-match">
            {part}
          </mark>
        ) : (
          part
        )
      )
    }

    // Process Markdown Bold (**text**) first
    const boldRegex = /\*\*(.*?)\*\*/g
    const elements = []
    let lastIndex = 0
    let match

    while ((match = boldRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        elements.push(processSearch(text.substring(lastIndex, match.index), `text-${match.index}`))
      }
      elements.push(
        <strong key={`bold-${match.index}`}>
          {processSearch(match[1], `bold-inner-${match.index}`)}
        </strong>
      )
      lastIndex = boldRegex.lastIndex
    }

    if (lastIndex < text.length) {
      elements.push(processSearch(text.substring(lastIndex), `text-last`))
    }

    return elements.length > 0 ? elements : text
  }

  const getMessageDateLabel = (msg) => {
    if (msg.date) {
      const lower = msg.date.toLowerCase()
      if (lower.includes('hoy')) return 'Hoy'
      if (lower.includes('ayer')) return 'Ayer'
      return msg.date
    }

    const rawDate = msg.createdAt || msg.timestamp
    let msgDate = null

    if (rawDate) {
      msgDate = new Date(rawDate)
    } else if (msg.id && typeof msg.id === 'string' && (msg.id.startsWith('msg_') || msg.id.startsWith('reply_'))) {
      const parts = msg.id.split('_')
      const num = parseInt(parts[parts.length - 1], 10)
      if (!isNaN(num) && num > 1000000000000) {
        msgDate = new Date(num)
      }
    }

    if (msgDate && !isNaN(msgDate.getTime())) {
      const today = new Date()
      const isToday =
        msgDate.getDate() === today.getDate() &&
        msgDate.getMonth() === today.getMonth() &&
        msgDate.getFullYear() === today.getFullYear()

      if (isToday) return 'Hoy'

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday =
        msgDate.getDate() === yesterday.getDate() &&
        msgDate.getMonth() === yesterday.getMonth() &&
        msgDate.getFullYear() === yesterday.getFullYear()

      if (isYesterday) return 'Ayer'

      return msgDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: msgDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      })
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
            msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase().trim())

          const currentDateLabel = getMessageDateLabel(msg)
          const prevMessage = activeChat.messages[index - 1]
          const prevDateLabel = prevMessage ? getMessageDateLabel(prevMessage) : null
          const showDateDivider = currentDateLabel !== prevDateLabel

          return (
            <div key={msg.id || `msg-${index}`} style={{ display: 'contents' }}>
              {showDateDivider && (
                <div className="date-divider">
                  <span>{currentDateLabel}</span>
                </div>
              )}

              <div
                className={`message-row ${isMe ? 'me outgoing' : 'them incoming'} ${
                  isMatching ? 'search-highlight-row' : ''
                }`}
              >
                <div className="message-bubble-wrapper">
                  <div className="message-actions-overlay">
                    <button
                      className="btn-msg-hover"
                      title="Copiar texto"
                      onClick={() => onCopyMessage(msg.text || '')}
                      type="button"
                    >
                      <IconCopy size={14} />
                    </button>
                  </div>

                  <div className={`message-bubble ${isMatching ? 'search-active-bubble' : ''}`}>
                    {msg.attachment && (
                      <ActiveChatAttachment
                        attachment={msg.attachment}
                        isMe={isMe}
                        activeChat={activeChat}
                      />
                    )}
                    
                    {msg.text && (
                      <p className="message-text">
                        {renderHighlightedText(msg.text, searchQuery)}
                      </p>
                    )}
                    
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
