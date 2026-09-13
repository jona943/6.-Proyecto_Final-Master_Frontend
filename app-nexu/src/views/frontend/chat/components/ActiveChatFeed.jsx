import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { IconCheck, IconCheckCheck, IconSearch, IconCopy, IconCalendar, IconShield } from '../../../../components/icons/Icons'
import ActiveChatAttachment from './ActiveChatAttachment'

const MESSAGES_PAGE_SIZE = 30

const isSystemMessage = (m) =>
  m.sender === 'system' ||
  m.isSystem === true ||
  (typeof m.id === 'string' && m.id.includes('accepted')) ||
  (typeof m.text === 'string' && (
    m.text.includes('solicitud de conexión') ||
    m.text.includes('solicitud de conexion') ||
    m.text.includes('solicitud de conexi')
  ))

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
  const prevChatIdRef = useRef(activeChat?.id)
  const prevMessagesCountRef = useRef(activeChat?.messages?.length || 0)

  const [stickyDate, setStickyDate] = useState(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [visibleCount, setVisibleCount] = useState(MESSAGES_PAGE_SIZE)

  const allMessages = Array.isArray(activeChat?.messages) ? activeChat.messages : []
  const systemMessages = allMessages.filter(isSystemMessage)
  const userMessages = allMessages.filter((m) => !isSystemMessage(m))

  const totalUserCount = userMessages.length
  const isSearching = Boolean(searchQuery && searchQuery.trim().length > 0)
  const hasOlderMessages = !isSearching && totalUserCount > visibleCount
  const olderCount = totalUserCount - visibleCount
  const messagesToRender = isSearching ? userMessages : userMessages.slice(-visibleCount)

  // 1. Al cambiar de conversacion activa: resetear ventana y salto instantaneo a la base
  useLayoutEffect(() => {
    if (activeChat?.id !== prevChatIdRef.current) {
      prevChatIdRef.current = activeChat?.id
      prevMessagesCountRef.current = totalCount
      setVisibleCount(MESSAGES_PAGE_SIZE)
      setStickyDate(null)
      setIsScrolling(false)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Salto instantaneo al final sin animacion de barrido
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChat?.id])

  // 2. Desplazamiento suave solo al recibir o enviar un nuevo mensaje en el mismo chat activo
  useEffect(() => {
    const currentCount = activeChat?.messages?.length || 0
    if (activeChat?.id === prevChatIdRef.current) {
      if (currentCount > prevMessagesCountRef.current) {
        messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
    prevMessagesCountRef.current = currentCount
  }, [activeChat?.messages?.length, activeChat?.id, messagesEndRef])

  // 3. Desplazamiento suave al activarse el indicador de escritura si se esta cerca del final
  useEffect(() => {
    if (isTyping && containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150
      if (isNearBottom) {
        messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [isTyping, messagesEndRef])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleLoadOlderMessages = () => {
    const container = containerRef.current
    if (!container) return

    const prevScrollHeight = container.scrollHeight
    const prevScrollTop = container.scrollTop

    setVisibleCount((prev) => {
      const nextCount = Math.min(prev + MESSAGES_PAGE_SIZE, totalUserCount)
      requestAnimationFrame(() => {
        if (containerRef.current) {
          const heightDiff = containerRef.current.scrollHeight - prevScrollHeight
          containerRef.current.scrollTop = prevScrollTop + heightDiff
        }
      })
      return nextCount
    })
  }

  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    setIsScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Carga progresiva automatica al acercarse al extremo superior
    if (container.scrollTop < 60 && hasOlderMessages) {
      handleLoadOlderMessages()
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

      {hasOlderMessages && (
        <div className="load-older-messages-wrapper">
          <button
            type="button"
            className="btn-load-older-messages"
            onClick={handleLoadOlderMessages}
          >
            Cargar mensajes anteriores ({olderCount})
          </button>
        </div>
      )}

      {/* Notificación de Sistema en la parte superior de la conversación */}
      {systemMessages.length > 0 && (
        <div className="system-notification-container">
          {systemMessages.map((sysMsg) => (
            <div key={sysMsg.id || 'sys_notice'} className="system-notification-card">
              <div className="system-notification-icon-box">
                <IconShield size={16} />
              </div>
              <div className="system-notification-body">
                <span className="system-notification-badge">Notificación del sistema</span>
                <p className="system-notification-text">
                  {renderHighlightedText(sysMsg.text, searchQuery)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {messagesToRender.length === 0 ? (
        <div className="empty-search-msg">
          <p>No hay mensajes en esta conversación. Envía el primer mensaje.</p>
        </div>
      ) : (
        messagesToRender.map((msg, index) => {
          const isMe = msg.sender === 'me'
          const isMatching =
            searchQuery.trim() &&
            msg.text && msg.text.toLowerCase().includes(searchQuery.toLowerCase().trim())

          const currentDateContext = getMessageDateContext(msg)
          const prevMessage = messagesToRender[index - 1]
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
