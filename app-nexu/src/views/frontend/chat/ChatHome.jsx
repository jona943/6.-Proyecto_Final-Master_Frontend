import { useState, useEffect, useRef } from 'react'
import './Chat.css'
import { useAuth } from '../../../context/AuthContext'
import { useChat } from '../../../context/ChatContext'
import { chatService } from '../../../services/chatService'
import { sanitizeAlias } from '../../../utils/validators'
import { formatHandle } from '../../../utils/formatters'

import ChatSidebar from './components/ChatSidebar'
import ActiveChatPanel from './components/ActiveChatPanel'
import ContactDetailsPanel from './components/ContactDetailsPanel'
import ConnectUserModal from './components/ConnectUserModal'
import ChatEmptyState from './components/ChatEmptyState'

// ============================================================================
// COMPONENTE PRINCIPAL: CHAT HOME (COORDINADOR MODULAR + CONTEXT + UTILS)
// ============================================================================
function ChatHome({ onOpenSettings }) {
  const { user } = useAuth()
  const {
    chats,
    activeChat,
    selectChat,
    sendMessage,
    sendRequest,
    isTyping,
    presenceStatus,
    incomingRequests,
    acceptRequest,
    rejectRequest,
    deleteConversation,
    clearCurrentChat
  } = useChat()

  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all') // 'all' | 'unread' | 'online'
  const [showDetailsPanel, setShowDetailsPanel] = useState(false)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const [toastMessage, setToastMessage] = useState('')
  const [customPresence, setCustomPresence] = useState(presenceStatus || 'online')

  // Estado para el modal de conectar con nuevo usuario
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [searchAlias, setSearchAlias] = useState('')
  const [searchError, setSearchError] = useState('')
  const [searchedUser, setSearchedUser] = useState(null)
  const [sentRequests, setSentRequests] = useState([])

  const messagesEndRef = useRef(null)

  // Auto-scroll al final del contenedor de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, isTyping])

  // Toast temporal
  const triggerToast = (text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(''), 2200)
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

  // Seleccionar chat
  const handleSelectChat = (chatId) => {
    selectChat(chatId)
    setMobileView('chat')
  }

  // Enviar mensaje
  const handleSendMessage = (e) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || !activeChat) return

    sendMessage(inputText)
    setInputText('')
  }

  // Cambiar presencia de forma interactiva
  const handleSelectPresence = (newStatus) => {
    setCustomPresence(newStatus)
    const labels = {
      online: 'En línea',
      away: 'Ausente',
      dnd: 'No molestar'
    }
    triggerToast(`Estado actualizado: ${labels[newStatus] || newStatus}`)
  }

  // Copiar enlace de invitación con formateador
  const handleCopyInviteLink = () => {
    const handle = formatHandle(user?.username || 'adminUser')
    const inviteUrl = `https://nexu.app/c/${handle.replace(/^@/, '')}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl)
        .then(() => triggerToast(`Enlace copiado: ${inviteUrl}`))
        .catch(() => triggerToast(`Enlace listo: ${inviteUrl}`))
    } else {
      triggerToast(`Enlace listo: ${inviteUrl}`)
    }
  }

  // Búsqueda de usuario conectando con MongoDB Atlas y la API REST
  const handleSearchUser = async (val) => {
    const clean = sanitizeAlias(val)
    setSearchAlias(clean)
    if (!clean) {
      setSearchedUser(null)
      setSearchError('')
      return
    }
    const { user: found, error } = await chatService.searchUser(clean, user?.username || 'adminUser')
    setSearchedUser(found)
    setSearchError(error)
  }

  // Enviar solicitud de conexión
  const handleSendConnectionRequest = (target) => {
    if (!target) return
    sendRequest(target)
    setSentRequests((prev) => [...prev, target.username])
    triggerToast(`Solicitud de conexión enviada a ${target.handle}`)
    setShowConnectModal(false)
    setSearchAlias('')
    setSearchedUser(null)
    setMobileView('chat')
  }

  // Aceptar solicitud
  const handleAcceptRequest = (req) => {
    acceptRequest(req)
    setMobileView('chat')
    triggerToast(`Conexión establecida con ${req.fromUser.handle}`)
  }

  // Rechazar solicitud
  const handleRejectRequest = (reqId) => {
    rejectRequest(reqId)
    triggerToast('Solicitud descartada')
  }

  // Eliminar conversación
  const handleDeleteConversation = (chatId) => {
    deleteConversation(chatId)
    setShowDetailsPanel(false)
    triggerToast('Conversación eliminada')
  }

  // Copiar texto
  const handleCopyMessage = (text) => {
    navigator.clipboard?.writeText(text)
    triggerToast('Texto copiado al portapapeles')
  }

  return (
    <div className="chat-app-layout">
      {toastMessage && <div className="toast-feedback">{toastMessage}</div>}

      {/* 1. Sidebar */}
      <ChatSidebar
        mobileView={mobileView}
        currentUser={{
          name: user?.displayName || 'Usuario',
          handle: formatHandle(user?.username || 'adminUser'),
          avatar: user?.avatarType ? undefined : 'NX',
          avatarType: user?.avatarType || 'male'
        }}
        presenceStatus={customPresence || presenceStatus}
        onSelectPresence={handleSelectPresence}
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

      {/* 2. Panel de Chat Activo o Estado Vacío */}
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
          onInsertCodeSnippet={() => setInputText((prev) => prev + 'const nexu = true;')}
          onTriggerToast={triggerToast}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <ChatEmptyState
          mobileView={mobileView}
          onBackToList={() => setMobileView('list')}
        />
      )}

      {/* 3. Panel de Detalles */}
      {showDetailsPanel && activeChat && (
        <ContactDetailsPanel
          activeChat={activeChat}
          onClose={() => setShowDetailsPanel(false)}
          onClearChat={() => {
            clearCurrentChat()
            triggerToast('Historial reiniciado')
          }}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      {/* 4. Modal Conectar */}
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
