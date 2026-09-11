import ConnectionRequest from '../models/ConnectionRequest.js'
import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'

/**
 * GET /api/chats/sync?username=xxx
 * Sincronización en vivo de solicitudes, usuarios activos y mensajes
 */
export const syncSession = async (req, res) => {
  try {
    const rawUser = req.query.username || ''
    const clean = rawUser.trim().replace(/^@/, '').toLowerCase()

    if (!clean) {
      return res.status(400).json({ success: false, message: 'username requerido' })
    }

    // Evitar caché agresivo en navegadores o CDNs (Render/Vercel)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.set('Pragma', 'no-cache')
    res.set('Expires', '0')

    // Actualizar última conexión (Punto Verde)
    await User.findOneAndUpdate({ username: clean }, { lastActive: new Date() })

    // 1. Solicitudes de conexión entrantes pendientes
    const pendingDocs = await ConnectionRequest.find({
      targetUsername: clean,
      status: 'pending'
    }).sort({ createdAt: -1 })

    const incomingRequests = pendingDocs.map((doc) => ({
      id: doc._id.toString(),
      fromUser: {
        username: doc.senderUsername,
        name: `@${doc.senderUsername}`,
        handle: `@${doc.senderUsername}`,
        avatar: doc.senderUsername.slice(0, 2).toUpperCase()
      },
      time: 'Reciente',
      status: 'pending'
    }))

    // 2. Conexiones aceptadas (donde el usuario es emisor o receptor)
    const acceptedDocs = await ConnectionRequest.find({
      status: 'accepted',
      $or: [{ senderUsername: clean }, { targetUsername: clean }]
    })

    const acceptedUsernames = acceptedDocs.map((doc) =>
      doc.senderUsername === clean ? doc.targetUsername : doc.senderUsername
    )

    // Consultar el estado "online" y datos adicionales de los usuarios aceptados
    const activeThreshold = new Date(Date.now() - 15 * 1000)
    const activeUsers = await User.find({
      username: { $in: acceptedUsernames }
    }).select('username lastActive avatarUrl displayName')

    const onlineSet = new Set(activeUsers.filter((u) => u.lastActive >= activeThreshold).map((u) => u.username))

    const acceptedUsers = acceptedUsernames.map((username) => {
      const dbUser = activeUsers.find((u) => u.username === username)
      return {
        username,
        isOnline: onlineSet.has(username),
        avatarUrl: dbUser?.avatarUrl || null,
        displayName: dbUser?.displayName || null
      }
    })

    // 3. Mensajes recientes 1 a 1
    const messagesDocs = await ChatMessage.find({
      $or: [{ senderUsername: clean }, { recipientUsername: clean }]
    }).sort({ createdAt: 1 })

    const formattedMessages = messagesDocs.map((msg) => ({
      id: msg._id.toString(),
      senderUsername: msg.senderUsername,
      recipientUsername: msg.recipientUsername,
      sender: msg.senderUsername === clean ? 'me' : 'them',
      text: msg.text,
      time: msg.time,
      status: msg.status,
      ...(msg.attachment && { attachment: msg.attachment }),
      createdAt: msg.createdAt
    }))

    return res.status(200).json({
      success: true,
      sync: {
        incomingRequests,
        acceptedUsers,
        messages: formattedMessages
      }
    })
  } catch (error) {
    console.error('Error en syncSession:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al sincronizar chats con el servidor.'
    })
  }
}

/**
 * POST /api/chats/message
 * Enviar mensaje 1 a 1
 */
export const sendMessage = async (req, res) => {
  try {
    const { senderUsername, recipientUsername, text, attachment } = req.body || {}
    const sender = (senderUsername || '').trim().toLowerCase()
    const recipient = (recipientUsername || '').trim().toLowerCase()

    if (!sender || !recipient || (!text?.trim() && !attachment)) {
      return res.status(400).json({
        success: false,
        message: 'senderUsername, recipientUsername, y (text o attachment) son requeridos.'
      })
    }

    const newMessage = new ChatMessage({
      senderUsername: sender,
      recipientUsername: recipient,
      text: text?.trim() || '',
      attachment: attachment || null
    })

    await newMessage.save()

    res.status(201).json({
      success: true,
      message: 'Mensaje guardado exitosamente.',
      data: newMessage
    })
  } catch (error) {
    console.error('Error en sendMessage:', error.message)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
}

/**
 * POST /api/chats/read
 * Marcar mensajes como leídos
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { readerUsername, senderUsername } = req.body || {}
    const reader = (readerUsername || '').trim().toLowerCase()
    const sender = (senderUsername || '').trim().toLowerCase()

    if (reader && sender) {
      await ChatMessage.updateMany(
        { senderUsername: sender, recipientUsername: reader, status: { $ne: 'read' } },
        { status: 'read' }
      )
    }

    return res.status(200).json({
      success: true,
      message: 'Mensajes marcados como leídos.'
    })
  } catch (error) {
    console.error('Error en markMessagesAsRead:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos.'
    })
  }
}

/**
 * POST /api/chats/clear
 * Vaciar mensajes de un chat para ambos participantes
 */
export const clearMessages = async (req, res) => {
  try {
    const { targetUsername, currentUser } = req.body
    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    await ChatMessage.deleteMany({
      $or: [
        { senderUsername: currentUser, recipientUsername: targetUsername },
        { senderUsername: targetUsername, recipientUsername: currentUser }
      ]
    })

    res.json({ success: true, message: 'Mensajes eliminados correctamente para ambos' })
  } catch (error) {
    console.error('Error en clearMessages:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
}

/**
 * POST /api/chats/delete-contact
 * Eliminar contacto y mensajes en ambas direcciones
 */
export const deleteContact = async (req, res) => {
  try {
    const { targetUsername, currentUser } = req.body
    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    // 1. Borrar mensajes
    await ChatMessage.deleteMany({
      $or: [
        { senderUsername: currentUser, recipientUsername: targetUsername },
        { senderUsername: targetUsername, recipientUsername: currentUser }
      ]
    })

    // 2. Borrar conexión
    await ConnectionRequest.deleteMany({
      $or: [
        { senderUsername: currentUser, targetUsername: targetUsername },
        { senderUsername: targetUsername, targetUsername: currentUser }
      ]
    })

    res.json({ success: true, message: 'Contacto y mensajes eliminados correctamente' })
  } catch (error) {
    console.error('Error en deleteContact:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
}
