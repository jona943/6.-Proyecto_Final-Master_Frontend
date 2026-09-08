import api from './api'

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

export const chatService = {
  // Obtener lista de chats (sólo backend, sin persistencia en localStorage)
  async getChats(username = 'guest') {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return []

    try {
      const res = await api.get(`/chats/sync?username=${encodeURIComponent(clean)}`)
      if (res && res.success && res.data?.sync) {
        return res.data.sync
      }
    } catch {
      // Backend inaccesible
    }
    return []
  },

  // Enviar mensaje 1 a 1
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
        // En un entorno de producción, aquí se manejaría una cola de reintentos
      }
    }

    // Actualización optimista en memoria
    const updated = chats.map((c) => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: [...c.messages, newMessage]
        }
      }
      return c
    })

    return { updatedChats: updated, newMessage }
  },

  // Sincronizar en tiempo real
  async syncUserSession(username) {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return null

    try {
      const res = await api.get(`/chats/sync?username=${encodeURIComponent(clean)}`)
      if (res && res.success && res.data?.sync) {
        return res.data.sync
      }
    } catch {
      // Backend inaccesible
    }
    return null
  },

  // Auto-respuesta simulada en memoria
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

    return { updatedChats: updated, botMessage }
  },

  async searchUser(cleanAlias, currentUsername) {
    const clean = (cleanAlias || '').trim().replace(/^@/, '').toLowerCase()
    if (!clean) return { user: null, suggestions: [], error: '' }
    if (clean === (currentUsername || '').toLowerCase()) {
      return { user: null, suggestions: [], error: 'No puedes enviarte una solicitud a ti mismo.' }
    }

    try {
      const res = await api.searchUsers(clean, currentUsername)
      if (res && res.success && res.data) {
        const { exactMatch, suggestions } = res.data
        return {
          user: exactMatch,
          suggestions: suggestions || [],
          error: !exactMatch && (!suggestions || suggestions.length === 0) ? `El usuario @${clean} no fue encontrado.` : ''
        }
      }
    } catch {
      // Backend inaccesible
    }

    // Backup básico en memoria para MOCK
    const allUsers = MOCK_KNOWN_USERS.map(u => ({ ...u, username: u.username.toLowerCase() }))
      .filter((u) => u.username !== (currentUsername || '').toLowerCase())

    const exactMatch = allUsers.find((u) => u.username === clean) || null
    const suggestions = allUsers.filter((u) => u.username !== clean && u.username.includes(clean))

    return { user: exactMatch, suggestions, error: !exactMatch && suggestions.length === 0 ? `El usuario @${clean} no fue encontrado.` : '' }
  },

  async getIncomingRequests(username) {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return []

    try {
      const res = await api.get(`/chats/requests?username=${encodeURIComponent(clean)}`)
      if (res && res.success && Array.isArray(res.data?.requests)) {
        return res.data.requests
      }
    } catch {
      // Backend inaccesible
    }

    return []
  },

  async sendConnectionRequest(senderUsername, targetUser, currentSenderChats) {
    const senderClean = senderUsername.toLowerCase()
    const targetClean = targetUser.username.toLowerCase()

    try {
      await api.post('/chats/request', {
        senderUsername: senderClean,
        targetUsername: targetClean
      })
    } catch {
      // Backend inaccesible
    }

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
    return { updatedChats, newChatId: chatId }
  },

  async acceptConnectionRequest(req, recipientUsername, currentRecipientChats) {
    const recipientClean = recipientUsername.toLowerCase()
    const senderClean = req.fromUser.username.toLowerCase()

    try {
      await api.post('/chats/accept', {
        reqId: req.id,
        recipientUsername: recipientClean,
        senderUsername: senderClean
      })
    } catch {
      // Backend inaccesible
    }

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
    
    // Retornamos también updatedReqs vacío simulando que se eliminó localmente de la lista actual del contexto
    return { updatedRecipientChats, updatedReqs: [], newChatId: newChatForRecipient.id }
  },

  async rejectConnectionRequest(reqId, recipientUsername) {
    try {
      await api.post('/chats/reject', { reqId })
    } catch {
      // Backend inaccesible
    }
    return [] // Retornar vacío obliga al contexto a limpiar o actualizar en base a la RAM
  },

  async cancelConnectionRequest(senderUsername, targetUsername, currentSenderChats) {
    const senderClean = senderUsername.toLowerCase()
    const targetClean = targetUsername.toLowerCase()

    try {
      await api.post('/chats/cancel', {
        senderUsername: senderClean,
        targetUsername: targetClean
      })
    } catch {
      // Backend inaccesible
    }

    const chatId = `chat_${targetClean}`
    return currentSenderChats.filter((c) => c.id !== chatId)
  },

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
      // Backend inaccesible
    }
    return []
  },

  async markMessagesAsRead(readerUsername, senderUsername) {
    const reader = (readerUsername || '').trim().toLowerCase()
    const sender = (senderUsername || '').trim().toLowerCase()
    if (!reader || !sender) return

    try {
      await api.post('/chats/read', {
        readerUsername: reader,
        senderUsername: sender
      })
    } catch {
      // Backend inaccesible
    }
  }
}
