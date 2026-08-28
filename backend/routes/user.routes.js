import { Router } from 'express'
import User from '../models/User.js'

const router = Router()

/**
 * GET /api/user/search?q=query&currentUsername=userA
 * Búsqueda de usuarios en tiempo real en MongoDB Atlas (Coincidencia exacta y sugerencias similares)
 */
router.get('/search', async (req, res) => {
  try {
    const raw = req.query.q || ''
    const clean = raw.trim().replace(/^@/, '').toLowerCase()
    const currentUser = (req.query.currentUsername || '').trim().toLowerCase()

    if (!clean || clean.length < 1) {
      return res.status(200).json({
        success: true,
        exactMatch: null,
        suggestions: []
      })
    }

    // Buscar usuarios en MongoDB Atlas que coincidan totalmente o parcialmente
    const regexPattern = new RegExp(clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    const matchedDocs = await User.find({
      username: { $regex: regexPattern },
      username: { $ne: currentUser }
    }).select('username displayName role').limit(6)

    const formattedUsers = matchedDocs.map((u) => ({
      username: u.username,
      name: u.displayName || `@${u.username}`,
      handle: `@${u.username}`,
      role: u.role === 'admin' ? 'System Admin' : 'Usuario Nexu',
      avatar: (u.displayName || u.username).replace(/^@/, '').slice(0, 2).toUpperCase(),
      status: 'offline',
      statusText: 'Usuario Registrado'
    }))

    const exactMatch = formattedUsers.find((u) => u.username === clean) || null
    const suggestions = formattedUsers.filter((u) => u.username !== clean)

    return res.status(200).json({
      success: true,
      exactMatch,
      suggestions
    })
  } catch (error) {
    console.error('Error en /api/user/search:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios en la base de datos.'
    })
  }
})

/**
 * GET /api/user/profile
 * Perfil de usuario
 */
router.get('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Perfil de usuario (Ruta base lista).',
    profile: {
      displayName: 'Administrador Nexu',
      username: 'adminUser',
      avatarType: 'male'
    }
  })
})

/**
 * PUT /api/user/profile
 * Actualizar perfil de usuario
 */
router.put('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Perfil actualizado con éxito.',
    updated: req.body
  })
})

export default router
