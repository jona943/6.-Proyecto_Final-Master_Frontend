import { Router } from 'express'
import {
  searchUsers,
  getUserProfile,
  updateUserProfile,
  get2FAStatus,
  setup2FA,
  enable2FA,
  disable2FA
} from '../controllers/user.controller.js'

const router = Router()

/**
 * Rutas de Perfil y Busqueda de Usuarios
 */
router.get('/search', searchUsers)
router.get('/profile', getUserProfile)
router.put('/profile', updateUserProfile)

/**
 * Rutas de Seguridad 2FA
 */
router.get('/2fa/status', get2FAStatus)
router.post('/2fa/setup', setup2FA)
router.post('/2fa/enable', enable2FA)
router.post('/2fa/disable', disable2FA)

export default router
