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
router.get(['/check-alias', '/public/check-alias'], (req, res) => {
  const { alias } = req.query
  const raw = (alias || '').trim().replace(/^@/, '')

  // 1. Regla: Rechazar explícitamente la Ñ o caracteres con acento
  if (/[ñÑáéíóúÁÉÍÓÚ]/.test(raw)) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'No se permite la letra Ñ ni caracteres con acento.'
    })
  }

  // 2. Validar formato: mayúsculas, minúsculas, números, guion (-) y guion bajo (_)
  const regexValido = /^[a-zA-Z0-9_-]+$/
  if (!regexValido.test(raw)) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'Solo se permiten letras, números, guión bajo (_) y guión (-).'
    })
  }

  // 3. Validar longitud (de 3 a 10 caracteres)
  if (raw.length < 3 || raw.length > 10) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'El alias debe tener entre 3 y 10 caracteres.'
    })
  }

  const clean = raw.toLowerCase()

  // 4. Usuarios ocupados del sistema (@adminUser y @rosi_master)
  const usuariosOcupados = ['adminuser', 'rosi_master']
  const isTaken = usuariosOcupados.includes(clean)

  if (isTaken) {
    return res.status(200).json({
      success: true,
      available: false,
      alias: clean,
      formatted: `@${raw}`,
      message: 'Este identificador ya ha sido sellado por otro usuario.'
    })
  }

  // 5. Identificador libre para reclamar
  res.status(200).json({
    success: true,
    available: true,
    alias: clean,
    formatted: `@${raw}`,
    message: 'Identificador libre para reclamar.'
  })
})

/**
 * GET /api/public/network-stats
 * Métricas públicas de escasez matemática y estado de la red
 */
router.get(['/network-stats', '/public/network-stats'], (req, res) => {
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
