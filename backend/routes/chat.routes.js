import { Router } from 'express'
import ConnectionRequest from '../models/ConnectionRequest.js'
import ChatMessage from '../models/ChatMessage.js'
import User from '../models/User.js'

const router = Router()

/**
 * GET /api/chats/sync?username=xxx
 * Sincronización en vivo de solicitudes aceptadas, entrantes y mensajes 1 a 1 en MongoDB Atlas
 */
router.get('/sync', async (req, res) => {
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

    const onlineSet = new Set(activeUsers.filter(u => u.lastActive >= activeThreshold).map(u => u.username))

    const acceptedUsers = acceptedUsernames.map(username => {
      const dbUser = activeUsers.find(u => u.username === username)
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
    console.error('Error en /api/chats/sync:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al sincronizar chats con el servidor.'
    })
  }
})

/**
 * POST /api/chats/request
 * Enviar solicitud de conexión en MongoDB Atlas
 */
router.post('/request', async (req, res) => {
  try {
    const { senderUsername, targetUsername } = req.body || {}
    if (!senderUsername || !targetUsername) {
      return res.status(400).json({
        success: false,
        message: 'senderUsername y targetUsername son requeridos.'
      })
    }

    const sender = senderUsername.trim().toLowerCase()
    const target = targetUsername.trim().toLowerCase()

    if (sender === target) {
      return res.status(400).json({
        success: false,
        message: 'No puedes enviarte una solicitud a ti mismo.'
      })
    }

    const targetExists = await User.findOne({ username: target })
    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `El usuario @${target} no se encuentra registrado.`
      })
    }

    const requestDoc = await ConnectionRequest.findOneAndUpdate(
      { senderUsername: sender, targetUsername: target },
      { status: 'pending' },
      { upsert: true, new: true }
    )

    return res.status(201).json({
      success: true,
      message: `Solicitud de conexión enviada exitosamente a @${target}.`,
      data: requestDoc
    })
  } catch (error) {
    console.error('Error en /api/chats/request:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor al enviar solicitud de conexión.'
    })
  }
})

/**
 * GET /api/chats/requests?username=xxx
 * Obtener solicitudes de conexión pendientes
 */
router.get('/requests', async (req, res) => {
  try {
    const raw = req.query.username || ''
    const clean = raw.trim().toLowerCase()

    if (!clean) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere el parámetro username.'
      })
    }

    const pendingDocs = await ConnectionRequest.find({
      targetUsername: clean,
      status: 'pending'
    }).sort({ createdAt: -1 })

    const formattedRequests = pendingDocs.map((doc) => ({
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

    return res.status(200).json({
      success: true,
      requests: formattedRequests
    })
  } catch (error) {
    console.error('Error en /api/chats/requests:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al consultar solicitudes.'
    })
  }
})

/**
 * POST /api/chats/accept
 * Aceptar solicitud de conexión en MongoDB Atlas
 */
router.post('/accept', async (req, res) => {
  try {
    const { reqId, recipientUsername, senderUsername } = req.body || {}
    const recipientClean = (recipientUsername || '').trim().toLowerCase()
    const senderClean = (senderUsername || '').trim().toLowerCase()

    if (reqId) {
      await ConnectionRequest.findByIdAndUpdate(reqId, { status: 'accepted' })
    }
    if (recipientClean && senderClean) {
      await ConnectionRequest.findOneAndUpdate(
        { senderUsername: senderClean, targetUsername: recipientClean },
        { status: 'accepted' }
      )
    }

    return res.status(200).json({
      success: true,
      message: 'Solicitud de conexión aceptada exitosamente.'
    })
  } catch (error) {
    console.error('Error en /api/chats/accept:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al aceptar solicitud en el servidor.'
    })
  }
})

/**
 * POST /api/chats/reject
 * Rechazar solicitud de conexión en MongoDB Atlas
 */
router.post('/reject', async (req, res) => {
  try {
    const { reqId } = req.body || {}
    if (reqId) {
      await ConnectionRequest.findByIdAndUpdate(reqId, { status: 'rejected' })
    }

    return res.status(200).json({
      success: true,
      message: 'Solicitud de conexión rechazada.'
    })
  } catch (error) {
    console.error('Error en /api/chats/reject:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud.'
    })
  }
})

/**
 * POST /api/chats/cancel
 * Cancelar solicitud enviada
 */
router.post('/cancel', async (req, res) => {
  try {
    const { senderUsername, targetUsername } = req.body || {}
    const sender = (senderUsername || '').trim().toLowerCase()
    const target = (targetUsername || '').trim().toLowerCase()

    if (sender && target) {
      await ConnectionRequest.deleteMany({
        senderUsername: sender,
        targetUsername: target,
        status: 'pending'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Solicitud de conexión cancelada.'
    })
  } catch (error) {
    console.error('Error en /api/chats/cancel:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar solicitud.'
    })
  }
})

/**
 * POST /api/chats/block
 * Bloquear usuario en MongoDB Atlas
 */
router.post('/block', async (req, res) => {
  try {
    const { reqId, recipientUsername, senderUsername } = req.body || {}
    const recipient = (recipientUsername || '').trim().toLowerCase()
    const sender = (senderUsername || '').trim().toLowerCase()

    if (reqId) {
      await ConnectionRequest.findByIdAndUpdate(reqId, { status: 'rejected' })
    }
    if (recipient && sender) {
      await ConnectionRequest.deleteMany({
        $or: [
          { senderUsername: sender, targetUsername: recipient },
          { senderUsername: recipient, targetUsername: sender }
        ]
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Usuario bloqueado.'
    })
  } catch (error) {
    console.error('Error en /api/chats/block:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al bloquear usuario.'
    })
  }
})

/**
 * POST /api/chats/message
 * Enviar mensaje 1 a 1 a través de MongoDB Atlas
 */
router.post('/message', async (req, res) => {
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
    console.error('Error POST /chats/message:', error.message)
    res.status(500).json({ success: false, message: 'Error interno.' })
  }
})

/**
 * POST /api/chats/read
 * Marcar mensajes recibidos como leídos (Visto / ✓✓ Azul) en MongoDB Atlas
 */
router.post('/read', async (req, res) => {
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
    console.error('Error en /api/chats/read:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al marcar mensajes como leídos.'
    })
  }
})


// VACIAR MENSAJES DE UN CHAT
router.post('/clear', async (req, res) => {
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
    console.error('Error al vaciar chat:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

// ELIMINAR CONTACTO Y CONVERSACION COMPLETA
router.post('/delete-contact', async (req, res) => {
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

    // 2. Borrar conexión (cualquiera de los dos sentidos)
    await ConnectionRequest.deleteMany({
      $or: [
        { senderUsername: currentUser, targetUsername: targetUsername },
        { senderUsername: targetUsername, targetUsername: currentUser }
      ]
    })

    res.json({ success: true, message: 'Contacto y mensajes eliminados correctamente' })
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

export default router

