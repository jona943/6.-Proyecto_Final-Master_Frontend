import { Router } from 'express'
import {
  syncSession,
  sendMessage,
  markMessagesAsRead,
  clearMessages,
  deleteContact
} from '../controllers/chat.controller.js'
import {
  sendRequest,
  getRequests,
  acceptRequest,
  rejectRequest,
  cancelRequest,
  blockUser
} from '../controllers/requests.controller.js'

const router = Router()

// ============================================================================
// RUTAS DE MENSAJERÍA Y SESIÓN
// ============================================================================
router.get('/sync', syncSession)
router.post('/message', sendMessage)
router.post('/read', markMessagesAsRead)
router.post('/clear', clearMessages)
router.post('/delete-contact', deleteContact)

// ============================================================================
// RUTAS DE SOLICITUDES Y CONEXIONES
// ============================================================================
router.post('/request', sendRequest)
router.get('/requests', getRequests)
router.post('/accept', acceptRequest)
router.post('/reject', rejectRequest)
router.post('/cancel', cancelRequest)
router.post('/block', blockUser)

export default router
