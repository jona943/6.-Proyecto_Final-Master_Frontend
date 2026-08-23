// ============================================================================
// SERVICIO DE MENSAJERÍA Y CHAT (ADAPTER PATTERN)
// Actualmente opera en modo Demo-Funcional con StorageService seguro.
// Listo para reemplazar con WebSockets (Socket.io) / API REST sin alterar componentes.
// ============================================================================

import { storage, STORAGE_KEYS } from './storageService'

export const MOCK_KNOWN_USERS = [
  {
    username: 'adminUser',
    name: 'Administrador Nexu',
    handle: '@adminUser',
    role: 'System Admin',
    avatar: 'AD',
    status: 'online',
    statusText: 'En línea · Soporte Activo'
  },
  {
    username: 'rosi_master',
    name: 'Rosa Melano',
    handle: '@rosi_master',
    role: 'Frontend Specialist',
    avatar: 'RM',
    status: 'online',
    statusText: 'En línea'
  }
]

export const BOT_RESPONSES = [
  'Mensaje verificado. La conexión entre pares permanece cifrada.',
  'Recibido con éxito. El estándar de Nexu mantiene el hilo seguro.',
  'Perfecto. Notificación silenciosa entregada al destinatario.',
  'Entendido. La sincronización se realizó de manera privada.'
]

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
      },
      {
        id: 'msg_02',
        sender: 'them',
        text: 'Escribe un mensaje para probar la simulación de respuesta automática.',
        time: '10:01 AM',
        status: 'read'
      }
    ]
  }
]

export const chatService = {
  // Obtener lista de chats
  async getChats() {
    await new Promise((resolve) => setTimeout(resolve, 80))
    return storage.get(STORAGE_KEYS.CHATS_DATA, INITIAL_CHATS_DEFAULT)
  },

  // Guardar estado de chats
  saveChats(chats) {
    storage.set(STORAGE_KEYS.CHATS_DATA, chats)
  },

  // Enviar mensaje
  async sendMessage(chats, chatId, text, sender = 'me') {
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text: text.trim(),
      time: timeFormatted,
      status: sender === 'me' ? 'delivered' : 'read'
    }

    const updated = chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage]
        }
      }
      return c
    })

    this.saveChats(updated)
    return { updatedChats: updated, newMessage }
  },

  // Simular respuesta automática (Bot o contacto simulado)
  async getAutoReply(chats, chatId, userMessage) {
    await new Promise((resolve) => setTimeout(resolve, 1100))

    const targetChat = chats.find((c) => c.id === chatId)
    let replyText = ''

    if (targetChat?.isBot) {
      const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length)
      replyText = BOT_RESPONSES[randomIndex]
    } else {
      replyText = `Recibido: "${userMessage}". Respuesta registrada en el hilo privado.`
    }

    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const botMessage = {
      id: `reply_${Date.now()}`,
      sender: 'them',
      text: replyText,
      time: timeFormatted,
      status: 'read'
    }

    const updated = chats.map((c) => {
      if (c.id === chatId) {
        const readHistory = c.messages.map((m) =>
          m.sender === 'me' ? { ...m, status: 'read' } : m
        )
        return {
          ...c,
          messages: [...readHistory, botMessage]
        }
      }
      return c
    })

    this.saveChats(updated)
    return { updatedChats: updated, botMessage }
  },

  // Buscar usuario por alias
  searchUser(cleanAlias, currentUsername) {
    if (!cleanAlias) return { user: null, error: '' }
    if (cleanAlias.toLowerCase() === currentUsername.toLowerCase()) {
      return { user: null, error: 'No puedes enviarte una solicitud a ti mismo.' }
    }

    const found = MOCK_KNOWN_USERS.find(
      (u) => u.username.toLowerCase() === cleanAlias.toLowerCase()
    )

    if (found) {
      return { user: found, error: '' }
    } else if (cleanAlias.length >= 3) {
      return { user: null, error: 'Usuario no encontrado. Prueba con @adminUser o @rosi_master.' }
    }

    return { user: null, error: '' }
  }
}
