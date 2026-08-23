import { useState, useEffect, useRef } from 'react'
import './Chat.css'
import { INITIAL_CHATS, BOT_RESPONSES, getUserProfile, logDeviceSession, MOCK_USERS } from './mockData.js'

import ChatSidebar from './components/ChatSidebar'
import ActiveChatPanel from './components/ActiveChatPanel'
import ContactDetailsPanel from './components/ContactDetailsPanel'
import ConnectUserModal from './components/ConnectUserModal'
import ChatEmptyState from './components/ChatEmptyState'

// ============================================================================
// COMPONENTE PRINCIPAL: CHAT HOME (COORDINADOR MODULAR)
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
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const [toastMessage, setToastMessage] = useState('')
  const [presenceStatus, setPresenceStatus] = useState('online') // 'online' | 'away' | 'offline'

  // Estado para el modal de conectar con nuevo usuario
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [searchAlias, setSearchAlias] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searchedUser, setSearchedUser] = useState(null)
  const [sentRequests, setSentRequests] = useState([])

  // Solicitudes entrantes simuladas para testing
  const [incomingRequests, setIncomingRequests] = useState(() => {
    if (currentUser.username === 'rosi_master') {
      return [
        {
          id: 'req_admin',
          fromUser: MOCK_USERS[0], // adminUser
          time: 'Reciente',
          status: 'pending'
        }
      ]
    }
    return []
  })

  const messagesEndRef = useRef(null)

  // Monitoreo de Conexión y Presencia Real del Usuario
  useEffect(() => {
    logDeviceSession(currentUser.username)

    const handleOnline = () => setPresenceStatus('online')
    const handleOffline = () => setPresenceStatus('offline')
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPresenceStatus('away')
      } else {
        setPresenceStatus('online')
      }
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setPresenceStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentUser.username])

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

  // Copiar enlace directo de invitación
  const handleCopyInviteLink = () => {
    const rawHandle = currentUser.handle || '@adminUser'
    const inviteUrl = `https://nexu.app/c/${rawHandle}`

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(inviteUrl)
        .then(() => triggerToast(`Enlace copiado: ${inviteUrl}`))
        .catch(() => triggerToast(`Enlace listo: ${inviteUrl}`))
    } else {
      triggerToast(`Enlace listo: ${inviteUrl}`)
    }
  }

  // Buscar usuario por alias
  const handleSearchUser = (value) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    setSearchAlias(clean)
    setSearchError('')
    setSearchedUser(null)

    if (!clean) return

    if (clean.toLowerCase() === currentUser.username.toLowerCase()) {
      setSearchError('No puedes enviarte una solicitud a ti mismo.')
      return
    }

    const found = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === clean.toLowerCase()
    )

    if (found) {
      setSearchedUser(found)
    } else if (clean.length >= 3) {
      setSearchError('Usuario no encontrado. Prueba con @adminUser o @rosi_master.')
    }
  }

  // Enviar solicitud de conexión
  const handleSendConnectionRequest = (target) => {
    if (!target) return
    if (sentRequests.includes(target.username)) {
      triggerToast(`Ya enviaste una solicitud a ${target.handle}`)
      return
    }

    setSentRequests((prev) => [...prev, target.username])
    triggerToast(`Solicitud de conexión enviada a ${target.handle}`)
    setShowConnectModal(false)
    setSearchAlias('')
    setSearchedUser(null)
  }

  // Aceptar solicitud de conexión
  const handleAcceptRequest = (req) => {
    const partner = req.fromUser
    const newChatId = `chat_${partner.username}`

    const newChat = {
      id: newChatId,
      name: partner.name,
      handle: partner.handle,
      avatar: partner.avatar,
      isBot: false,
      status: partner.status || 'online',
      statusText: partner.statusText || 'En línea',
      unreadCount: 1,
      role: partner.role || 'Contacto Nexu',
      email: `${partner.username.toLowerCase()}@nexu.app`,
      bio: 'Conversación directa y privada cifrada punto a punto.',
      messages: [
        {
          id: `msg_init_${Date.now()}`,
          sender: 'them',
          text: `¡Hola ${currentUser.name}! Gracias por aceptar la solicitud de conexión en Nexu.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    }

    setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id))
    setChats((prev) => [newChat, ...prev.filter((c) => c.id !== newChatId)])
    setSelectedChatId(newChatId)
    setMobileView('chat')
    triggerToast(`Conexión establecida con ${partner.handle}`)
  }

  // Rechazar solicitud de conexión
  const handleRejectRequest = (reqId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId))
    triggerToast('Solicitud descartada')
  }

  // Eliminar conversación
  const handleDeleteConversation = (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
    setShowDetailsPanel(false)
    triggerToast('Conversación eliminada')
  }

  // Copiar contenido del mensaje
  const handleCopyMessage = (text) => {
    navigator.clipboard?.writeText(text)
    triggerToast('Texto copiado al portapapeles')
  }

  // Insertar snippet de código
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

  return (
    <div className="chat-app-layout">
      {/* Toast de retroalimentación rápida */}
      {toastMessage && <div className="toast-feedback">{toastMessage}</div>}

      {/* 1. Sidebar de Conversaciones */}
      <ChatSidebar
        mobileView={mobileView}
        currentUser={currentUser}
        presenceStatus={presenceStatus}
        onOpenSettings={onOpenSettings}
        onOpenConnectModal={() => setShowConnectModal(true)}
        onToggleDetailsPanel={() => setShowDetailsPanel(!showDetailsPanel)}
        showDetailsPanel={showDetailsPanel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        chatsCount={chats.length}
        incomingRequests={incomingRequests}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        filteredChats={filteredChats}
        activeChatId={activeChat?.id}
        onSelectChat={handleSelectChat}
        onCopyInviteLink={handleCopyInviteLink}
      />

      {/* 2. Ventana de Chat Activo o Estado Vacío */}
      {activeChat ? (
        <ActiveChatPanel
          activeChat={activeChat}
          mobileView={mobileView}
          isTyping={isTyping}
          showDetailsPanel={showDetailsPanel}
          inputText={inputText}
          onInputTextChange={setInputText}
          onSendMessage={handleSendMessage}
          onBackToList={() => setMobileView('list')}
          onToggleDetails={() => setShowDetailsPanel(!showDetailsPanel)}
          onCopyMessage={handleCopyMessage}
          onInsertCodeSnippet={handleInsertCodeSnippet}
          onTriggerToast={triggerToast}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <ChatEmptyState
          mobileView={mobileView}
          onBackToList={() => setMobileView('list')}
        />
      )}

      {/* 3. Panel Lateral Derecho de Información de Contacto */}
      {showDetailsPanel && activeChat && (
        <ContactDetailsPanel
          activeChat={activeChat}
          onClose={() => setShowDetailsPanel(false)}
          onClearChat={handleClearCurrentChat}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      {/* 4. Modal para Conectar con Nuevo Usuario */}
      <ConnectUserModal
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false)
          setSearchAlias('')
          setSearchedUser(null)
          setSearchError('')
        }}
        searchAlias={searchAlias}
        onSearchChange={handleSearchUser}
        searchError={searchError}
        searchedUser={searchedUser}
        sentRequests={sentRequests}
        onSendRequest={handleSendConnectionRequest}
      />
    </div>
  )
}

export default ChatHome
