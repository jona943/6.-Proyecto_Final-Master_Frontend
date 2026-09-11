import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'
import { soundService } from '../services/soundService'
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

const isChatFavorite = (favList, chatId) => {
  if (!Array.isArray(favList) || !chatId) return false
  const lower = chatId.toLowerCase()
  return favList.some((id) => (id || '').toLowerCase() === lower)
}

const loadFavorites = (username) => {
  if (!username) return []
  try {
    const clean = username.trim().toLowerCase()
    const raw = localStorage.getItem(`nexu_favs_${clean}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveFavorites = (username, favIds) => {
  if (!username) return
  try {
    const clean = username.trim().toLowerCase()
    localStorage.setItem(`nexu_favs_${clean}`, JSON.stringify(favIds))
  } catch (e) {
    console.error('Error saving favorites:', e)
  }
}

const isChatManualUnread = (unreadList, chatId) => {
  if (!Array.isArray(unreadList) || !chatId) return false
  const lower = chatId.toLowerCase()
  return unreadList.some((id) => (id || '').toLowerCase() === lower)
}

const loadManualUnread = (username) => {
  if (!username) return []
  try {
    const clean = username.trim().toLowerCase()
    const raw = localStorage.getItem(`nexu_manual_unread_${clean}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveManualUnread = (username, unreadIds) => {
  if (!username) return
  try {
    const clean = username.trim().toLowerCase()
    localStorage.setItem(`nexu_manual_unread_${clean}`, JSON.stringify(unreadIds))
  } catch (e) {
    console.error('Error saving manual unread:', e)
  }
}

const getInitialChats = (username) => {
  if (!username) return INITIAL_CHATS_DEFAULT;
  const clean = username.trim().toLowerCase()
  const chatsCopy = JSON.parse(JSON.stringify(INITIAL_CHATS_DEFAULT));
  try {
    const savedBotHistory = localStorage.getItem(`nexu_bot_history_${clean}`);
    if (savedBotHistory) {
      const decrypted = decryptData(savedBotHistory);
      if (decrypted) chatsCopy[0].messages = decrypted;
    }
    const favs = loadFavorites(clean);
    const manualUnread = loadManualUnread(clean);
    chatsCopy.forEach((c) => {
      c.isFavorite = isChatFavorite(favs, c.id);
      if (isChatManualUnread(manualUnread, c.id)) {
        c.unreadCount = Math.max(c.unreadCount || 0, 1);
      }
    });
  } catch (e) {
    console.error('Error reading bot history, favorites, or unread state:', e);
  }
  return chatsCopy;
}

const saveBotHistory = (username, chats) => {
  try {
    const clean = (username || '').trim().toLowerCase()
    const botChat = chats.find(c => c.id === 'chat_bot');
    if (botChat) {
      localStorage.setItem(`nexu_bot_history_${clean}`, encryptData(botChat.messages));
    }
  } catch (e) {
    console.error('Error saving bot history:', e);
  }
}

export function useChats(currentUsername) {
  const cleanUsername = (currentUsername || '').trim().toLowerCase()
  const queryClient = useQueryClient()
  const enabled = !!cleanUsername

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
  const { data: chats = getInitialChats(cleanUsername) } = useQuery({
    queryKey: ['chats', cleanUsername],
    queryFn: () => getInitialChats(cleanUsername),
    staleTime: Infinity,
    enabled
  })

  const { data: requestsData = { incoming: [], outgoing: [] } } = useQuery({
    queryKey: ['requests', cleanUsername],
    queryFn: () => chatService.getRequests(cleanUsername),
    enabled
  })
  const incomingRequests = requestsData.incoming || []
  const outgoingRequests = requestsData.outgoing || []

  // Hook de sincronización (Polling) que reconstruye los chats como lo hacía ChatContext
  useQuery({
    queryKey: ['sync', cleanUsername],
    queryFn: async () => {
      const syncData = await chatService.syncUserSession(cleanUsername)
      const requestsSync = await chatService.getRequests(cleanUsername)
      queryClient.setQueryData(['requests', cleanUsername], requestsSync)
      if (!syncData) return null

      const { incomingRequests: serverReqs, acceptedUsers, messages: serverMsgs } = syncData

      // Sincronización delegada a requestsSync

      // 2. Sincronizar y construir Chats
      const prevChats = queryClient.getQueryData(['chats', cleanUsername]) || getInitialChats(cleanUsername)
      const currentFavs = loadFavorites(cleanUsername)
      const currentManualUnread = loadManualUnread(cleanUsername)
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
                isFavorite: isChatFavorite(currentFavs, chatId),
                status: isTargetOnline ? 'online' : 'offline',
                statusText: isTargetOnline ? 'En línea' : 'Desconectado',
                isPending: false,
                unreadCount: isChatManualUnread(currentManualUnread, chatId) ? 1 : 0,
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
              currentChat.name !== (targetDisplayName || `@${cleanTarget}`) ||
              currentChat.isDisconnected ||
              currentChat.isPending
            ) {
              hasChanges = true
              nextChats[existingChatIndex] = {
                ...currentChat,
                status: currentStatus,
                statusText: isTargetOnline ? 'En línea' : 'Desconectado',
                avatarUrl: targetAvatarUrl,
                name: targetDisplayName || `@${cleanTarget}`,
                isDisconnected: false,
                isPending: false
              }
            }
          }
        }
      }

      // B. Sincronizar mensajes en chats existentes
      nextChats = nextChats.map((c) => {
        const isManual = isChatManualUnread(currentManualUnread, c.id)

        if (c.isBot) {
          const targetUnread = c.id === selectedChatId ? 0 : (isManual ? Math.max(c.unreadCount || 0, 1) : (c.unreadCount || 0))
          if (c.unreadCount !== targetUnread) {
            hasChanges = true
            return { ...c, unreadCount: targetUnread }
          }
          return c
        }

        const target = c.handle ? c.handle.replace(/^@/, '').toLowerCase() : ''
        const acceptedObj = acceptedUsers?.find(u => (typeof u === 'string' ? u : u.username) === target)
        const isOutgoingPending = requestsSync?.outgoing?.some(
          (r) => (r.toUser?.username || r.targetUsername || '').toLowerCase() === target
        )
        const incomingReq = (requestsSync?.incoming || incomingRequests)?.find(
          (r) => (r.fromUser?.username || '').toLowerCase() === target
        )

        let chatCopy = { ...c }

        if (!acceptedObj) {
          // No está en la lista de conexiones aceptadas
          const hasIncomingRequest = Boolean(incomingReq)
          const shouldBePending = Boolean(isOutgoingPending) && !hasIncomingRequest
          const shouldBeDisconnected = !isOutgoingPending && !hasIncomingRequest

          if (
            chatCopy.hasIncomingRequest !== hasIncomingRequest ||
            chatCopy.isPending !== shouldBePending ||
            chatCopy.isDisconnected !== shouldBeDisconnected ||
            chatCopy.incomingRequestId !== (incomingReq?.id || null)
          ) {
            hasChanges = true
            chatCopy = {
              ...chatCopy,
              hasIncomingRequest,
              incomingRequestId: incomingReq?.id || null,
              incomingRequest: incomingReq || null,
              isPending: shouldBePending,
              isDisconnected: shouldBeDisconnected,
              status: 'offline',
              statusText: hasIncomingRequest
                ? 'Te envió una solicitud'
                : shouldBePending
                ? 'Solicitud pendiente'
                : 'Conexión no activa'
            }
          }
        } else {
          // Está aceptado
          if (chatCopy.isPending || chatCopy.isDisconnected || chatCopy.hasIncomingRequest) {
            hasChanges = true
            chatCopy = {
              ...chatCopy,
              isPending: false,
              isDisconnected: false,
              hasIncomingRequest: false,
              incomingRequestId: null,
              incomingRequest: null,
              status: typeof acceptedObj === 'string' ? 'online' : (acceptedObj.isOnline ? 'online' : 'offline'),
              statusText: typeof acceptedObj === 'string' ? 'En línea' : (acceptedObj.isOnline ? 'En línea' : 'Desconectado'),
              messages: chatCopy.messages.some((m) => m.id?.includes('accepted'))
                ? chatCopy.messages
                : [
                    ...chatCopy.messages,
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
        }

        if (serverMsgs && Array.isArray(serverMsgs)) {
          const relMsgs = serverMsgs.filter(
            (m) =>
              (m.senderUsername === target && m.recipientUsername === currentUsername.toLowerCase()) ||
              (m.senderUsername === currentUsername.toLowerCase() && m.recipientUsername === target)
          )

          if (relMsgs.length > 0) {
            const existingIds = new Set(chatCopy.messages.map((m) => m.id))
            const serverStatusMap = new Map(relMsgs.map((m) => [m.id, m.status]))

            let updatedMessages = chatCopy.messages.map((m) => {
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
              const incomingThem = newMsgsToAdd.filter((m) => m.sender === 'them')
              if (incomingThem.length > 0) {
                if (chatCopy.messages && chatCopy.messages.length > 0) {
                  soundService.playMessageReceivedSound()
                }
                if (chatCopy.id === selectedChatId) {
                  chatService.markMessagesAsRead(currentUsername, target)
                }
              }
            }

            const calculatedUnread = updatedMessages.filter((m) => m.sender === 'them' && m.status !== 'read').length
            const unreadCount = chatCopy.id === selectedChatId
              ? 0
              : (isManual ? Math.max(calculatedUnread, 1) : calculatedUnread)

            if (chatCopy.unreadCount !== unreadCount) {
              hasChanges = true
            }

            return { ...chatCopy, messages: updatedMessages, unreadCount }
          }
        }

        if (chatCopy.id === selectedChatId) {
          if (chatCopy.unreadCount !== 0) {
            hasChanges = true
            chatCopy = { ...chatCopy, unreadCount: 0 }
          }
        } else if (isManual && (chatCopy.unreadCount || 0) === 0) {
          hasChanges = true
          chatCopy = { ...chatCopy, unreadCount: 1 }
        }

        return chatCopy
      })

      // Asegurar que el estado isFavorite de cada chat siempre coincida con localStorage
      nextChats = nextChats.map((c) => {
        const shouldBeFav = isChatFavorite(currentFavs, c.id)
        if (c.isFavorite !== shouldBeFav) {
          hasChanges = true
          return { ...c, isFavorite: shouldBeFav }
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
        queryClient.setQueryData(['chats', cleanUsername], nextChats)
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

    // Si estaba marcado manualmente como no leído, lo removemos de localStorage
    const currentManualUnread = loadManualUnread(cleanUsername)
    if (isChatManualUnread(currentManualUnread, chatId)) {
      const updatedManual = currentManualUnread.filter((id) => (id || '').toLowerCase() !== (chatId || '').toLowerCase())
      saveManualUnread(cleanUsername, updatedManual)
    }

    const targetChat = chats.find((c) => c.id === chatId)
    if (targetChat && targetChat.handle && !targetChat.isBot) {
      const partner = targetChat.handle.replace(/^@/, '').toLowerCase()
      chatService.markMessagesAsRead(cleanUsername, partner)
    }

    queryClient.setQueryData(['chats', cleanUsername], (prev) =>
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
    if ((!text.trim() && !attachment) || !activeChat || activeChat.isPending || activeChat.isDisconnected) return

    soundService.playMessageSentSound()

    const { updatedChats } = await chatService.sendMessage(chats, activeChat.id, text, 'me', cleanUsername, attachment)
    queryClient.setQueryData(['chats', cleanUsername], updatedChats)
    if (activeChat.isBot) saveBotHistory(cleanUsername, updatedChats)

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
          queryClient.setQueryData(['chats', cleanUsername], replyChats)
          saveBotHistory(cleanUsername, replyChats)
          soundService.playMessageReceivedSound()
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
    const cleanTarget = (typeof targetUser === 'string' ? targetUser : targetUser?.username || '')
      .replace(/^@/, '')
      .trim()
      .toLowerCase()

    // 1. ¿El usuario ya nos envió una solicitud entrante?
    const isAlreadyIncoming = incomingRequests.some(
      (r) => (r.fromUser?.username || '').toLowerCase() === cleanTarget
    )
    if (isAlreadyIncoming) {
      return {
        success: false,
        message: `@${cleanTarget} ya te ha enviado una solicitud de conexión. Revisa tu bandeja de solicitudes para aceptarla.`
      }
    }

    // 2. ¿Ya tenemos una solicitud saliente pendiente enviada a él?
    const isAlreadyOutgoing = outgoingRequests.some(
      (r) => (r.toUser?.username || r.targetUsername || '').toLowerCase() === cleanTarget
    )
    if (isAlreadyOutgoing) {
      return {
        success: false,
        message: `Ya tienes una solicitud pendiente enviada a @${cleanTarget}. Espera a que la acepte.`
      }
    }

    const res = await chatService.sendConnectionRequest(cleanUsername, cleanTarget, chats)
    const requestsSync = await chatService.getRequests(cleanUsername)
    queryClient.setQueryData(['requests', cleanUsername], requestsSync)
    return res
  }

  const acceptRequest = async (req) => {
    const { updatedRecipientChats, newChatId } = await chatService.acceptConnectionRequest(req, cleanUsername, chats)
    queryClient.setQueryData(['chats', cleanUsername], updatedRecipientChats)
    const requestsSync = await chatService.getRequests(cleanUsername)
    queryClient.setQueryData(['requests', cleanUsername], requestsSync)
    setSelectedChatId(newChatId)
  }

  const rejectRequest = async (reqId) => {
    await chatService.rejectConnectionRequest(reqId, cleanUsername)
    const requestsSync = await chatService.getRequests(cleanUsername)
    queryClient.setQueryData(['requests', cleanUsername], requestsSync)
  }

  const cancelRequest = async (reqIdOrTarget, targetUsername) => {
    const reqId = typeof reqIdOrTarget === 'string' && reqIdOrTarget.length === 24 ? reqIdOrTarget : null
    const target = reqId ? targetUsername : reqIdOrTarget
    await chatService.cancelConnectionRequest(reqId, cleanUsername, target)
    const requestsSync = await chatService.getRequests(cleanUsername)
    queryClient.setQueryData(['requests', cleanUsername], requestsSync)
    if (target && selectedChatId === `chat_${target.toLowerCase()}`) {
      setSelectedChatId(null)
    }
  }

  const blockUser = async (req) => {
    const updatedReqs = await chatService.blockUserRequest(req, cleanUsername)
    queryClient.setQueryData(['requests', cleanUsername], updatedReqs)
    if (selectedChatId === `chat_${req.fromUser.username.toLowerCase()}`) {
      setSelectedChatId(null)
    }
  }

  const deleteConversation = async (chatId) => {
    const targetChat = chats.find(c => c.id === chatId)
    if (!targetChat || targetChat.isBot) return

    await chatService.deleteContact(cleanUsername, targetChat.handle.replace('@', ''))

    const currentFavs = loadFavorites(cleanUsername)
    if (isChatFavorite(currentFavs, chatId)) {
      saveFavorites(cleanUsername, currentFavs.filter((id) => (id || '').toLowerCase() !== chatId.toLowerCase()))
    }
    const currentManualUnread = loadManualUnread(cleanUsername)
    if (isChatManualUnread(currentManualUnread, chatId)) {
      saveManualUnread(cleanUsername, currentManualUnread.filter((id) => (id || '').toLowerCase() !== chatId.toLowerCase()))
    }

    const updated = chats.filter((c) => c.id !== chatId)
    queryClient.setQueryData(['chats', cleanUsername], updated)
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }

  const clearChatById = async (chatId) => {
    const targetChat = chats.find(c => c.id === chatId)
    if (!targetChat) return

    if (!targetChat.isBot && targetChat.handle) {
      await chatService.clearMessages(cleanUsername, targetChat.handle.replace('@', ''))
    }

    const updated = chats.map((c) =>
      c.id === chatId ? { ...c, messages: [] } : c
    )
    queryClient.setQueryData(['chats', cleanUsername], updated)
    if (targetChat.isBot) saveBotHistory(cleanUsername, updated)
  }

  const clearCurrentChat = () => {
    if (!activeChat) return
    clearChatById(activeChat.id)
  }

  const toggleFavorite = (chatId) => {
    if (!chatId) return
    const currentFavs = loadFavorites(cleanUsername)
    const isFav = isChatFavorite(currentFavs, chatId)
    const updatedFavs = isFav
      ? currentFavs.filter((id) => (id || '').toLowerCase() !== chatId.toLowerCase())
      : [...currentFavs, chatId.toLowerCase()]

    saveFavorites(cleanUsername, updatedFavs)

    queryClient.setQueryData(['chats', cleanUsername], (prev) =>
      (prev || []).map((c) =>
        (c.id || '').toLowerCase() === chatId.toLowerCase()
          ? { ...c, isFavorite: !isFav }
          : c
      )
    )
  }

  const toggleRead = (chat) => {
    if (!chat || !chat.id) return
    const isCurrentlyUnread = (chat.unreadCount || 0) > 0
    const currentManualUnread = loadManualUnread(cleanUsername)
    const targetIdLower = chat.id.toLowerCase()

    if (isCurrentlyUnread) {
      // Marcar como LEÍDO
      const updatedManual = currentManualUnread.filter((id) => (id || '').toLowerCase() !== targetIdLower)
      saveManualUnread(cleanUsername, updatedManual)

      queryClient.setQueryData(['chats', cleanUsername], (prev) =>
        (prev || []).map((c) => {
          if ((c.id || '').toLowerCase() === targetIdLower) {
            const readMsgs = (c.messages || []).map((m) => (m.sender === 'them' ? { ...m, status: 'read' } : m))
            return { ...c, unreadCount: 0, messages: readMsgs }
          }
          return c
        })
      )

      if (chat.handle && !chat.isBot) {
        const partner = chat.handle.replace(/^@/, '').toLowerCase()
        chatService.markMessagesAsRead(cleanUsername, partner)
      }
    } else {
      // Marcar como NO LEÍDO
      if (!isChatManualUnread(currentManualUnread, chat.id)) {
        saveManualUnread(cleanUsername, [...currentManualUnread, targetIdLower])
      }

      queryClient.setQueryData(['chats', cleanUsername], (prev) =>
        (prev || []).map((c) => {
          if ((c.id || '').toLowerCase() === targetIdLower) {
            return { ...c, unreadCount: 1 }
          }
          return c
        })
      )
    }
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
    outgoingRequests,
    acceptRequest,
    rejectRequest,
    blockUser,
    deleteConversation,
    clearCurrentChat,
    clearChatById,
    toggleFavorite,
    toggleRead
  }
}
