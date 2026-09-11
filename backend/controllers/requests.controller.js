import ConnectionRequest from '../models/ConnectionRequest.js'
import User from '../models/User.js'

/**
 * POST /api/chats/request
 * Enviar solicitud de conexión
 */
export const sendRequest = async (req, res) => {
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

    // 1. ¿El otro usuario ya nos envió una solicitud pendiente?
    const incomingReverse = await ConnectionRequest.findOne({
      senderUsername: target,
      targetUsername: sender,
      status: 'pending'
    })

    if (incomingReverse) {
      return res.status(400).json({
        success: false,
        message: `El usuario @${target} ya te ha enviado una solicitud de conexión. Revisa tu bandeja de solicitudes para aceptarla.`
      })
    }

    // 2. ¿Ya existe una conexión activa (aceptada) entre ambos?
    const alreadyConnected = await ConnectionRequest.findOne({
      status: 'accepted',
      $or: [
        { senderUsername: sender, targetUsername: target },
        { senderUsername: target, targetUsername: sender }
      ]
    })

    if (alreadyConnected) {
      return res.status(400).json({
        success: false,
        message: `Ya tienes una conexión activa con @${target}.`
      })
    }

    // 3. ¿Ya le habíamos enviado una solicitud que aún está pendiente?
    const existingPending = await ConnectionRequest.findOne({
      senderUsername: sender,
      targetUsername: target,
      status: 'pending'
    })

    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: `Ya tienes una solicitud pendiente enviada a @${target}. Espera a que la acepte.`
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
    console.error('Error en sendRequest:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error en el servidor al enviar solicitud de conexión.'
    })
  }
}

/**
 * GET /api/chats/requests?username=xxx
 * Obtener solicitudes entrantes y salientes pendientes
 */
export const getRequests = async (req, res) => {
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

    const outgoingDocs = await ConnectionRequest.find({
      senderUsername: clean,
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

    const formattedOutgoing = outgoingDocs.map((doc) => ({
      id: doc._id.toString(),
      toUser: {
        username: doc.targetUsername,
        name: `@${doc.targetUsername}`,
        handle: `@${doc.targetUsername}`,
        avatar: doc.targetUsername.slice(0, 2).toUpperCase()
      },
      time: 'Reciente',
      status: 'pending'
    }))

    return res.status(200).json({
      success: true,
      requests: formattedRequests,
      outgoing: formattedOutgoing
    })
  } catch (error) {
    console.error('Error en getRequests:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al consultar solicitudes.'
    })
  }
}

/**
 * POST /api/chats/accept
 * Aceptar solicitud de conexión
 */
export const acceptRequest = async (req, res) => {
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
    console.error('Error en acceptRequest:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al aceptar solicitud en el servidor.'
    })
  }
}

/**
 * POST /api/chats/reject
 * Rechazar solicitud de conexión
 */
export const rejectRequest = async (req, res) => {
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
    console.error('Error en rejectRequest:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al rechazar solicitud.'
    })
  }
}

/**
 * POST /api/chats/cancel
 * Cancelar solicitud enviada (soporta reqId o tupla de usuarios)
 */
export const cancelRequest = async (req, res) => {
  try {
    const { reqId, senderUsername, targetUsername } = req.body || {}

    if (reqId) {
      await ConnectionRequest.findByIdAndDelete(reqId)
    } else if (senderUsername && targetUsername) {
      const sender = senderUsername.trim().toLowerCase()
      const target = targetUsername.trim().toLowerCase()
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
    console.error('Error en cancelRequest:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al cancelar solicitud.'
    })
  }
}

/**
 * POST /api/chats/block
 * Bloquear usuario y remover conexiones
 */
export const blockUser = async (req, res) => {
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
    console.error('Error en blockUser:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al bloquear usuario.'
    })
  }
}
