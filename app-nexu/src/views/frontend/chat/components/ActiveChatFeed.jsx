import { useState, useRef, useEffect } from 'react'
import { IconCheck, IconCheckCheck, IconSearch, IconCopy, IconCalendar } from '../../../../components/icons/Icons'
import ActiveChatAttachment from './ActiveChatAttachment'

function ActiveChatFeed({
  activeChat,
  searchQuery,
  matchCount,
  isTyping,
  messagesEndRef,
  onCopyMessage
}) {
  const containerRef = useRef(null)
  const scrollTimeoutRef = useRef(null)
  const [stickyDate, setStickyDate] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)

  // Limpiar indicador al cambiar de conversación activa
  useEffect(() => {
    setStickyDate(null)
    setIsScrolling(false)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
  }, [activeChat?.id])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    setIsScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Detectar el mensaje visible en la parte superior del contenedor
    const containerRect = container.getBoundingClientRect()
    const containerTopThreshold = containerRect.top + 45
    const messageRows = container.querySelectorAll('.message-row')

    let topDate = null
    for (const row of messageRows) {
      const rect = row.getBoundingClientRect()
      if (rect.bottom >= containerTopThreshold) {
        const isOld = row.getAttribute('data-is-old') === 'true'
        const label = row.getAttribute('data-date-label')
        if (isOld && label) {
          topDate = label
        }
        break
      }
    }

    setStickyDate(topDate)

    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false)
    }, 1600)
  }
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

  const getMessageDateContext = (msg) => {
    if (msg.date) {
      const lower = msg.date.toLowerCase()
      if (lower.includes('hoy')) return { label: 'Hoy', isToday: true, isOld: false }
      if (lower.includes('ayer')) return { label: 'Ayer', isToday: false, isOld: true }
      return { label: msg.date, isToday: false, isOld: true }
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
      const now = new Date()
      // Comparar por día calendario (sin horas)
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
      const msgMidnight = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate()).getTime()
      const diffDays = Math.round((todayMidnight - msgMidnight) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        return { label: 'Hoy', isToday: true, isOld: false }
      }
      if (diffDays === 1) {
        return { label: 'Ayer', isToday: false, isOld: true }
      }
      if (diffDays > 1 && diffDays < 7) {
        // Día de la semana (Lunes, Martes, Miércoles...)
        const weekday = msgDate.toLocaleDateString('es-ES', { weekday: 'long' })
        const capitalized = weekday.charAt(0).toUpperCase() + weekday.slice(1)
        return { label: capitalized, isToday: false, isOld: true }
      }

      // Más de una semana: fecha completa (ej. 15 sep, 12 may 2025)
      const isSameYear = msgDate.getFullYear() === now.getFullYear()
      const fullDate = msgDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: isSameYear ? undefined : 'numeric'
      })
      const capitalized = fullDate.charAt(0).toUpperCase() + fullDate.slice(1)
      return { label: capitalized, isToday: false, isOld: true }
    }

    return { label: 'Hoy', isToday: true, isOld: false }
  }

  return (
    <div className="messages-container" ref={containerRef} onScroll={handleScroll}>
      {/* Indicador flotante dinámico de fecha al desplazarse en mensajes antiguos */}
      {stickyDate && (
        <div className={`sticky-date-indicator ${isScrolling ? 'visible' : ''}`}>
          <span>
            <IconCalendar size={13} />
            {stickyDate}
          </span>
        </div>
      )}

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

          const currentDateContext = getMessageDateContext(msg)
          const prevMessage = activeChat.messages[index - 1]
          const prevDateContext = prevMessage ? getMessageDateContext(prevMessage) : null
          const showDateDivider = currentDateContext.label !== prevDateContext?.label

          return (
            <div key={msg.id || `msg-${index}`} style={{ display: 'contents' }}>
              {showDateDivider && (
                <div className="date-divider">
                  <span>{currentDateContext.label}</span>
                </div>
              )}

              <div
                className={`message-row ${isMe ? 'me outgoing' : 'them incoming'} ${
                  isMatching ? 'search-highlight-row' : ''
                }`}
                data-date-label={currentDateContext.label}
                data-is-old={currentDateContext.isOld ? 'true' : 'false'}
              >
                {!isMe && (
                  <div
                    className={`msg-avatar-tiny ${activeChat?.isBot ? 'system-avatar' : ''}`}
                    title={activeChat?.name || 'Contacto'}
                  >
                    {activeChat?.avatarUrl ? (
                      <img src={activeChat.avatarUrl} alt={activeChat.name || 'Avatar'} />
                    ) : (
                      activeChat?.avatar || '?'
                    )}
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
