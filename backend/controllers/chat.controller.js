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

    // Limpiar payloads efímeros que hayan expirado (> 24h) garantizando política de cero retención
    await ChatMessage.updateMany(
      { 'attachment.expiresAt': { $lte: new Date() }, 'attachment.encryptedPayload': { $ne: null } },
      { $set: { 'attachment.encryptedPayload': null, 'attachment.ephemeralExpired': true } }
    ).catch(() => {})

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

    // 3. Actualizar mensajes pendientes de entrega para el receptor a 'delivered' (✓✓)
    await ChatMessage.updateMany(
      { recipientUsername: clean, status: 'sent' },
      { status: 'delivered' }
    )

    // 4. Mensajes recientes 1 a 1 (excluyendo los que el usuario haya vaciado)
    const messagesDocs = await ChatMessage.find({
      $or: [{ senderUsername: clean }, { recipientUsername: clean }],
      deletedFor: { $ne: clean }
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

    // Verificar si existe una conexión aceptada activa entre ambos
    const activeConnection = await ConnectionRequest.findOne({
      status: 'accepted',
      $or: [
        { senderUsername: sender, targetUsername: recipient },
        { senderUsername: recipient, targetUsername: sender }
      ]
    })

    if (!activeConnection) {
      return res.status(403).json({
        success: false,
        message: 'No puedes enviar mensajes porque no tienes una conexión activa con este usuario.'
      })
    }

    let finalAttachment = null
    if (attachment) {
      finalAttachment = {
        ...attachment,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h de permanencia efímera en tránsito
      }
    }

    const newMessage = new ChatMessage({
      senderUsername: sender,
      recipientUsername: recipient,
      text: text?.trim() || '',
      attachment: finalAttachment,
      status: 'sent'
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
 * Marcar mensajes como leídos y vaciar archivos efímeros entregados
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

      // Eliminación física del payload efímero una vez entregado/leído
      await ChatMessage.updateMany(
        {
          senderUsername: sender,
          recipientUsername: reader,
          'attachment.encryptedPayload': { $exists: true, $ne: null }
        },
        {
          $set: {
            'attachment.encryptedPayload': null,
            'attachment.ephemeralCleared': true,
            'attachment.clearedAt': new Date()
          }
        }
      ).catch(() => {})
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
 * Vaciar mensajes de un chat únicamente para el usuario solicitante
 */
export const clearMessages = async (req, res) => {
  try {
    const { targetUsername, currentUser } = req.body
    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    const cleanCurrent = currentUser.trim().toLowerCase()
    const cleanTarget = targetUsername.trim().toLowerCase()

    await ChatMessage.updateMany(
      {
        $or: [
          { senderUsername: cleanCurrent, recipientUsername: cleanTarget },
          { senderUsername: cleanTarget, recipientUsername: cleanCurrent }
        ]
      },
      {
        $addToSet: { deletedFor: cleanCurrent }
      }
    )

    res.json({ success: true, message: 'Mensajes eliminados de tu conversación' })
  } catch (error) {
    console.error('Error en clearMessages:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
}

/**
 * POST /api/chats/delete-contact
 * Eliminar conexión y ocultar mensajes para el usuario solicitante
 */
export const deleteContact = async (req, res) => {
  try {
    const { targetUsername, currentUser } = req.body
    if (!currentUser) return res.status(400).json({ success: false, message: 'Usuario actual requerido' })

    if (!targetUsername) {
      return res.status(400).json({ success: false, message: 'Usuario objetivo requerido' })
    }

    const cleanCurrent = currentUser.trim().toLowerCase()
    const cleanTarget = targetUsername.trim().toLowerCase()

    // 1. Ocultar mensajes para quien eliminó el contacto
    await ChatMessage.updateMany(
      {
        $or: [
          { senderUsername: cleanCurrent, recipientUsername: cleanTarget },
          { senderUsername: cleanTarget, recipientUsername: cleanCurrent }
        ]
      },
      { $addToSet: { deletedFor: cleanCurrent } }
    )

    // 2. Borrar conexión entre ambos
    await ConnectionRequest.deleteMany({
      $or: [
        { senderUsername: cleanCurrent, targetUsername: cleanTarget },
        { senderUsername: cleanTarget, targetUsername: cleanCurrent }
      ]
    })

    res.json({ success: true, message: 'Contacto eliminado correctamente' })
  } catch (error) {
    console.error('Error en deleteContact:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
}
