import { Router } from 'express'
import {
  registerUser,
  loginUser,
  verify2FALogin
} from '../controllers/auth.controller.js'

const router = Router()

/**
 * Rutas de Autenticacion y Registro
 */
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/login-2fa', verify2FALogin)

export default router
