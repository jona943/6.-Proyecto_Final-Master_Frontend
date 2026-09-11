import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import './Chat.css'
import { useAuthStore } from '../../../store/useAuthStore'
import { useChats } from '../../../hooks/useChats'
import { chatService } from '../../../services/chatService'
import { sanitizeAlias } from '../../../utils/validators'
import { aliasSchema, validateWithSchema } from '../../../utils/schemas'
import { formatHandle } from '../../../utils/formatters'

import ChatSidebar from './components/ChatSidebar'
import ActiveChatPanel from './components/ActiveChatPanel'
import ContactDetailsPanel from './components/ContactDetailsPanel'
import ConnectUserModal from './components/ConnectUserModal'
import ChatEmptyState from './components/ChatEmptyState'
import ConfirmActionModal from './components/ConfirmActionModal'
import SoundPermissionPrompt from './components/SoundPermissionPrompt'
import { soundService } from '../../../services/soundService'

// ============================================================================
// COMPONENTE PRINCIPAL: CHAT HOME (COORDINADOR MODULAR + CONTEXT + UTILS)
// ============================================================================
function ChatHome() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const {
    chats,
    activeChat,
    selectChat,
    sendMessage,
    sendRequest,
    cancelRequest,
    isTyping,
    presenceStatus,
    incomingRequests,
    outgoingRequests,
    acceptRequest,
    rejectRequest,
    blockUser,
    deleteConversation,
    clearCurrentChat,
    clearChatById,
    toggleFavorite,
    toggleRead
  } = useChats(user?.username || 'guest')

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
  const [userSuggestions, setUserSuggestions] = useState([])
  const [sentRequests, setSentRequests] = useState([])
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirmar',
    variant: 'danger',
    onConfirm: null
  })

  // Estado del permiso y activación de sonido de notificaciones
  const [showSoundPrompt, setShowSoundPrompt] = useState(() => soundService.getPermissionState() === null)
  const [soundEnabled, setSoundEnabled] = useState(() => soundService.isSoundEnabled())

  const messagesEndRef = useRef(null)

  // Auto-scroll al final del contenedor de mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages, isTyping])

  // Toast temporal
  const triggerToast = useCallback((text) => {
    setToastMessage(text)
    setTimeout(() => setToastMessage(''), 2200)
  }, [])

  // Optimización con useMemo: Filtrado de contactos (evita re-filtrar en renderizados ajenos)
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesSearch =
        chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.handle.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false
      if (activeFilter === 'unread') return chat.unreadCount > 0
      if (activeFilter === 'favorites') return chat.isFavorite === true;
      if (activeFilter === 'requests') return false;
      return true
    })
  }, [chats, searchQuery, activeFilter])

  const unreadChatsCount = useMemo(() => {
    return chats.filter((c) => (c.unreadCount || 0) > 0).length
  }, [chats])

  const favoritesCount = useMemo(() => {
    return chats.filter((c) => c.isFavorite === true).length
  }, [chats])

  // Optimización con useCallback para evitar recrear manejadores de eventos en cada render
  const handleSelectChat = useCallback((chatId) => {
    selectChat(chatId)
    setMobileView('chat')
  }, [selectChat])

  // Enviar mensaje
  const handleSendMessage = (e, attachment = null) => {
    if (e) e.preventDefault()
    if (!inputText.trim() && !attachment) return
    if (!activeChat) return

    sendMessage(inputText, attachment)
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

  // Búsqueda de usuario conectando con MongoDB Atlas y la API REST (Validación con Zod)
  const handleSearchUser = async (val) => {
    const clean = sanitizeAlias(val)
    setSearchAlias(clean)
    if (!clean) {
      setSearchedUser(null)
      setUserSuggestions([])
      setSearchError('')
      return
    }

    const validation = validateWithSchema(aliasSchema, clean)
    if (!validation.isValid && validation.errors.username) {
      setSearchError(validation.errors.username)
    } else {
      setSearchError('')
    }

    const { user: found, suggestions, error } = await chatService.searchUser(clean, user?.username || 'adminUser')
    setSearchedUser(found)
    setUserSuggestions(suggestions || [])
    if (error) setSearchError(error)
  }

  // Enviar solicitud de conexión
  const handleSendConnectionRequest = async (target) => {
    if (!target) return
    const targetUsername = typeof target === 'string' ? target : target.username
    const targetHandle = typeof target === 'string' ? `@${target}` : (target.handle || `@${target.username}`)

    // Validar si el usuario ya nos envió una solicitud previamente
    const isAlreadyIncoming = incomingRequests.some(
      (r) => (r.fromUser?.username || '').toLowerCase() === targetUsername.toLowerCase()
    )
    if (isAlreadyIncoming) {
      triggerToast(`@${targetUsername} ya te ha enviado una solicitud. Revisa tu bandeja de solicitudes para aceptarla.`)
      setShowConnectModal(false)
      return
    }

    const res = await sendRequest(target)
    if (res && res.success === false) {
      triggerToast(res.message || 'No se pudo enviar la solicitud')
      return
    }

    setSentRequests((prev) => [...prev, targetUsername])
    triggerToast(`Solicitud de conexión enviada a ${targetHandle}`)
    setShowConnectModal(false)
    setSearchAlias('')
    setSearchedUser(null)
    setUserSuggestions([])
    setMobileView('chat')
  }

  // Cancelar solicitud enviada
  const handleCancelRequest = (targetUsername) => {
    cancelRequest(targetUsername)
    triggerToast(`Solicitud a @${targetUsername} cancelada`)
    setMobileView('list')
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

  // Bloquear usuario
  const handleBlockUser = (req) => {
    blockUser(req)
    triggerToast(`Usuario ${req.fromUser.handle} bloqueado`)
  }

  // 1. Advertencia para Vaciar Mensajes
  const handleRequestClearChat = (chatToClear) => {
    const target = chatToClear || activeChat
    if (!target) return

    setConfirmModal({
      isOpen: true,
      title: `¿Vaciar mensajes de "${target.name}"?`,
      message: 'Esta acción eliminará todos los mensajes de esta conversación en tu historial. Tu contacto aún podrá ver su copia de los mensajes.',
      confirmLabel: 'Vaciar mensajes',
      variant: 'danger',
      onConfirm: async () => {
        await clearChatById(target.id)
        triggerToast('Mensajes vaciados correctamente')
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  // 2. Advertencia para Eliminar Contacto
  const handleRequestDeleteContact = (chatIdToDelete) => {
    const target = chats.find((c) => c.id === chatIdToDelete) || activeChat
    if (!target) return

    setConfirmModal({
      isOpen: true,
      title: `¿Eliminar a "${target.name}" de tus contactos?`,
      message: `Se eliminará a ${target.handle || target.name} de tus contactos. Para volver a enviarle mensajes, deberás enviar una nueva solicitud de conexión y esperar a que sea aceptada.`,
      confirmLabel: 'Eliminar contacto',
      variant: 'danger',
      onConfirm: async () => {
        await deleteConversation(target.id)
        setShowDetailsPanel(false)
        triggerToast('Contacto eliminado')
        setConfirmModal((prev) => ({ ...prev, isOpen: false }))
      }
    })
  }

  // Control de sonido de notificaciones
  const handleEnableSound = () => {
    soundService.setSoundEnabled(true)
    setSoundEnabled(true)
    setShowSoundPrompt(false)
    soundService.playMessageReceivedSound()
    triggerToast('Sonidos de notificación activados')
  }

  const handleMuteSound = () => {
    soundService.setSoundEnabled(false)
    setSoundEnabled(false)
    setShowSoundPrompt(false)
    triggerToast('Sonidos de notificación desactivados')
  }

  const handleToggleSound = () => {
    const next = !soundEnabled
    soundService.setSoundEnabled(next)
    setSoundEnabled(next)
    if (next) {
      soundService.playMessageReceivedSound()
      triggerToast('Sonidos de notificación activados')
    } else {
      triggerToast('Sonidos de notificación silenciados')
    }
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
          name: user?.displayName || user?.username || 'Usuario',
          handle: formatHandle(user?.username || 'adminUser'),
          avatar: user?.avatarType ? undefined : (user?.username ? user.username.slice(0, 2).toUpperCase() : 'NX'),
          avatarType: user?.avatarType || 'neutral',
          avatarUrl: user?.avatarUrl || null
        }}
        presenceStatus={customPresence || presenceStatus}
        onSelectPresence={handleSelectPresence}
        onOpenSettings={() => navigate('/settings')}
        onOpenConnectModal={() => setShowConnectModal(true)}
        onToggleDetailsPanel={() => setShowDetailsPanel(!showDetailsPanel)}
        showDetailsPanel={showDetailsPanel}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        chatsCount={chats.length}
        unreadChatsCount={unreadChatsCount}
        favoritesCount={favoritesCount}
        incomingRequests={incomingRequests}
        outgoingRequests={outgoingRequests}
        onCancelRequest={cancelRequest}
        onAcceptRequest={handleAcceptRequest}
        onRejectRequest={handleRejectRequest}
        onBlockUser={handleBlockUser}
        filteredChats={filteredChats}
        activeChatId={activeChat?.id}
        onSelectChat={handleSelectChat}
        onCopyInviteLink={handleCopyInviteLink}
        onToggleFavorite={toggleFavorite}
        onToggleRead={toggleRead}
        onClearMessages={(chat) => handleRequestClearChat(chat)}
        onDeleteContact={(chatId) => handleRequestDeleteContact(chatId)}
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
          onCancelRequest={handleCancelRequest}
          onSendConnectionRequest={handleSendConnectionRequest}
          onAcceptRequest={handleAcceptRequest}
          onRejectRequest={handleRejectRequest}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
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
          onClearChat={() => handleRequestClearChat(activeChat)}
          onDeleteConversation={(chatId) => handleRequestDeleteContact(chatId)}
        />
      )}

      {/* 4. Modal Conectar */}
      <ConnectUserModal
        isOpen={showConnectModal}
        onClose={() => {
          setShowConnectModal(false)
          setSearchAlias('')
          setSearchedUser(null)
          setUserSuggestions([])
          setSearchError('')
        }}
        searchAlias={searchAlias}
        onSearchChange={handleSearchUser}
        searchError={searchError}
        searchedUser={searchedUser}
        userSuggestions={userSuggestions}
        sentRequests={sentRequests}
        onSendRequest={handleSendConnectionRequest}
      />

      {/* 5. Modal de Confirmación de Acciones Destructivas */}
      <ConfirmActionModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
      />

      {/* 6. Prompt de Permiso de Sonido (Solo una vez) */}
      {showSoundPrompt && (
        <SoundPermissionPrompt
          onEnable={handleEnableSound}
          onMute={handleMuteSound}
        />
      )}
    </div>
  )
}

export default ChatHome
