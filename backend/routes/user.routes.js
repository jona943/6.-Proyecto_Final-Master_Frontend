import { Router } from 'express'

const router = Router()

/**
 * GET /api/user/profile
 * Responsable: Víctor (Módulo de Perfil)
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
 * Responsable: Víctor (Módulo de Perfil)
 */
router.put('/profile', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Perfil actualizado con éxito (Ruta base lista).',
    updated: req.body
  })
})

export default router
