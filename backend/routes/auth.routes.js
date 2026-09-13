import { Router } from 'express'
import {
  registerUser,
  loginUser,
  verify2FALogin,
  getSessions,
  closeSession
} from '../controllers/auth.controller.js'

const router = Router()

/**
 * Rutas de Autenticacion y Registro
 */
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/login-2fa', verify2FALogin)

/**
 * Rutas de Gestion de Dispositivos y Sesiones
 */
router.get('/sessions', getSessions)
router.delete('/sessions/:sessionId', closeSession)

export default router
