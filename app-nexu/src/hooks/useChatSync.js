import { useQuery } from '@tanstack/react-query'
import { chatService } from '../services/chatService'
import { soundService } from '../services/soundService'
import {
  getInitialChats,
  loadFavorites,
  loadManualUnread,
  isChatFavorite,
  isChatManualUnread,
  saveCachedChats
} from '../utils/chatStorage'

/**
 * Hook de sincronizacion en segundo plano (Polling cada 2.5s)
 * Reconcilia solicitudes, nuevos contactos aceptados, presencia y mensajes en tiempo real
 */
export function useChatSync({ cleanUsername, queryClient, selectedChatId, incomingRequests, enabled }) {
  useQuery({
    queryKey: ['chatSync', cleanUsername],
    queryFn: async () => {
      const syncData = await chatService.syncUserSession(cleanUsername)
      if (!syncData) return null

      // 1. Actualizar cache de solicitudes directamente sin peticion HTTP adicional
      const requestsSync = {
        incoming: syncData.incomingRequests || [],
        outgoing: syncData.outgoingRequests || []
      }
      queryClient.setQueryData(['requests', cleanUsername], requestsSync)

      const { acceptedUsers, messages: serverMsgs } = syncData

      // 2. Sincronizar y reconstruir lista de chats
      const prevChats = queryClient.getQueryData(['chats', cleanUsername]) || getInitialChats(cleanUsername)
      const currentFavs = loadFavorites(cleanUsername)
      const currentManualUnread = loadManualUnread(cleanUsername)
      let hasChanges = false
      let nextChats = [...prevChats]

      // A. Crear o actualizar tarjetas de chats aceptados
      if (acceptedUsers && Array.isArray(acceptedUsers)) {
        for (const targetUserObj of acceptedUsers) {
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
                statusText: isTargetOnline ? 'En linea' : 'Desconectado',
                isPending: false,
                unreadCount: isChatManualUnread(currentManualUnread, chatId) ? 1 : 0,
                role: 'Contacto Nexu',
                email: `${cleanTarget}@nexu.app`,
                bio: 'Conversacion privada cifrada 1 a 1.',
                messages: []
              },
              ...nextChats
            ]
          } else {
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
                statusText: isTargetOnline ? 'En linea' : 'Desconectado',
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
        const acceptedObj = acceptedUsers?.find((u) => (typeof u === 'string' ? u : u.username) === target)
        const isOutgoingPending = requestsSync?.outgoing?.some(
          (r) => (r.toUser?.username || r.targetUsername || '').toLowerCase() === target
        )
        const incomingReq = (requestsSync?.incoming || incomingRequests)?.find(
          (r) => (r.fromUser?.username || '').toLowerCase() === target
        )

        let chatCopy = { ...c }

        if (!acceptedObj) {
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
                ? 'Te envio una solicitud'
                : shouldBePending
                ? 'Solicitud pendiente'
                : 'Conexion no activa'
            }
          }
        } else {
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
              statusText: typeof acceptedObj === 'string' ? 'En linea' : (acceptedObj.isOnline ? 'En linea' : 'Desconectado'),
              messages: chatCopy.messages.some((m) => m.id?.includes('accepted'))
                ? chatCopy.messages
                : [
                    ...chatCopy.messages,
                    {
                      id: `msg_accepted_sync_${Date.now()}`,
                      sender: 'system',
                      isSystem: true,
                      text: `¡Aceptaste la solicitud de conexión de @${target}! Ya pueden enviarse mensajes privados.`,
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
              (m.senderUsername === target && m.recipientUsername === cleanUsername) ||
              (m.senderUsername === cleanUsername && m.recipientUsername === target)
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
                  chatService.markMessagesAsRead(cleanUsername, target)
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

      // C. Reconciliar estado de favoritos con localStorage
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
        saveCachedChats(cleanUsername, nextChats)
      }

      return syncData
    },
    enabled,
    refetchInterval: 2500
  })
}
