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

export default router
