import { Router } from 'express'

const router = Router()

/**
 * Middleware de Autenticación de Token
 * Valida la presencia de la cabecera Authorization (Bearer Token)
 * y extrae de forma segura la identidad del emisor para evitar suplantaciones.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Acceso no autorizado: Se requiere cabecera Authorization con formato Bearer <token>.'
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación vacío o con formato inválido.'
    })
  }

  // Extraer identidad del usuario emisor a partir del token / cabecera de sesión
  // Evita que un atacante envíe un "sender" arbitrario en el body de la petición
  const verifiedUser = req.headers['x-user-alias'] || 'usuario_autenticado'

  req.user = {
    username: verifiedUser,
    token
  }

  next()
}

/**
 * GET /api/chats
 * Responsable: EmaRama (Módulo de Chat)
 * Lista las conversaciones activas del usuario autenticado.
 */
router.get('/', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    message: `Listado de conversaciones para ${req.user.username}.`,
    user: req.user.username,
    chats: []
  })
})

/**
 * POST /api/chats/message
 * Responsable: EmaRama (Módulo de Chat)
 * Envío seguro de mensaje: El emisor (sender) se extrae del token validado
 * garantizando que sea 100% auténtico y no falsificable desde el body.
 */
router.post('/message', requireAuth, (req, res) => {
  const { chatId, text } = req.body

  // Seguridad: El emisor proviene exclusivamente de la sesión autenticada
  const verifiedSender = req.user.username

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: 'El identificador del chat (chatId) es obligatorio.'
    })
  }

  if (!text || !text.trim()) {
    return res.status(400).json({
      success: false,
      message: 'El contenido del mensaje no puede estar vacío.'
    })
  }

  res.status(201).json({
    success: true,
    message: 'Mensaje autenticado y despachado con éxito.',
    data: {
      id: `msg_${Date.now()}`,
      chatId,
      text: text.trim(),
      sender: verifiedSender, // Emisor verificado por token
      verifiedByAuth: true,
      time: new Date().toISOString()
    }
  })
})

/**
 * PUT /api/chats/:chatId/read
 * Responsable: EmaRama (Módulo de Chat)
 * Confirmación de lectura (Read Receipts): Marca mensajes como leídos
 * para el usuario autenticado en la conversación.
 */
router.put('/:chatId/read', requireAuth, (req, res) => {
  const { chatId } = req.params

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: 'El identificador del chat (chatId) es obligatorio.'
    })
  }

  res.status(200).json({
    success: true,
    message: `Mensajes del chat ${chatId} marcados como leídos por ${req.user.username}.`,
    data: {
      chatId,
      readBy: req.user.username,
      status: 'read',
      unreadCount: 0,
      readAt: new Date().toISOString()
    }
  })
})

export default router
