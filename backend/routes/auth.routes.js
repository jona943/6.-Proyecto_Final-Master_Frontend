import { Router } from 'express'

const router = Router()

/**
 * POST /api/auth/login
 * Responsable: Rosy (Módulo de Autenticación)
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Usuario y contraseña requeridos.'
    })
  }

  // Mock de respuesta para la siguiente fase
  res.status(200).json({
    success: true,
    message: 'Autenticación exitosa (Ruta base lista).',
    data: {
      username,
      token: `mock_jwt_token_${Date.now()}`
    }
  })
})

/**
 * POST /api/auth/register
 * Responsable: Rosy (Módulo de Autenticación)
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body

  res.status(201).json({
    success: true,
    message: 'Usuario registrado exitosamente (Ruta base lista).',
    data: { username }
  })
})

export default router
