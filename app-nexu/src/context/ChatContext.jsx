import { createContext, useContext, useState, useEffect } from 'react'
import { chatService, MOCK_KNOWN_USERS } from '../services/chatService'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const currentUsername = user?.username || 'adminUser'

  const [chats, setChats] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [presenceStatus, setPresenceStatus] = useState('online')
  const [incomingRequests, setIncomingRequests] = useState(() => {
    if (currentUsername === 'rosi_master') {
      return [
        {
          id: 'req_admin',
          fromUser: MOCK_KNOWN_USERS[0], // adminUser
          time: 'Reciente',
          status: 'pending'
        }
      ]
    }
    return []
  })

  // Cargar chats iniciales
  useEffect(() => {
    chatService.getChats().then((data) => setChats(data))
  }, [])

  // Monitoreo de Presencia y Conexión Real
  useEffect(() => {
    const handleOnline = () => setPresenceStatus('online')
    const handleOffline = () => setPresenceStatus('offline')
    const handleVisibilityChange = () => {
      setPresenceStatus(document.hidden ? 'away' : 'online')
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
  }, [])

  const activeChat = chats.find((c) => c.id === selectedChatId) || null

  const selectChat = (chatId) => {
    setSelectedChatId(chatId)
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    )
  }

  const sendMessage = async (text) => {
    if (!text.trim() || !activeChat) return

    const { updatedChats } = await chatService.sendMessage(chats, activeChat.id, text, 'me')
    setChats(updatedChats)

    // Simular auto-respuesta asíncrona
    setIsTyping(true)
    setTimeout(async () => {
      const { updatedChats: replyChats } = await chatService.getAutoReply(updatedChats, activeChat.id, text)
      setChats(replyChats)
      setIsTyping(false)
    }, 1100)
  }

  const acceptRequest = (req) => {
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
          text: `¡Hola! Gracias por aceptar la solicitud de conexión en Nexu.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    }

    setIncomingRequests((prev) => prev.filter((r) => r.id !== req.id))
    const updated = [newChat, ...chats.filter((c) => c.id !== newChatId)]
    setChats(updated)
    chatService.saveChats(updated)
    setSelectedChatId(newChatId)
  }

  const rejectRequest = (reqId) => {
    setIncomingRequests((prev) => prev.filter((r) => r.id !== reqId))
  }

  const deleteConversation = (chatId) => {
    const updated = chats.filter((c) => c.id !== chatId)
    setChats(updated)
    chatService.saveChats(updated)
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }

  const clearCurrentChat = () => {
    if (!activeChat) return
    const updated = chats.map((c) =>
      c.id === activeChat.id ? { ...c, messages: [] } : c
    )
    setChats(updated)
    chatService.saveChats(updated)
  }

  const value = {
    chats,
    selectedChatId,
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
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe usarse dentro de un ChatProvider')
  }
  return context
}
