import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'
import { soundService } from '../services/soundService'
import { useChatUIStore } from '../store/useChatUIStore'
import { usePresenceMonitor } from './usePresenceMonitor'
import { useBotAssistant } from './useBotAssistant'
import { useChatSync } from './useChatSync'
import {
  getInitialChats,
  loadFavorites,
  saveFavorites,
  isChatFavorite,
  loadManualUnread,
  saveManualUnread,
  isChatManualUnread,
  saveBotHistory
} from '../utils/chatStorage'

/**
 * Hook orquestador principal de mensajeria Nexu
 * Integra estado UI (Zustand), sincronizacion remota (TanStack Query) y persistencia local
 */
export function useChats(currentUsername) {
  const cleanUsername = (currentUsername || '').trim().toLowerCase()
  const queryClient = useQueryClient()
  const enabled = !!cleanUsername

  // 1. Estado UI global de Zustand
  const {
    selectedChatId,
    setSelectedChatId,
    isTyping,
    setIsTyping,
    presenceStatus,
    setPresenceStatus
  } = useChatUIStore()

  // 2. Monitoreo de presencia de red y visibilidad de ventana
  usePresenceMonitor(setPresenceStatus)

  // 3. Queries base para chats y solicitudes de conexion
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

  // 4. Sincronizacion periodica en segundo plano
  useChatSync({
    cleanUsername,
    queryClient,
    selectedChatId,
    incomingRequests,
    enabled
  })

  // 5. Controlador para el Asistente Bot IA
  const { triggerBotReply } = useBotAssistant({
    cleanUsername,
    queryClient,
    setIsTyping
  })

  const activeChat = chats.find((c) => c.id === selectedChatId) || null

  // ============================================================================
  // ACCIONES DE MENSAJERIA
  // ============================================================================

  const selectChat = (chatId) => {
    setSelectedChatId(chatId)

    // Si estaba marcado manualmente como no leido, removerlo de la persistencia
    const currentManualUnread = loadManualUnread(cleanUsername)
    if (isChatManualUnread(currentManualUnread, chatId)) {
      const updatedManual = currentManualUnread.filter(
        (id) => (id || '').toLowerCase() !== (chatId || '').toLowerCase()
      )
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
          const readMsgs = (c.messages || []).map((m) =>
            m.sender === 'them' ? { ...m, status: 'read' } : m
          )
          return { ...c, unreadCount: 0, messages: readMsgs }
        }
        return c
      })
    )
  }

  const sendMessage = async (text, attachment = null) => {
    if ((!text.trim() && !attachment) || !activeChat || activeChat.isPending || activeChat.isDisconnected) return

    soundService.playMessageSentSound()

    const { updatedChats } = await chatService.sendMessage(
      chats,
      activeChat.id,
      text,
      'me',
      cleanUsername,
      attachment
    )
    queryClient.setQueryData(['chats', cleanUsername], updatedChats)

    if (activeChat.isBot) {
      saveBotHistory(cleanUsername, updatedChats)
      await triggerBotReply(activeChat, text, updatedChats)
    }
  }

  // ============================================================================
  // ACCIONES DE SOLICITUDES Y CONTACTOS
  // ============================================================================

  const sendRequest = async (targetUser) => {
    const cleanTarget = (typeof targetUser === 'string' ? targetUser : targetUser?.username || '')
      .replace(/^@/, '')
      .trim()
      .toLowerCase()

    const isAlreadyIncoming = incomingRequests.some(
      (r) => (r.fromUser?.username || '').toLowerCase() === cleanTarget
    )
    if (isAlreadyIncoming) {
      return {
        success: false,
        message: `@${cleanTarget} ya te ha enviado una solicitud de conexion. Revisa tu bandeja de solicitudes.`
      }
    }

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
    const { updatedRecipientChats, newChatId } = await chatService.acceptConnectionRequest(
      req,
      cleanUsername,
      chats
    )
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
    const targetChat = chats.find((c) => c.id === chatId)
    if (!targetChat || targetChat.isBot) return

    await chatService.deleteContact(cleanUsername, targetChat.handle.replace('@', ''))

    const currentFavs = loadFavorites(cleanUsername)
    if (isChatFavorite(currentFavs, chatId)) {
      saveFavorites(
        cleanUsername,
        currentFavs.filter((id) => (id || '').toLowerCase() !== chatId.toLowerCase())
      )
    }
    const currentManualUnread = loadManualUnread(cleanUsername)
    if (isChatManualUnread(currentManualUnread, chatId)) {
      saveManualUnread(
        cleanUsername,
        currentManualUnread.filter((id) => (id || '').toLowerCase() !== chatId.toLowerCase())
      )
    }

    const updated = chats.filter((c) => c.id !== chatId)
    queryClient.setQueryData(['chats', cleanUsername], updated)
    if (selectedChatId === chatId) {
      setSelectedChatId(null)
    }
  }

  const clearChatById = async (chatId) => {
    const targetChat = chats.find((c) => c.id === chatId)
    if (!targetChat) return

    if (!targetChat.isBot && targetChat.handle) {
      await chatService.clearMessages(cleanUsername, targetChat.handle.replace('@', ''))
    }

    const updated = chats.map((c) => (c.id === chatId ? { ...c, messages: [] } : c))
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
        (c.id || '').toLowerCase() === chatId.toLowerCase() ? { ...c, isFavorite: !isFav } : c
      )
    )
  }

  const toggleRead = (chat) => {
    if (!chat || !chat.id) return
    const isCurrentlyUnread = (chat.unreadCount || 0) > 0
    const currentManualUnread = loadManualUnread(cleanUsername)
    const targetIdLower = chat.id.toLowerCase()

    if (isCurrentlyUnread) {
      const updatedManual = currentManualUnread.filter((id) => (id || '').toLowerCase() !== targetIdLower)
      saveManualUnread(cleanUsername, updatedManual)

      queryClient.setQueryData(['chats', cleanUsername], (prev) =>
        (prev || []).map((c) => {
          if ((c.id || '').toLowerCase() === targetIdLower) {
            const readMsgs = (c.messages || []).map((m) =>
              m.sender === 'them' ? { ...m, status: 'read' } : m
            )
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
