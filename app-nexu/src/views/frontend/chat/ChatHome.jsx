import { useState, useEffect, useRef } from 'react'
import './Chat.css'
import { CURRENT_USER, INITIAL_CHATS, BOT_RESPONSES, getUserProfile } from './mockData.js'

// ============================================================================
// ICONOS SVG VECTORIALES NATIVOS (Zero-Bloat · 100% SVG · Cero Emojis)
// ============================================================================
const IconSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
)

const IconSend = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
)

const IconPaperclip = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
)

const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
)

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
)

const IconCheckCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 7 17l-5-5"></path>
    <path d="m22 10-7.5 7.5L13 16"></path>
  </svg>
)

const IconInfo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
)

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
)

const IconCode = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"></polyline>
    <polyline points="8 6 2 12 8 18"></polyline>
  </svg>
)

const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
    <circle cx="8.5" cy="8.5" r="1.5"></circle>
    <polyline points="21 15 16 10 5 21"></polyline>
  </svg>
)

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
)

const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
    <polyline points="22,6 12,13 2,6"></polyline>
  </svg>
)

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
)

const IconMessageSquare = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)

const IconMenu = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
)

// ============================================================================
// COMPONENTE PRINCIPAL: CHAT HOME
// ============================================================================
function ChatHome({ onOpenSettings, currentUserHandle }) {
  const currentUser = getUserProfile(currentUserHandle)
  const [chats, setChats] = useState(INITIAL_CHATS)
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'online'
  const [isTyping, setIsTyping] = useState(false)
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [mobileView, setMobileView] = useState('chat') // 'list' | 'chat'
  const [toastMessage, setToastMessage] = useState('')

  const messagesEndRef = useRef(null)

  // Obtener conversación activa
  const activeChat = chats.find((c) => c.id === selectedChatId) || null

  // Auto-scroll al final del contenedor de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, isTyping])

  // Mostrar mensaje tipo toast temporal
  const triggerToast = (text) => {
    setToastMessage(text)
    setTimeout(() => {
      setToastMessage('')
    }, 2000)
  }

  // Filtrado de contactos
  const filteredChats = chats.filter((chat) => {
    const matchesSearch =
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.handle.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (activeFilter === 'unread') return chat.unreadCount > 0
    if (activeFilter === 'online') return chat.status === 'online'
    return true
  })

  // Seleccionar conversación
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId)
    setMobileView('chat')

    setChats((prev) =>
      prev.map((c) =>
        c.id === chatId ? { ...c, unreadCount: 0 } : c
      )
    )
  }

  // Enviar mensaje
  const handleSendMessage = (e) => {
    if (e) e.preventDefault()
    const trimmed = inputText.trim()
    if (!trimmed || !activeChat) return

    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: 'me',
      text: trimmed,
      time: timeFormatted,
      status: 'delivered'
    }

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChat.id) {
          return {
            ...c,
            messages: [...c.messages, newMessage]
          }
        }
        return c
      })
    )

    setInputText('')

    // Simular respuesta
    simulateAutoReply(activeChat.id, trimmed)
  }

  // Simulación de auto-respuesta
  const simulateAutoReply = (chatId, userMessage) => {
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)

      const now = new Date()
      const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

      let replyContent = ''
      const targetChat = chats.find((c) => c.id === chatId)

      if (targetChat?.isBot) {
        const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length)
        replyContent = BOT_RESPONSES[randomIndex]
      } else {
        replyContent = `Recibido: "${userMessage}". Respuesta registrada en el hilo.`
      }

      const botMessage = {
        id: `reply_${Date.now()}`,
        sender: 'them',
        text: replyContent,
        time: timeFormatted,
        status: 'read'
      }

      setChats((prev) =>
        prev.map((c) => {
          if (c.id === chatId) {
            const updatedHistory = c.messages.map((m) =>
              m.sender === 'me' ? { ...m, status: 'read' } : m
            )
            return {
              ...c,
              messages: [...updatedHistory, botMessage]
            }
          }
          return c
        })
      )
    }, 1200)
  }

  // Copiar contenido del mensaje al portapapeles
  const handleCopyMessage = (text) => {
    navigator.clipboard?.writeText(text)
    triggerToast('Texto copiado al portapapeles')
  }

  // Insertar snippet de código rápido
  const handleInsertCodeSnippet = () => {
    setInputText((prev) => prev + 'const nexu = true;')
  }

  // Limpiar conversación actual
  const handleClearCurrentChat = () => {
    if (!activeChat) return
    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, messages: [] } : c))
    )
    triggerToast('Historial de mensajes reiniciado')
  }

  // Renderizar icono de estado del mensaje
  const renderStatusIcon = (status) => {
    if (status === 'read') {
      return <span className="msg-status-icon read" title="Leído"><IconCheckCheck /></span>
    }
    if (status === 'delivered') {
      return <span className="msg-status-icon delivered" title="Entregado"><IconCheckCheck /></span>
    }
    return <span className="msg-status-icon sent" title="Enviado"><IconCheck /></span>
  }

  return (
    <div className="chat-app-layout">
      {/* Toast no intrusivo */}
      {toastMessage && <div className="toast-feedback">{toastMessage}</div>}

      {/* =====================================================================
          1. SIDEBAR DE CONVERSACIONES
          ===================================================================== */}
      <aside className={`chat-sidebar ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>
        {/* 1.1 Encabezado del Usuario Activo */}
        <header className="chat-user-header">
          <div
            className="user-profile-summary"
            onClick={onOpenSettings}
            style={{ cursor: onOpenSettings ? 'pointer' : 'default' }}
            title={onOpenSettings ? 'Ir a Perfil y Configuración' : undefined}
          >
            <div className="avatar-wrapper">
              <div className="avatar-badge">{currentUser.avatar}</div>
              <span className={`user-status-dot ${currentUser.status}`}></span>
            </div>
            <div className="user-info-meta">
              <div className="user-name-row">
                <span className="user-display-name">{currentUser.name}</span>
                <span className="tag-active-pill">TÚ</span>
              </div>
              <span className="user-handle-sub">{currentUser.handle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <button
              className="btn-icon-subtle"
              title="Ajustes del chat (3 rayitas)"
              onClick={onOpenSettings}
              type="button"
            >
              <IconMenu />
            </button>
            <button
              className="btn-icon-subtle"
              title="Detalles de usuario"
              onClick={() => setShowDetailsPanel(!showDetailsPanel)}
              type="button"
            >
              <IconInfo />
            </button>
          </div>
        </header>

        {/* 1.2 Buscador y Filtros */}
        <div className="chat-search-bar-box">
          <div className="search-input-wrapper">
            <IconSearch />
            <input
              type="text"
              placeholder="Buscar contactos o canales..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-pills">
            <button
              className={`filter-pill-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              Todos ({chats.length})
            </button>
            <button
              className={`filter-pill-btn ${activeFilter === 'unread' ? 'active' : ''}`}
              onClick={() => setActiveFilter('unread')}
            >
              No leídos
            </button>
            <button
              className={`filter-pill-btn ${activeFilter === 'online' ? 'active' : ''}`}
              onClick={() => setActiveFilter('online')}
            >
              En línea
            </button>
          </div>
        </div>

        {/* 1.3 Lista de Conversaciones */}
        <div className="conversations-feed">
          {filteredChats.length === 0 ? (
            <div className="empty-search-msg">
              <p>No se encontraron resultados</p>
            </div>
          ) : (
            filteredChats.map((chat) => {
              const lastMsg = chat.messages[chat.messages.length - 1]
              const isSelected = chat.id === activeChat?.id

              return (
                <button
                  key={chat.id}
                  className={`conversation-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
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
                          <em>Canal vacío</em>
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

      {/* =====================================================================
          2. VENTANA PRINCIPAL DE CHAT ACTIVO
          ===================================================================== */}
      {activeChat ? (
        <main className={`chat-main-panel ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
          {/* 2.1 Cabecera del Chat Activo */}
          <header className="active-chat-header">
            <div className="chat-header-user">
              <button
                className="btn-mobile-back"
                onClick={() => setMobileView('list')}
                title="Volver a lista"
              >
                <IconArrowLeft />
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
              <button
                className={`btn-chat-action ${showDetailsPanel ? 'active' : ''}`}
                onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                title="Ver detalles del contacto"
              >
                <IconInfo />
                <span>Detalles</span>
              </button>
            </div>
          </header>

          {/* 2.2 Feed de Mensajes */}
          <div className="messages-container">
            <div className="date-divider">
              <span>Canal Directo v1.0</span>
            </div>

            {activeChat.messages.length === 0 ? (
              <div className="empty-search-msg">
                <p>No hay mensajes en este canal. Envía el primer mensaje.</p>
              </div>
            ) : (
              activeChat.messages.map((msg) => {
                const isMe = msg.sender === 'me'
                return (
                  <div key={msg.id} className={`message-row ${isMe ? 'me' : 'them'}`}>
                    {!isMe && (
                      <div className="msg-avatar-tiny">
                        {activeChat.avatar}
                      </div>
                    )}

                    <div className="message-bubble-wrapper">
                      {/* Acciones flotantes al pasar el cursor */}
                      <div className="message-actions-overlay">
                        <button
                          className="btn-msg-hover"
                          title="Copiar texto"
                          onClick={() => handleCopyMessage(msg.text)}
                        >
                          <IconCopy />
                        </button>
                      </div>

                      <div className="message-bubble">
                        <p className="message-text">{msg.text}</p>
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

            {/* Animación de "Escribiendo..." */}
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

          {/* 2.3 Barra de Entrada (Input Footer) */}
          <footer className="chat-input-footer">
            {/* Barra de herramientas vectoriales */}
            <div className="chat-toolbar">
              <div className="toolbar-group">
                <button
                  type="button"
                  className="btn-tool-icon"
                  title="Adjuntar imagen"
                  onClick={() => triggerToast('Simulación: Adjuntar imagen disponible')}
                >
                  <IconImage />
                </button>
                <button
                  type="button"
                  className="btn-tool-icon"
                  title="Adjuntar archivo"
                  onClick={() => triggerToast('Simulación: Adjuntar documento disponible')}
                >
                  <IconPaperclip />
                </button>
                <button
                  type="button"
                  className="btn-tool-icon"
                  title="Insertar código"
                  onClick={handleInsertCodeSnippet}
                >
                  <IconCode />
                </button>
              </div>

              <span className="toolbar-hint">Presiona Enter para enviar</span>
            </div>

            <form className="input-controls-row" onSubmit={handleSendMessage}>
              <input
                type="text"
                className="message-text-input"
                placeholder={`Escribe un mensaje para ${activeChat.name}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <button
                type="submit"
                className="btn-send-message"
                disabled={!inputText.trim()}
                title="Enviar mensaje"
              >
                <IconSend />
              </button>
            </form>
          </footer>
        </main>
      ) : (
        /* 3. Estado Vacío */
        <div className="chat-empty-state">
          <div className="empty-state-badge">
            <IconMessageSquare />
          </div>
          <h3>Selecciona una conversación</h3>
          <p>Elige un contacto de la barra lateral para comenzar a interactuar en tiempo real.</p>
        </div>
      )}

      {/* =====================================================================
          3. PANEL LATERAL DERECHO (DETALLES DEL CONTACTO)
          ===================================================================== */}
      {showDetailsPanel && activeChat && (
        <aside className="chat-details-panel">
          <header className="details-header">
            <h4>Información de Contacto</h4>
            <button
              className="btn-icon-subtle"
              onClick={() => setShowDetailsPanel(false)}
              title="Cerrar panel"
            >
              <IconX />
            </button>
          </header>

          <div className="details-profile-card">
            <div className={`details-avatar-lg ${activeChat.isBot ? 'system-avatar' : ''}`}>
              {activeChat.avatar}
            </div>
            <h3 className="details-name">{activeChat.name}</h3>
            <span className="details-handle">{activeChat.handle}</span>
            <span className="details-role-pill">{activeChat.role}</span>
          </div>

          <div className="details-section">
            <span className="details-section-title">Detalles de Cuenta</span>
            <div className="details-info-row">
              <IconUser />
              <div className="details-info-text">
                <strong>Nombre</strong>
                <span>{activeChat.name}</span>
              </div>
            </div>
            <div className="details-info-row">
              <IconMail />
              <div className="details-info-text">
                <strong>Correo</strong>
                <span>{activeChat.email}</span>
              </div>
            </div>
          </div>

          <div className="details-section">
            <span className="details-section-title">Descripción / Bio</span>
            <p className="conv-preview" style={{ whiteSpace: 'normal', lineHeight: '1.4' }}>
              {activeChat.bio || 'Usuario miembro del equipo de desarrollo de Nexu.'}
            </p>
          </div>

          <div className="details-section">
            <span className="details-section-title">Seguridad y Cifrado</span>
            <div className="security-box">
              <IconShield />
              <p>Conexión directa 1 a 1 cliente-servidor con confirmaciones de entrega verificadas.</p>
            </div>
          </div>

          <div className="details-section" style={{ marginTop: 'auto', borderBottom: 'none' }}>
            <button
              className="btn-danger-action"
              onClick={handleClearCurrentChat}
              title="Limpiar mensajes"
            >
              <IconTrash />
              <span>Limpiar Historial de Chat</span>
            </button>
          </div>
        </aside>
      )}
    </div>
  )
}

export default ChatHome
