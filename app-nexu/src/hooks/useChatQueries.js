import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatService } from '../services/chatService'

export function useChatQueries(currentUsername) {
  const queryClient = useQueryClient()
  const enabled = !!currentUsername

  // Fetch initial chats (sólo backend, sin persistencia)
  const { data: chatsData = [] } = useQuery({
    queryKey: ['chats', currentUsername],
    queryFn: () => chatService.getChats(currentUsername),
    enabled
  })

  // Fetch incoming requests
  const { data: requestsData = [] } = useQuery({
    queryKey: ['requests', currentUsername],
    queryFn: () => chatService.getIncomingRequests(currentUsername),
    enabled
  })

  // Poll de sincronización en tiempo real (cada 2.5s)
  useQuery({
    queryKey: ['sync', currentUsername],
    queryFn: () => chatService.syncUserSession(currentUsername),
    enabled,
    refetchInterval: 2500,
    onSuccess: (syncData) => {
      if (!syncData) return
      // Aquí el backend devuelve la sincronización real.
      // En una implementación de React Query ideal, el backend devuelve el objeto completo de chats,
      // pero para mantener compatibilidad con la UI actual, invalidamos queries locales
      // si detectamos cambios. (Para una migración total, se debería ajustar el backend).
      queryClient.invalidateQueries(['chats', currentUsername])
      queryClient.invalidateQueries(['requests', currentUsername])
    }
  })

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({ chats, chatId, text, username }) =>
      chatService.sendMessage(chats, chatId, text, 'me', username),
    onSuccess: ({ updatedChats }) => {
      // Actualización optimista
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })

  const sendRequestMutation = useMutation({
    mutationFn: ({ targetUser, chats }) =>
      chatService.sendConnectionRequest(currentUsername, targetUser, chats),
    onSuccess: ({ updatedChats }) => {
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })

  const acceptRequestMutation = useMutation({
    mutationFn: ({ req, chats }) =>
      chatService.acceptConnectionRequest(req, currentUsername, chats),
    onSuccess: ({ updatedRecipientChats, updatedReqs }) => {
      queryClient.setQueryData(['chats', currentUsername], updatedRecipientChats)
      queryClient.setQueryData(['requests', currentUsername], updatedReqs)
    }
  })

  const rejectRequestMutation = useMutation({
    mutationFn: ({ reqId }) =>
      chatService.rejectConnectionRequest(reqId, currentUsername),
    onSuccess: (updatedReqs) => {
      queryClient.setQueryData(['requests', currentUsername], updatedReqs)
    }
  })

  const cancelRequestMutation = useMutation({
    mutationFn: ({ targetUsername, chats }) =>
      chatService.cancelConnectionRequest(currentUsername, targetUsername, chats),
    onSuccess: (updatedChats) => {
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })

  const blockUserMutation = useMutation({
    mutationFn: ({ req }) =>
      chatService.blockUserRequest(req, currentUsername),
    onSuccess: (updatedReqs) => {
      queryClient.setQueryData(['requests', currentUsername], updatedReqs)
    }
  })

  const deleteConversationMutation = useMutation({
    mutationFn: ({ chatId, chats }) => {
      return chats.filter((c) => c.id !== chatId)
    },
    onSuccess: (updatedChats) => {
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })

  const clearCurrentChatMutation = useMutation({
    mutationFn: ({ activeChatId, chats }) => {
      return chats.map((c) =>
        c.id === activeChatId ? { ...c, messages: [] } : c
      )
    },
    onSuccess: (updatedChats) => {
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })
  
  const getAutoReplyMutation = useMutation({
    mutationFn: ({ chats, chatId, text }) => 
      chatService.getAutoReply(chats, chatId, text, currentUsername),
    onSuccess: ({ updatedChats }) => {
      queryClient.setQueryData(['chats', currentUsername], updatedChats)
    }
  })

  return {
    chats: chatsData,
    incomingRequests: requestsData,
    sendMessage: sendMessageMutation.mutateAsync,
    sendRequest: sendRequestMutation.mutateAsync,
    acceptRequest: acceptRequestMutation.mutateAsync,
    rejectRequest: rejectRequestMutation.mutateAsync,
    cancelRequest: cancelRequestMutation.mutateAsync,
    blockUser: blockUserMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    clearCurrentChat: clearCurrentChatMutation.mutateAsync,
    getAutoReply: getAutoReplyMutation.mutateAsync,
    markMessagesAsRead: chatService.markMessagesAsRead
  }
}
