import { Router } from 'express'

const router = Router()

/**
 * GET /api/health
 * Endpoint de prueba de vida y validación de comunicación Front ↔ Back
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Servidor Backend de Nexu conectado y operando con éxito.',
    server: 'Nexu API v1.0',
    protocol: 'Curve25519 · AES-256-GCM',
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/public/check-alias?alias=xxx
 * Verificación reactiva de disponibilidad de alias para la Landing
 */
router.get('/check-alias', (req, res) => {
  const { alias } = req.query
  const clean = (alias || '').trim().replace(/^@/, '').toLowerCase()

  if (!clean || clean.length < 3 || clean.length > 10) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'El alias debe tener entre 3 y 10 caracteres alfanuméricos.'
    })
  }

  // Simulación de alias ocupado para adminUser
  const isTaken = clean === 'adminuser'

  res.status(200).json({
    success: true,
    available: !isTaken,
    alias: clean,
    formatted: `@${clean}`,
    message: isTaken ? 'Identificador sellado por otro usuario.' : 'Identificador libre para reclamar.'
  })
})

/**
 * GET /api/public/network-stats
 * Métricas públicas de escasez matemática y estado de la red
 */
router.get('/network-stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      protocolVersion: 'v1.0.0',
      totalRegisteredAliases: 14208,
      phoneNumbersRequired: 0,
      activeNodes: 2340,
      encryption: 'Punto a Punto'
    }
  })
})

export default router
