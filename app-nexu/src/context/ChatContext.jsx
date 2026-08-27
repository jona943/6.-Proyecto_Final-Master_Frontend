import { createContext, useContext, useState, useEffect } from 'react'
import { chatService, MOCK_KNOWN_USERS } from '../services/chatService'
import { useAuth } from './AuthContext'

const ChatContext = createContext(null)

export function ChatProvider({ children }) {
  const { user } = useAuth()
  const currentUsername = user?.username || 'guest'

  const [chats, setChats] = useState([])
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const [presenceStatus, setPresenceStatus] = useState('online')
  const [incomingRequests, setIncomingRequests] = useState([])

  // Cargar chats aislados por usuario cada vez que cambia el usuario autenticado
  useEffect(() => {
    if (!currentUsername) {
      setChats([])
      setSelectedChatId(null)
      setIncomingRequests([])
      return
    }

    // Reiniciar selección al cambiar de cuenta
    setSelectedChatId(null)
    chatService.getChats(currentUsername).then((data) => setChats(data))

    // Cargar solicitudes de conexión pendientes desde el servidor (MongoDB Atlas)
    chatService.getIncomingRequests(currentUsername).then((reqs) => {
      if (currentUsername.toLowerCase() === 'rosi_master' && reqs.length === 0) {
        setIncomingRequests([
          {
            id: 'req_admin',
            fromUser: MOCK_KNOWN_USERS[0],
            time: 'Reciente',
            status: 'pending'
          }
        ])
      } else {
        setIncomingRequests(reqs)
      }
    })
  }, [currentUsername])

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
    if (!text.trim() || !activeChat || activeChat.isPending) return

    const { updatedChats } = await chatService.sendMessage(chats, activeChat.id, text, 'me', currentUsername)
    setChats(updatedChats)

    // Simular auto-respuesta asíncrona sólo para bots
    if (activeChat.isBot) {
      setIsTyping(true)
      setTimeout(async () => {
        const { updatedChats: replyChats } = await chatService.getAutoReply(updatedChats, activeChat.id, text, currentUsername)
        setChats(replyChats)
        setIsTyping(false)
      }, 1100)
    }
  }

  // Enviar solicitud de conexión a un usuario buscado
  const sendRequest = async (targetUser) => {
    const { updatedChats, newChatId } = await chatService.sendConnectionRequest(currentUsername, targetUser, chats)
    setChats(updatedChats)
    setSelectedChatId(newChatId)
  }

  // Aceptar solicitud de conexión entrante
  const acceptRequest = async (req) => {
    const { updatedRecipientChats, updatedReqs, newChatId } = await chatService.acceptConnectionRequest(req, currentUsername, chats)
    setChats(updatedRecipientChats)
    setIncomingRequests(updatedReqs)
    setSelectedChatId(newChatId)
  }

  // Rechazar solicitud de conexión
  const rejectRequest = async (reqId) => {
    const updatedReqs = await chatService.rejectConnectionRequest(reqId, currentUsername)
    setIncomingRequests(updatedReqs)
  }

  const deleteConversation = (chatId) => {
    const updated = chats.filter((c) => c.id !== chatId)
    setChats(updated)
    chatService.saveChats(updated, currentUsername)
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
    chatService.saveChats(updated, currentUsername)
  }

  const value = {
    chats,
    selectedChatId,
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
