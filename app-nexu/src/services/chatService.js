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

  async clearMessages(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chats/clear', { targetUsername: targetUser, currentUser });
      return res.success;
    } catch (e) {
      console.error('Error clearing messages:', e);
      return false;
    }
  },

  async deleteContact(currentUser, targetUser) {
    if (targetUser === '@nexu_assistant' || targetUser === 'chat_bot') return true;
    try {
      const res = await api.post('/chats/delete-contact', { targetUsername: targetUser, currentUser });
      return res.success;
    } catch (e) {
      console.error('Error deleting contact:', e);
      return false;
    }
  },

  // Obtener lista de chats
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
  async sendMessage(chats, chatId, text, sender = 'me', username = 'guest', attachment = null) {
    const now = new Date()
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const cleanUser = (username || 'guest').trim().toLowerCase()

    const targetChat = chats.find((c) => c.id === chatId)
    const targetUsername = targetChat?.handle ? targetChat.handle.replace(/^@/, '').toLowerCase() : ''

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender,
      text: text?.trim() || '',
      time: timeFormatted,
      status: sender === 'me' ? 'sent' : 'read',
      ...(attachment && { attachment })
    }

    if (targetUsername && !targetChat?.isBot) {
      try {
        const res = await api.post('/chats/message', {
          senderUsername: cleanUser,
          recipientUsername: targetUsername,
          text: text?.trim() || '',
          attachment
        })
        const realId = res?.data?._id || res?.data?.data?._id
        if (realId) {
          newMessage.id = realId.toString()
        }
      } catch {
        // En un entorno de producción, aquí se manejaría una cola de reintentos
      }
    }

    // Actualización optimista en memoria (y mover el chat al inicio)
    const updated = [...chats]
    const chatIndex = updated.findIndex((c) => c.id === chatId)
    
    if (chatIndex > -1) {
      const updatedChat = {
        ...updated[chatIndex],
        messages: [...updated[chatIndex].messages, newMessage]
      }
      updated.splice(chatIndex, 1)
      updated.unshift(updatedChat)
    }

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

  // Auto-respuesta
  async getAutoReply(chats, chatId, userMessageOrAnswer) {
    const targetChat = chats.find((c) => c.id === chatId)
    let replyText = ''

    if (targetChat?.isBot) {
      // Si nos pasan una respuesta directa (ej. de Gemini API), úsala
      if (userMessageOrAnswer && userMessageOrAnswer.length > 0) {
        replyText = userMessageOrAnswer
      } else {
        const randomIndex = Math.floor(Math.random() * BOT_RESPONSES.length)
        replyText = BOT_RESPONSES[randomIndex]
      }
    } else {
      replyText = `Recibido: "${userMessageOrAnswer}". Respuesta registrada en el hilo privado.`
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

  async getRequests(username) {
    const clean = (username || '').trim().toLowerCase()
    if (!clean) return { incoming: [], outgoing: [] }

    try {
      const res = await api.get(`/chats/requests?username=${encodeURIComponent(clean)}`)
      if (res && res.success) {
        return {
          incoming: res.data.requests || [],
          outgoing: res.data.outgoing || []
        }
      }
    } catch (e) {
      console.error(e)
    }
    return { incoming: [], outgoing: [] }
  },

  async sendConnectionRequest(senderUsername, targetUser, currentSenderChats) {
    const senderClean = (senderUsername || '').toLowerCase()
    const targetClean = (typeof targetUser === 'string' ? targetUser : targetUser?.username || '').replace(/^@/, '').trim().toLowerCase()

    try {
      const res = await api.post('/chats/request', {
        senderUsername: senderClean,
        targetUsername: targetClean
      })
      if (!res || !res.success) {
        return {
          success: false,
          message: res?.error || res?.message || 'No se pudo enviar la solicitud',
          updatedChats: currentSenderChats
        }
      }
      return {
        success: true,
        message: res.data?.message || 'Solicitud enviada exitosamente',
        updatedChats: currentSenderChats,
        newChatId: null
      }
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Error de conexión',
        updatedChats: currentSenderChats
      }
    }
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

  async rejectConnectionRequest(reqId) {
    try {
      await api.post('/chats/reject', { reqId })
    } catch {
      // Backend inaccesible
    }
    return [] // Retornar vacio obliga al contexto a limpiar o actualizar en base a la RAM
  },

  async cancelConnectionRequest(reqId, currentUsername, targetUsername) {
    try {
      await api.post('/chats/cancel', {
        reqId,
        senderUsername: currentUsername,
        targetUsername
      })
      return true
    } catch (e) {
      console.error('Error cancelando solicitud:', e)
      return false
    }
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
