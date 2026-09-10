import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'
import { useChatUIStore } from '../store/useChatUIStore'
import api from '../services/api'

const INITIAL_CHATS_DEFAULT = [
  {
    id: 'chat_bot',
    name: 'Nexu Assistant',
    handle: '@nexu_assistant',
    avatar: 'NX',
    isBot: true,
    status: 'online',
    statusText: 'Asistente de Protocolo · En línea',
    unreadCount: 0,
    isPending: false,
    role: 'Asistente de Privacidad',
    email: 'assistant@nexu.app',
    bio: 'Bot automatizado para verificar el funcionamiento de la mensajería punto a punto.',
    messages: [
      {
        id: 'msg_01',
        sender: 'them',
        text: 'Bienvenido al santuario de comunicación privada de Nexu. Todas tus conversaciones son directas y anónimas.',
        time: '10:00 AM',
        status: 'read'
      }
    ]
  }
]



const ENCRYPTION_KEY = 'NEXU_SECURE_VAULT_2026';

const encryptData = (data) => {
  const str = JSON.stringify(data);
  let encrypted = '';
  for(let i = 0; i < str.length; i++) {
    encrypted += String.fromCharCode(str.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return btoa(encrypted);
};

const decryptData = (encodedData) => {
  try {
    const decoded = atob(encodedData);
    let decrypted = '';
    for(let i = 0; i < decoded.length; i++) {
      decrypted += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
    }
    return JSON.parse(decrypted);
  } catch (e) {
    return null;
  }
};

const getInitialChats = (username) => {
  if (!username) return INITIAL_CHATS_DEFAULT;
  const chatsCopy = JSON.parse(JSON.stringify(INITIAL_CHATS_DEFAULT));
  try {
    const savedBotHistory = localStorage.getItem(`nexu_bot_history_${username}`);
    if (savedBotHistory) {
      const decrypted = decryptData(savedBotHistory);
      if (decrypted) chatsCopy[0].messages = decrypted;
    }
  } catch (e) {
    console.error('Error reading bot history:', e);
  }
  return chatsCopy;
}

const saveBotHistory = (username, chats) => {
  try {
    const botChat = chats.find(c => c.id === 'chat_bot');
    if (botChat) {
      localStorage.setItem(`nexu_bot_history_${username}`, encryptData(botChat.messages));
    }
  } catch (e) {
    console.error('Error saving bot history:', e);
  }
}

export function useChats(currentUsername) {
  const queryClient = useQueryClient()
  const enabled = !!currentUsername

  // Zustand UI State
  const {
    selectedChatId,
    setSelectedChatId,
    isTyping,
    setIsTyping,
    presenceStatus,
    setPresenceStatus
  } = useChatUIStore()

  // Queries base para mantener el estado local inicial
  const { data: chats = getInitialChats(currentUsername) } = useQuery({
    queryKey: ['chats', currentUsername],
    queryFn: () => getInitialChats(currentUsername),
    staleTime: Infinity,
    enabled
  })

  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['requests', currentUsername],
    queryFn: () => chatService.getIncomingRequests(currentUsername),
    enabled
  })

  // Hook de sincronización (Polling) que reconstruye los chats como lo hacía ChatContext
  useQuery({
    queryKey: ['sync', currentUsername],
    queryFn: async () => {
      const syncData = await chatService.syncUserSession(currentUsername)
      if (!syncData) return null

      const { incomingRequests: serverReqs, acceptedUsers, messages: serverMsgs } = syncData

      // 1. Sincronizar solicitudes entrantes
      if (serverReqs && Array.isArray(serverReqs)) {
        const prevReqs = queryClient.getQueryData(['requests', currentUsername]) || []
        if (JSON.stringify(prevReqs) !== JSON.stringify(serverReqs)) {
          queryClient.setQueryData(['requests', currentUsername], serverReqs)
        }
      }

      // 2. Sincronizar y construir Chats
      const prevChats = queryClient.getQueryData(['chats', currentUsername]) || getInitialChats(currentUsername)
      let hasChanges = false
      let nextChats = [...prevChats]

      // A. Crear tarjetas de chats aceptados
      if (acceptedUsers && Array.isArray(acceptedUsers)) {
        for (const targetUserObj of acceptedUsers) {
          // Backward compatibility check inside the map:
          const targetUsername = typeof targetUserObj === 'string' ? targetUserObj : targetUserObj.username
          const isTargetOnline = typeof targetUserObj === 'string' ? true : targetUserObj.isOnline
          const targetAvatarUrl = typeof targetUserObj === 'string' ? null : targetUserObj.avatarUrl
          const targetDisplayName = typeof targetUserObj === 'string' ? null : targetUserObj.displayName
          
          const cleanTarget = targetUsername.toLowerCase()
          const chatId = `chat_${cleanTarget}`
          const existingChatIndex = nextChats.findIndex((c) => c.id === chatId)

          if (existingChatIndex === -1) {
            hasChanges = true
            nextChats = [
              {
                id: chatId,
                name: targetDisplayName || `@${cleanTarget}`,
                handle: `@${cleanTarget}`,
                avatar: cleanTarget.slice(0, 2).toUpperCase(),
                avatarUrl: targetAvatarUrl,
                isBot: false,
                status: isTargetOnline ? 'online' : 'offline',
                statusText: isTargetOnline ? 'En línea' : 'Desconectado',
                isPending: false,
                unreadCount: 0,
                role: 'Contacto Nexu',
                email: `${cleanTarget}@nexu.app`,
                bio: 'Conversación privada cifrada 1 a 1.',
                messages: []
              },
              ...nextChats
            ]
          } else {
            // Actualizar el estado si es necesario
            const currentStatus = isTargetOnline ? 'online' : 'offline'
            const currentChat = nextChats[existingChatIndex]
            if (
              currentChat.status !== currentStatus || 
              currentChat.avatarUrl !== targetAvatarUrl ||
              currentChat.name !== (targetDisplayName || `@${cleanTarget}`)
            ) {
              hasChanges = true
              nextChats[existingChatIndex] = {
                ...currentChat,
                status: currentStatus,
                statusText: isTargetOnline ? 'En línea' : 'Desconectado',
                avatarUrl: targetAvatarUrl,
                name: targetDisplayName || `@${cleanTarget}`
              }
            }
          }
        }
      }

      // B. Sincronizar mensajes en chats existentes
      nextChats = nextChats.map((c) => {
        const target = c.handle ? c.handle.replace(/^@/, '').toLowerCase() : ''
        const acceptedObj = acceptedUsers?.find(u => (typeof u === 'string' ? u : u.username) === target)

        if (c.isPending && acceptedObj) {
          hasChanges = true
          return {
            ...c,
            isPending: false,
            status: typeof acceptedObj === 'string' ? 'online' : (acceptedObj.isOnline ? 'online' : 'offline'),
            statusText: typeof acceptedObj === 'string' ? 'En línea' : (acceptedObj.isOnline ? 'En línea' : 'Desconectado'),
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

        if (serverMsgs && Array.isArray(serverMsgs)) {
          const relMsgs = serverMsgs.filter(
            (m) =>
              (m.senderUsername === target && m.recipientUsername === currentUsername.toLowerCase()) ||
              (m.senderUsername === currentUsername.toLowerCase() && m.recipientUsername === target)
          )

          if (relMsgs.length > 0) {
            const existingIds = new Set(c.messages.map((m) => m.id))
            const serverStatusMap = new Map(relMsgs.map((m) => [m.id, m.status]))

            let updatedMessages = c.messages.map((m) => {
              if (serverStatusMap.has(m.id) && m.status !== serverStatusMap.get(m.id)) {
                hasChanges = true
                return { ...m, status: serverStatusMap.get(m.id) }
              }
              return m
            })

            const newMsgsToAdd = relMsgs.filter((m) => !existingIds.has(m.id))

            if (newMsgsToAdd.length > 0) {
              hasChanges = true
              updatedMessages = [...updatedMessages, ...newMsgsToAdd]
              if (c.id === selectedChatId) {
                chatService.markMessagesAsRead(currentUsername, target)
              }
            }

            if (hasChanges) {
              return { ...c, messages: updatedMessages }
            }
          }
        }

        return c
      })

      if (hasChanges) {
        nextChats.sort((a, b) => {
          const aLast = a.messages.length > 0 ? a.messages[a.messages.length - 1] : null
          const bLast = b.messages.length > 0 ? b.messages[b.messages.length - 1] : null
          
          const aTime = aLast?.createdAt ? new Date(aLast.createdAt).getTime() : (aLast?.id ? parseInt(aLast.id.split('_').pop()) || 0 : 0)
          const bTime = bLast?.createdAt ? new Date(bLast.createdAt).getTime() : (bLast?.id ? parseInt(bLast.id.split('_').pop()) || 0 : 0)
          
          return bTime - aTime
        })
        queryClient.setQueryData(['chats', currentUsername], nextChats)
      }

      return syncData
    },
    enabled,
    refetchInterval: 2500
  })

  // Monitoreo de Presencia (como en ChatContext)
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
  }, [setPresenceStatus])

  // --- Actions ---

  const activeChat = chats.find((c) => c.id === selectedChatId) || null

  const selectChat = (chatId) => {
    setSelectedChatId(chatId)
    const targetChat = chats.find((c) => c.id === chatId)
    if (targetChat && targetChat.handle && !targetChat.isBot) {
      const partner = targetChat.handle.replace(/^@/, '').toLowerCase()
      chatService.markMessagesAsRead(currentUsername, partner)
    }

    queryClient.setQueryData(['chats', currentUsername], (prev) =>
      (prev || []).map((c) => {
        if (c.id === chatId) {
          const readMsgs = c.messages.map((m) => (m.sender === 'them' ? { ...m, status: 'read' } : m))
          return { ...c, unreadCount: 0, messages: readMsgs }
        }
        return c
      })
    )
  }

  const sendMessage = async (text, attachment = null) => {
    if ((!text.trim() && !attachment) || !activeChat || activeChat.isPending) return

    const { updatedChats } = await chatService.sendMessage(chats, activeChat.id, text, 'me', currentUsername, attachment)
    queryClient.setQueryData(['chats', currentUsername], updatedChats)
    if (activeChat.isBot) saveBotHistory(currentUsername, updatedChats)

    if (activeChat.isBot) {
      setIsTyping(true)
      try {
        const response = await api.post('/assistant/ask', {
          text,
          history: activeChat.messages
        })

        // El cliente api.js envuelve la respuesta en { success: true, data: { ... } }
        if (response.success && response.data && response.data.answer) {
          const { updatedChats: replyChats } = await chatService.getAutoReply(updatedChats, activeChat.id, response.data.answer)
          queryClient.setQueryData(['chats', currentUsername], replyChats)
          saveBotHistory(currentUsername, replyChats)
        } else {
          console.error('Error del bot:', response.error || response.data?.message || 'Respuesta inválida')
        }
      } catch (err) {
        console.error('Error de red al llamar al bot:', err)
      } finally {
        setIsTyping(false)
      }
    }
  }

  const sendRequest = async (targetUser) => {
    const { updatedChats, newChatId } = await chatService.sendConnectionRequest(currentUsername, targetUser, chats)
    queryClient.setQueryData(['chats', currentUsername], updatedChats)
    setSelectedChatId(newChatId)
  }

  const acceptRequest = async (req) => {
    const { updatedRecipientChats, updatedReqs, newChatId } = await chatService.acceptConnectionRequest(req, currentUsername, chats)
    queryClient.setQueryData(['chats', currentUsername], updatedRecipientChats)
    queryClient.setQueryData(['requests', currentUsername], updatedReqs)
    setSelectedChatId(newChatId)
  }

  const rejectRequest = async (reqId) => {
    const updatedReqs = await chatService.rejectConnectionRequest(reqId, currentUsername)
    queryClient.setQueryData(['requests', currentUsername], updatedReqs)
  }

  const cancelRequest = async (targetUsername) => {
    const updatedChats = await chatService.cancelConnectionRequest(currentUsername, targetUsername, chats)
    queryClient.setQueryData(['chats', currentUsername], updatedChats)
    if (selectedChatId === `chat_${targetUsername.toLowerCase()}`) {
      setSelectedChatId(null)
    }
  }

  const blockUser = async (req) => {
    const updatedReqs = await chatService.blockUserRequest(req, currentUsername)
    queryClient.setQueryData(['requests', currentUsername], updatedReqs)
    if (selectedChatId === `chat_${req.fromUser.username.toLowerCase()}`) {
      setSelectedChatId(null)
    }
  }

  const deleteConversation = (chatId) => {
    const updated = chats.filter((c) => c.id !== chatId)
    queryClient.setQueryData(['chats', currentUsername], updated)
    if (activeChat.isBot) saveBotHistory(currentUsername, updated)
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }

  const clearCurrentChat = () => {
    if (!activeChat) return
    const updated = chats.map((c) =>
      c.id === activeChat.id ? { ...c, messages: [] } : c
    )
    queryClient.setQueryData(['chats', currentUsername], updated)
  }

  return {
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
}
