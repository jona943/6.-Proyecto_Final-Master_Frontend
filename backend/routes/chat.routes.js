import { Router } from 'express'
import ConnectionRequest from '../models/ConnectionRequest.js'
import User from '../models/User.js'

const router = Router()

/**
 * POST /api/chats/request
 * Enviar solicitud de conexión de un usuario a otro (Guardado en MongoDB Atlas)
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

    // Verificar si el destinatario existe en MongoDB Atlas
    const targetExists = await User.findOne({ username: target })
    if (!targetExists) {
      return res.status(404).json({
        success: false,
        message: `El usuario @${target} no se encuentra registrado.`
      })
    }

    // Guardar o actualizar la solicitud en MongoDB Atlas
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
 * Obtener solicitudes de conexión pendientes recibidas en MongoDB Atlas
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
      message: 'Error al consultar solicitudes en el servidor.'
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
    } else if (recipientClean && senderClean) {
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
 * Cancelar solicitud de conexión enviada en MongoDB Atlas
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
      message: 'Solicitud de conexión cancelada exitosamente.'
    })
  } catch (error) {
    console.error('Error en /api/chats/cancel:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar la solicitud.'
    })
  }
})

/**
 * POST /api/chats/block
 * Bloquear usuario y descartar cualquier solicitud activa en MongoDB Atlas
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
      message: 'Usuario bloqueado exitosamente.'
    })
  } catch (error) {
    console.error('Error en /api/chats/block:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al bloquear usuario.'
    })
  }
})

export default router
