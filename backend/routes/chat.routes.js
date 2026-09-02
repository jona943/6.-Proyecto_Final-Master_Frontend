import { Router } from 'express'

const router = Router()

/**
 * GET /api/chats
 * Responsable: EmaRama (Módulo de Chat)
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Listado de conversaciones (Ruta base lista).',
    chats: []
  })
})

/**
 * POST /api/chats/message
 * Responsable: EmaRama (Módulo de Chat)
 */
router.post('/message', (req, res) => {
  const { chatId, text, sender } = req.body

  res.status(201).json({
    success: true,
    message: 'Mensaje enviado correctamente (Ruta base lista).',
    data: { chatId, text, sender, time: new Date().toISOString() }
  })
})

/**
 * PUT /api/chats/:chatId/read
 * Responsable: EmaRama (Módulo de Chat)
 * Confirmación de lectura (Read Receipts): Marca mensajes como leídos y reinicia contador no leídos.
 */
router.put('/:chatId/read', (req, res) => {
  const { chatId } = req.params

  if (!chatId) {
    return res.status(400).json({
      success: false,
      message: 'El identificador del chat (chatId) es obligatorio.'
    })
  }

  res.status(200).json({
    success: true,
    message: `Mensajes del chat ${chatId} marcados como leídos exitosamente.`,
    data: {
      chatId,
      status: 'read',
      unreadCount: 0,
      readAt: new Date().toISOString()
    }
  })
})

export default router
