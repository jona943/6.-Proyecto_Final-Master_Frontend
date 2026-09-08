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

  const renderAttachment = (attachment, isMe) => {
    if (!attachment) return null

    // Intentar cargar desde el almacenamiento local
    const localData = localStorage.getItem(attachment.fileId)

    if (!localData) {
      // Caso 1: No está en el dispositivo (el usuario inició sesión en otro lado o es el receptor que no recibió la carga)
      return (
        <div className="attachment-missing-box" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', marginBottom: '0.5rem', border: '1px dashed var(--border-color)', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            <strong>{attachment.name}</strong> ({attachment.size})
          </div>
          <div style={{ color: '#ef4444', marginTop: '0.3rem', fontSize: '0.8rem' }}>
            {isMe 
              ? 'Esta imagen/archivo no está disponible en este dispositivo.'
              : 'Este archivo no está disponible en este dispositivo, pídele al otro usuario que te lo reenvíe.'}
          </div>
        </div>
      )
    }

    // Caso 2: Está en el dispositivo (es una imagen)
    if (attachment.type === 'image') {
      return (
        <div className="attachment-image-box" style={{ marginTop: '0.5rem', marginBottom: '0.5rem', borderRadius: '8px', overflow: 'hidden' }}>
          <img src={localData} alt={attachment.name} style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block', borderRadius: '8px' }} />
        </div>
      )
    }

    // Caso 3: Está en el dispositivo (es un documento)
    return (
      <div className="attachment-doc-box" style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '8px', marginTop: '0.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>📄</div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', fontWeight: 'bold', fontSize: '0.85rem' }}>{attachment.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{attachment.size}</div>
        </div>
        <a href={localData} download={attachment.name} style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', textDecoration: 'none' }}>
          Abrir
        </a>
      </div>
    )
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
                      onClick={() => onCopyMessage(msg.text || '')}
                      type="button"
                    >
                      <IconCopy size={14} />
                    </button>
                  </div>

                  <div className={`message-bubble ${isMatching ? 'search-active-bubble' : ''}`}>
                    {renderAttachment(msg.attachment, isMe)}
                    
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
