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

  // Polling en tiempo real (cada 2.5 segundos) para sincronizar aceptaciones de solicitudes y mensajes entrantes
  useEffect(() => {
    if (!currentUsername) return

    const intervalId = setInterval(async () => {
      const syncData = await chatService.syncUserSession(currentUsername)
      if (!syncData) return

      const { incomingRequests: serverReqs, acceptedUsers, messages: serverMsgs } = syncData

      // 1. Actualizar solicitudes entrantes si cambiaron en el servidor
      if (serverReqs && Array.isArray(serverReqs)) {
        setIncomingRequests((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(serverReqs)) {
            return serverReqs
          }
          return prev
        })
      }

      // 2. Actualizar chats si alguna solicitud pendiente fue aceptada en MongoDB Atlas
      setChats((prevChats) => {
        let hasChanges = false
        const nextChats = prevChats.map((c) => {
          const target = c.handle ? c.handle.replace(/^@/, '').toLowerCase() : ''

          // Si el chat estaba pendiente y ahora fue aceptado por el receptor en la nube:
          if (c.isPending && acceptedUsers.includes(target)) {
            hasChanges = true
            return {
              ...c,
              isPending: false,
              status: 'online',
              statusText: 'En línea · Conectado',
              messages: c.messages.some((m) => m.id.includes('accepted'))
                ? c.messages
                : [
                    ...c.messages,
                    {
                      id: `msg_accepted_sync_${Date.now()}`,
                      sender: 'them',
                      text: `@${target} aceptó tu solicitud de conexión. ¡Ya pueden chatear!`,
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      status: 'read'
                    }
                  ]
            }
          }

          // Sincronizar mensajes 1 a 1 en tiempo real (evitando duplicados)
          if (serverMsgs && Array.isArray(serverMsgs)) {
            const relMsgs = serverMsgs.filter(
              (m) =>
                (m.senderUsername === target && m.recipientUsername === currentUsername.toLowerCase()) ||
                (m.senderUsername === currentUsername.toLowerCase() && m.recipientUsername === target)
            )

            if (relMsgs.length > 0) {
              const existingIds = new Set(c.messages.map((m) => m.id))
              const existingSignatures = new Set(c.messages.map((m) => `${m.sender}:${m.text.trim()}`))

              const newMsgsToAdd = relMsgs.filter(
                (m) => !existingIds.has(m.id) && !existingSignatures.has(`${m.sender}:${m.text.trim()}`)
              )

              if (newMsgsToAdd.length > 0) {
                hasChanges = true
                return {
                  ...c,
                  messages: [...c.messages, ...newMsgsToAdd]
                }
              }
            }
          }

          return c
        })

        if (hasChanges) {
          chatService.saveChats(nextChats, currentUsername)
          return nextChats
        }

        return prevChats
      })
    }, 2500)

    return () => clearInterval(intervalId)
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

  // Cancelar solicitud enviada por el usuario
  const cancelRequest = async (targetUsername) => {
    const updatedChats = await chatService.cancelConnectionRequest(currentUsername, targetUsername, chats)
    setChats(updatedChats)
    if (selectedChatId === `chat_${targetUsername.toLowerCase()}`) {
      setSelectedChatId(null)
    }
  }

  // Bloquear usuario desde una solicitud recibida
  const blockUser = async (req) => {
    const updatedReqs = await chatService.blockUserRequest(req, currentUsername)
    setIncomingRequests(updatedReqs)
    if (selectedChatId === `chat_${req.fromUser.username.toLowerCase()}`) {
      setSelectedChatId(null)
    }
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
    cancelRequest,
    isTyping,
    presenceStatus,
    incomingRequests,
    acceptRequest,
    rejectRequest,
    blockUser,
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
