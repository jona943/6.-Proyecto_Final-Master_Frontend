import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import './Chat.css'
import { useAuth } from '../../../context/AuthContext'
import { useChat } from '../../../context/ChatContext'
import { chatService } from '../../../services/chatService'
import { sanitizeAlias, validateConnectionAlias } from '../../../utils/validators'
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

  // Toast temporal (memoizado)
  const triggerToast = useCallback((text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(''), 2200)
  }, [])

  // 1. Filtrado de contactos memoizado (evita recálculos al teclear en el input)
  const filteredChats = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    return chats.filter((chat) => {
      const matchesSearch =
        !query ||
        chat.name.toLowerCase().includes(query) ||
        chat.handle.toLowerCase().includes(query)

      if (!matchesSearch) return false
      if (activeFilter === 'unread') return chat.unreadCount > 0
      if (activeFilter === 'online') return chat.status === 'online'
      return true
    })
  }, [chats, searchQuery, activeFilter])

  // 2. Objeto de usuario actual memoizado (estabilidad de referencia para React.memo)
  const currentUser = useMemo(() => ({
    name: user?.displayName || 'Usuario',
    handle: formatHandle(user?.username || 'adminUser'),
    avatar: user?.avatarType ? undefined : 'NX',
    avatarType: user?.avatarType || 'male'
  }), [user?.displayName, user?.username, user?.avatarType])

  // 3. Handlers de acción memoizados con useCallback
  const handleSelectChat = useCallback((chatId) => {
    selectChat(chatId)
    setMobileView('chat')
  }, [selectChat])

  const handleSendMessage = useCallback((e) => {
    if (e) e.preventDefault()
    if (!inputText.trim() || !activeChat) return

    sendMessage(inputText)
    setInputText('')
  }, [inputText, activeChat, sendMessage])

  const handleSelectPresence = useCallback((newStatus) => {
    setCustomPresence(newStatus)
    const labels = {
      online: 'En línea',
      away: 'Ausente',
      dnd: 'No molestar'
    }
    triggerToast(`Estado actualizado: ${labels[newStatus] || newStatus}`)
  }, [triggerToast])

  const handleCopyInviteLink = useCallback(() => {
    const handle = formatHandle(user?.username || 'adminUser')
    const inviteUrl = `https://nexu.app/c/${handle.replace(/^@/, '')}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(inviteUrl)
        .then(() => triggerToast(`Enlace copiado: ${inviteUrl}`))
        .catch(() => triggerToast(`Enlace listo: ${inviteUrl}`))
    } else {
      triggerToast(`Enlace listo: ${inviteUrl}`)
    }
  }, [user?.username, triggerToast])

  const handleSearchUser = useCallback((val) => {
    const clean = sanitizeAlias(val)
    setSearchAlias(clean)

    if (!clean) {
      setSearchedUser(null)
      setSearchError('')
      return
    }

    const { isValid, cleanAlias, error: zodError } = validateConnectionAlias(clean)

    if (!isValid && clean.length >= 3) {
      setSearchedUser(null)
      setSearchError(zodError)
      return
    }

    const { user: found, error: serviceError } = chatService.searchUser(cleanAlias || clean, user?.username || 'adminUser')
    setSearchedUser(found)
    setSearchError(serviceError || (found ? '' : zodError || ''))
  }, [user?.username])

  const handleSendConnectionRequest = useCallback((target) => {
    if (!target) return
    if (sentRequests.includes(target.username)) {
      triggerToast(`Ya enviaste una solicitud a ${target.handle}`)
      return
    }
    setSentRequests((prev) => [...prev, target.username])
    triggerToast(`Solicitud enviada a ${target.handle}`)
    setShowConnectModal(false)
    setSearchAlias('')
    setSearchedUser(null)
  }, [sentRequests, triggerToast])

  const handleAcceptRequest = useCallback((req) => {
    acceptRequest(req)
    setMobileView('chat')
    triggerToast(`Conexión establecida con ${req.fromUser.handle}`)
  }, [acceptRequest, triggerToast])

  const handleRejectRequest = useCallback((reqId) => {
    rejectRequest(reqId)
    triggerToast('Solicitud descartada')
  }, [rejectRequest, triggerToast])

  const handleDeleteConversation = useCallback((chatId) => {
    deleteConversation(chatId)
    setShowDetailsPanel(false)
    triggerToast('Conversación eliminada')
  }, [deleteConversation, triggerToast])

  const handleClearCurrentChat = useCallback(() => {
    clearCurrentChat()
    triggerToast('Historial reiniciado')
  }, [clearCurrentChat, triggerToast])

  const handleCopyMessage = useCallback((text) => {
    navigator.clipboard?.writeText(text)
    triggerToast('Texto copiado al portapapeles')
  }, [triggerToast])

  const handleOpenConnectModal = useCallback(() => setShowConnectModal(true), [])
  const handleCloseConnectModal = useCallback(() => {
    setShowConnectModal(false)
    setSearchAlias('')
    setSearchedUser(null)
    setSearchError('')
  }, [])

  const handleToggleDetailsPanel = useCallback(() => {
    setShowDetailsPanel((prev) => !prev)
  }, [])

  const handleCloseDetailsPanel = useCallback(() => {
    setShowDetailsPanel(false)
  }, [])

  const handleBackToList = useCallback(() => {
    setMobileView('list')
  }, [])

  const handleInsertCodeSnippet = useCallback(() => {
    setInputText((prev) => prev + 'const nexu = true;')
  }, [])

  return (
    <div className="chat-app-layout">
      {toastMessage && <div className="toast-feedback">{toastMessage}</div>}

      {/* 1. Sidebar con React.memo */}
      <ChatSidebar
        mobileView={mobileView}
        currentUser={currentUser}
        presenceStatus={customPresence || presenceStatus}
        onSelectPresence={handleSelectPresence}
        onOpenSettings={onOpenSettings}
        onOpenConnectModal={handleOpenConnectModal}
        onToggleDetailsPanel={handleToggleDetailsPanel}
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
          onBackToList={handleBackToList}
          onToggleDetails={handleToggleDetailsPanel}
          onCopyMessage={handleCopyMessage}
          onInsertCodeSnippet={handleInsertCodeSnippet}
          onTriggerToast={triggerToast}
          messagesEndRef={messagesEndRef}
        />
      ) : (
        <ChatEmptyState
          mobileView={mobileView}
          onBackToList={handleBackToList}
        />
      )}

      {/* 3. Panel de Detalles */}
      {showDetailsPanel && activeChat && (
        <ContactDetailsPanel
          activeChat={activeChat}
          onClose={handleCloseDetailsPanel}
          onClearChat={handleClearCurrentChat}
          onDeleteConversation={handleDeleteConversation}
        />
      )}

      {/* 4. Modal Conectar */}
      <ConnectUserModal
        isOpen={showConnectModal}
        onClose={handleCloseConnectModal}
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
