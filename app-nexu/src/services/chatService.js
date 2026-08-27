import api from './api'
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
  // Obtener lista de chats aislada por usuario
  async getChats(username = 'guest') {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const key = STORAGE_KEYS.userChatsKey(username)
    return storage.get(key, INITIAL_CHATS_DEFAULT)
  },

  // Guardar estado de chats aislado por usuario
  saveChats(chats, username = 'guest') {
    const key = STORAGE_KEYS.userChatsKey(username)
    storage.set(key, chats)
  },

  // Enviar mensaje 1 a 1 a MongoDB Atlas
  async sendMessage(chats, chatId, text, sender = 'me', username = 'guest') {
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const cleanUser = (username || 'guest').trim().toLowerCase()

    const targetChat = chats.find((c) => c.id === chatId)
    const targetUsername = targetChat?.handle ? targetChat.handle.replace(/^@/, '').toLowerCase() : ''

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text: text.trim(),
      time: timeFormatted,
      status: sender === 'me' ? 'delivered' : 'read'
    }

    // Guardar en backend si es conversación 1 a 1 con otro usuario
    if (targetUsername && !targetChat?.isBot) {
      try {
        const res = await api.post('/chats/message', {
          senderUsername: cleanUser,
          recipientUsername: targetUsername,
          text: text.trim()
        })
        const realId = res?.data?._id || res?.data?.data?._id
        if (realId) {
          newMessage.id = realId.toString()
        }
      } catch {
        // Fallback local
      }
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

    this.saveChats(updated, cleanUser)
    return { updatedChats: updated, newMessage }
  },

  // Sincronizar en tiempo real solicitudes, aceptaciones y mensajes desde MongoDB Atlas
  async syncUserSession(username) {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return null

    try {
      const res = await api.get(`/chats/sync?username=${encodeURIComponent(clean)}`)
      if (res && res.success && res.data?.sync) {
        return res.data.sync
      }
    } catch {
      // Fallback local
    }
    return null
  },

  // Simular respuesta automática (Bot o contacto simulado)
  async getAutoReply(chats, chatId, userMessage, username = 'guest') {
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

    this.saveChats(updated, username)
    return { updatedChats: updated, botMessage }
  },

  // Buscar usuario por alias consultando tanto la lista local como MongoDB Atlas
  async searchUser(cleanAlias, currentUsername) {
    const clean = (cleanAlias || '').trim().replace(/^@/, '').toLowerCase()
    if (!clean) return { user: null, error: '' }
    if (clean === (currentUsername || '').toLowerCase()) {
      return { user: null, error: 'No puedes enviarte una solicitud a ti mismo.' }
    }

    // 1. Consultar MongoDB Atlas mediante la API REST
    try {
      const res = await api.checkAlias(clean)
      if (res && res.available === false) {
        const display = res.formatted || `@${clean}`
        return {
          user: {
            username: clean,
            name: display,
            handle: `@${clean}`,
            role: 'Usuario Nexu',
            avatar: clean.slice(0, 2).toUpperCase(),
            status: 'offline',
            statusText: 'Usuario Registrado'
          },
          error: ''
        }
      }
    } catch {
      // Fallback si la API no está disponible
    }

    // 2. Buscar en almacenamiento local o mock
    const registered = storage.get('nexu_registered_accounts_db', []).map((u) => ({
      username: u.username.toLowerCase(),
      name: u.displayName || `@${u.username}`,
      handle: `@${u.username}`,
      role: u.role || 'Usuario Nexu',
      avatar: (u.displayName || u.username).replace(/^@/, '').slice(0, 2).toUpperCase(),
      status: 'offline',
      statusText: 'Usuario Nexu'
    }))

    const allUsers = [...MOCK_KNOWN_USERS.map(u => ({ ...u, username: u.username.toLowerCase() })), ...registered]
    const found = allUsers.find((u) => u.username === clean)

    if (found) {
      return { user: found, error: '' }
    }

    if (clean.length >= 3) {
      return { user: null, error: `El usuario @${clean} no fue encontrado.` }
    }

    return { user: null, error: '' }
  },

  // Obtener solicitudes entrantes de un usuario desde MongoDB Atlas
  async getIncomingRequests(username) {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return []

    try {
      const res = await api.get(`/chats/requests?username=${encodeURIComponent(clean)}`)
      if (res && res.success && Array.isArray(res.data?.requests)) {
        return res.data.requests
      }
    } catch {
      // Fallback local
    }

    const key = STORAGE_KEYS.userRequestsKey(clean)
    return storage.get(key, [])
  },

  // Enviar solicitud de conexión a MongoDB Atlas
  async sendConnectionRequest(senderUsername, targetUser, currentSenderChats) {
    const senderClean = senderUsername.toLowerCase()
    const targetClean = targetUser.username.toLowerCase()

    // 1. Notificar al backend Express / MongoDB Atlas
    try {
      await api.post('/chats/request', {
        senderUsername: senderClean,
        targetUsername: targetClean
      })
    } catch {
      // Fallback local
    }

    // 2. Guardar solicitud local de respaldo
    const recipientRequestsKey = STORAGE_KEYS.userRequestsKey(targetClean)
    const existingIncoming = storage.get(recipientRequestsKey, [])
    const newIncomingReq = {
      id: `req_${Date.now()}`,
      fromUser: {
        username: senderClean,
        name: `@${senderClean}`,
        handle: `@${senderClean}`,
        avatar: senderClean.slice(0, 2).toUpperCase()
      },
      time: 'Reciente',
      status: 'pending'
    }

    if (!existingIncoming.some((r) => r.fromUser.username.toLowerCase() === senderClean)) {
      storage.set(recipientRequestsKey, [newIncomingReq, ...existingIncoming])
    }

    // 3. Agregar chat en estado "Pendiente (En espera)" a la lista del emisor
    const chatId = `chat_${targetClean}`
    const pendingChat = {
      id: chatId,
      name: targetUser.name || `@${targetClean}`,
      handle: `@${targetClean}`,
      avatar: targetUser.avatar || targetClean.slice(0, 2).toUpperCase(),
      isBot: false,
      status: 'pending',
      statusText: 'Solicitud enviada (En espera de aprobación)',
      isPending: true,
      unreadCount: 0,
      role: targetUser.role || 'Usuario Nexu',
      email: `${targetClean}@nexu.app`,
      bio: 'Solicitud de conexión enviada. En espera de respuesta.',
      messages: [
        {
          id: `msg_pending_${Date.now()}`,
          sender: 'system',
          text: `Solicitud de conexión enviada a @${targetClean}. En espera de que acepte tu solicitud para entablar mensajes 1 a 1.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    }

    const updatedChats = [pendingChat, ...currentSenderChats.filter((c) => c.id !== chatId)]
    this.saveChats(updatedChats, senderClean)
    return { updatedChats, newChatId: chatId }
  },

  // Aceptar solicitud de conexión en MongoDB Atlas
  async acceptConnectionRequest(req, recipientUsername, currentRecipientChats) {
    const recipientClean = recipientUsername.toLowerCase()
    const senderClean = req.fromUser.username.toLowerCase()

    // 1. Notificar al backend Express / MongoDB Atlas
    try {
      await api.post('/chats/accept', {
        reqId: req.id,
        recipientUsername: recipientClean,
        senderUsername: senderClean
      })
    } catch {
      // Fallback local
    }

    // 2. Agregar conversación activa a la lista del destinatario (quien acepta)
    const newChatForRecipient = {
      id: `chat_${senderClean}`,
      name: req.fromUser.name || `@${senderClean}`,
      handle: req.fromUser.handle || `@${senderClean}`,
      avatar: req.fromUser.avatar || senderClean.slice(0, 2).toUpperCase(),
      isBot: false,
      status: 'online',
      statusText: 'En línea · Conectado',
      isPending: false,
      unreadCount: 0,
      role: 'Contacto Nexu',
      email: `${senderClean}@nexu.app`,
      bio: 'Conversación privada cifrada 1 a 1.',
      messages: [
        {
          id: `msg_accepted_${Date.now()}`,
          sender: 'them',
          text: `¡Aceptaste la solicitud de conexión de @${senderClean}! Ya pueden enviarse mensajes privados.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'read'
        }
      ]
    }

    const updatedRecipientChats = [newChatForRecipient, ...currentRecipientChats.filter((c) => c.id !== newChatForRecipient.id)]
    this.saveChats(updatedRecipientChats, recipientClean)

    // 3. Actualizar la conversación en la cuenta del emisor
    const senderChatsKey = STORAGE_KEYS.userChatsKey(senderClean)
    const senderChats = storage.get(senderChatsKey, INITIAL_CHATS_DEFAULT)
    const updatedSenderChats = senderChats.map((c) => {
      if (c.id === `chat_${recipientClean}`) {
        return {
          ...c,
          status: 'online',
          statusText: 'En línea · Conectado',
          isPending: false,
          messages: [
            ...c.messages,
            {
              id: `msg_accepted_notify_${Date.now()}`,
              sender: 'them',
              text: `@${recipientClean} aceptó tu solicitud de conexión. ¡Ya pueden chatear!`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'read'
            }
          ]
        }
      }
      return c
    })
    storage.set(senderChatsKey, updatedSenderChats)

    // 4. Eliminar la solicitud de la lista de pendientes del destinatario
    const reqKey = STORAGE_KEYS.userRequestsKey(recipientClean)
    const pendingReqs = storage.get(reqKey, [])
    const updatedReqs = pendingReqs.filter((r) => r.id !== req.id)
    storage.set(reqKey, updatedReqs)

    return { updatedRecipientChats, updatedReqs, newChatId: newChatForRecipient.id }
  },

  // Rechazar solicitud de conexión
  async rejectConnectionRequest(reqId, recipientUsername) {
    const recipientClean = recipientUsername.toLowerCase()
    try {
      await api.post('/chats/reject', { reqId })
    } catch {
      // Fallback local
    }
    const reqKey = STORAGE_KEYS.userRequestsKey(recipientClean)
    const pendingReqs = storage.get(reqKey, [])
    const updatedReqs = pendingReqs.filter((r) => r.id !== reqId)
    storage.set(reqKey, updatedReqs)
    return updatedReqs
  },

  // Cancelar solicitud de conexión enviada por el emisor
  async cancelConnectionRequest(senderUsername, targetUsername, currentSenderChats) {
    const senderClean = senderUsername.toLowerCase()
    const targetClean = targetUsername.toLowerCase()

    try {
      await api.post('/chats/cancel', {
        senderUsername: senderClean,
        targetUsername: targetClean
      })
    } catch {
      // Fallback local
    }

    const chatId = `chat_${targetClean}`
    const updatedChats = currentSenderChats.filter((c) => c.id !== chatId)
    this.saveChats(updatedChats, senderClean)

    // Eliminar la solicitud de la bandeja del destinatario si estaba local
    const recipientKey = STORAGE_KEYS.userRequestsKey(targetClean)
    const pendingReqs = storage.get(recipientKey, [])
    storage.set(recipientKey, pendingReqs.filter((r) => r.fromUser.username.toLowerCase() !== senderClean))

    return updatedChats
  },

  // Bloquear usuario desde una solicitud recibida
  async blockUserRequest(req, recipientUsername) {
    const recipientClean = recipientUsername.toLowerCase()
    const senderClean = req.fromUser.username.toLowerCase()

    try {
      await api.post('/chats/block', {
        reqId: req.id,
        recipientUsername: recipientClean,
        senderUsername: senderClean
      })
    } catch {
      // Fallback local
    }

    const reqKey = STORAGE_KEYS.userRequestsKey(recipientClean)
    const pendingReqs = storage.get(reqKey, [])
    const updatedReqs = pendingReqs.filter((r) => r.id !== req.id)
    storage.set(reqKey, updatedReqs)
    return updatedReqs
  }
}
