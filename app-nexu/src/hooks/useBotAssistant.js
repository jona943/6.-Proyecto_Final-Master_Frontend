import api from '../services/api'
import { chatService } from '../services/chatService'
import { soundService } from '../services/soundService'
import { saveBotHistory } from '../utils/chatStorage'

/**
 * Hook / Controlador para gestionar las respuestas automaticas del Asistente IA de Nexu
 */
export function useBotAssistant({ cleanUsername, queryClient, setIsTyping }) {
  const triggerBotReply = async (activeChat, userText, currentChats) => {
    if (!activeChat || !activeChat.isBot) return

    setIsTyping(true)
    try {
      const response = await api.post('/assistant/ask', {
        text: userText,
        history: activeChat.messages || []
      })

      if (response.success && response.data && response.data.answer) {
        const { updatedChats: replyChats } = await chatService.getAutoReply(
          currentChats,
          activeChat.id,
          response.data.answer
        )
        queryClient.setQueryData(['chats', cleanUsername], replyChats)
        saveBotHistory(cleanUsername, replyChats)
        soundService.playMessageReceivedSound()
      } else {
        console.error('[Bot Error]:', response.error || response.data?.message || 'Respuesta no disponible')
      }
    } catch (err) {
      console.error('[Bot Network Error]:', err.message || err)
    } finally {
      setIsTyping(false)
    }
  }

  return { triggerBotReply }
}
