import { useState, useRef, useEffect, useMemo, useCallback, memo } from 'react'
import {
  IconArrowLeft,
  IconInfo,
  IconCopy,
  IconCheck,
  IconCheckCheck,
  IconImage,
  IconPaperclip,
  IconCode,
  IconSend,
  IconSearch,
  IconX
} from '../../../../components/icons/Icons'

function ActiveChatPanel({
  activeChat,
  mobileView,
  isTyping,
  showDetailsPanel,
  inputText,
  onInputTextChange,
  onSendMessage,
  onBackToList,
  onToggleDetails,
  onCopyMessage,
  onInsertCodeSnippet,
  onTriggerToast,
  messagesEndRef
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  // Enfocar input automáticamente al abrir el buscador interno
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80)
    }
  }, [isSearchOpen])

  // Limpiar búsqueda si cambia el chat activo
  useEffect(() => {
    setSearchQuery('')
  }, [activeChat?.id])

  if (!activeChat) return null

  // Calcular número de coincidencias en la conversación activa de forma memoizada
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0
    const query = searchQuery.toLowerCase().trim()
    return activeChat.messages.filter((m) => m.text.toLowerCase().includes(query)).length
  }, [searchQuery, activeChat?.messages])

  // Renderizar icono de estado del mensaje
  const renderStatusIcon = useCallback((status) => {
    if (status === 'read') {
      return <span className="msg-status-icon read" title="Leído"><IconCheckCheck size={15} /></span>
    }
    if (status === 'delivered') {
      return <span className="msg-status-icon delivered" title="Entregado"><IconCheckCheck size={15} /></span>
    }
    return <span className="msg-status-icon sent" title="Enviado"><IconCheck size={14} /></span>
  }, [])

  // Función para resaltar las coincidencias de texto
  const renderHighlightedText = useCallback((text, query) => {
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
  }, [])

  return (
    <main className={`chat-main-panel ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
      {/* 1. Cabecera del Chat Activo */}
      <header className="active-chat-header">
        <div className="chat-header-user">
          <button
            className="btn-mobile-back"
            onClick={onBackToList}
            title="Volver a lista"
          >
            <IconArrowLeft size={18} />
          </button>

          <div className="avatar-wrapper">
            <div className={`avatar-badge ${activeChat.isBot ? 'system-avatar' : ''}`}>
              {activeChat.avatar}
            </div>
            <span className={`user-status-dot ${activeChat.status}`}></span>
          </div>

          <div className="chat-header-title-box">
            <h3 className="chat-header-title">{activeChat.name}</h3>
            <div className={`chat-header-status ${isTyping ? 'typing' : ''}`}>
              {isTyping ? (
                <span>Generando respuesta en tiempo real...</span>
              ) : (
                <>
                  <span className={`status-dot-sm ${activeChat.status}`}></span>
                  <span>{activeChat.statusText}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="chat-header-actions">
          {/* Botón Buscador en Conversación Activa */}
          <button
            className={`btn-chat-action ${isSearchOpen ? 'active' : ''}`}
            onClick={() => {
              setIsSearchOpen((prev) => !prev)
              if (isSearchOpen) setSearchQuery('')
            }}
            title="Buscar mensajes en esta conversación"
            type="button"
          >
            <IconSearch size={15} />
            <span>Buscar</span>
          </button>

          {/* Botón Detalles del Contacto */}
          <button
            className={`btn-chat-action ${showDetailsPanel ? 'active' : ''}`}
            onClick={onToggleDetails}
            title="Ver detalles del contacto"
            type="button"
          >
            <IconInfo size={16} />
            <span>Detalles</span>
          </button>
        </div>
      </header>

      {/* 1.1 Barra Desplegable de Búsqueda Interna en la Conversación */}
      {isSearchOpen && (
        <div className="in-chat-search-bar">
          <div className="in-chat-search-input-wrapper">
            <IconSearch size={14} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar en esta conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="btn-clear-search-inchat"
                onClick={() => setSearchQuery('')}
                title="Limpiar término"
              >
                <IconX size={12} />
              </button>
            )}
          </div>

          <div className="in-chat-search-meta">
            {searchQuery.trim() ? (
              <span className={`in-chat-match-badge ${matchCount > 0 ? 'has-matches' : 'no-matches'}`}>
                {matchCount > 0
                  ? `${matchCount} ${matchCount === 1 ? 'coincidencia' : 'coincidencias'}`
                  : 'Sin coincidencias'}
              </span>
            ) : (
              <span className="in-chat-search-hint">Escribe para buscar</span>
            )}

            <button
              type="button"
              className="btn-close-inchat-search"
              onClick={() => {
                setIsSearchOpen(false)
                setSearchQuery('')
              }}
              title="Cerrar buscador (Esc)"
            >
              <IconX size={14} />
            </button>
          </div>
        </div>
      )}

      {/* 2. Feed de Mensajes */}
      <div className="messages-container">
        <div className="date-divider">
          <span>Mensajería Directa 1 a 1</span>
        </div>

        {/* Banner si no hay coincidencias en la búsqueda interna */}
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
          activeChat.messages.map((msg) => {
            const isMe = msg.sender === 'me'
            const isMatching =
              searchQuery.trim() &&
              msg.text.toLowerCase().includes(searchQuery.toLowerCase().trim())

            return (
              <div
                key={msg.id}
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

      {/* 3. Barra de Entrada (Input Footer) */}
      <footer className="chat-input-footer">
        <div className="chat-toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="btn-tool-icon"
              title="Adjuntar imagen"
              onClick={() => onTriggerToast('Simulación: Adjuntar imagen disponible')}
            >
              <IconImage size={16} />
            </button>
            <button
              type="button"
              className="btn-tool-icon"
              title="Adjuntar archivo"
              onClick={() => onTriggerToast('Simulación: Adjuntar documento disponible')}
            >
              <IconPaperclip size={16} />
            </button>
            <button
              type="button"
              className="btn-tool-icon"
              title="Insertar código"
              onClick={onInsertCodeSnippet}
            >
              <IconCode size={16} />
            </button>
          </div>

          <span className="toolbar-hint">Presiona Enter para enviar</span>
        </div>

        <form className="input-controls-row" onSubmit={onSendMessage}>
          <input
            type="text"
            className="message-text-input"
            placeholder={`Escribe un mensaje para ${activeChat.name}...`}
            value={inputText}
            onChange={(e) => onInputTextChange(e.target.value)}
          />

          <button
            type="submit"
            className="btn-send-message"
            disabled={!inputText.trim()}
            title="Enviar mensaje"
          >
            <IconSend size={17} />
          </button>
        </form>
      </footer>
    </main>
  )
}

export default memo(ActiveChatPanel)
