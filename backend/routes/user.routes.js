import { Router } from 'express'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import {
  generateSecret,
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  verifyTotp,
  generateBackupCodes
} from '../utils/totp.js'

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
      username: { $regex: regexPattern, $ne: currentUser }
    }).select('username displayName role avatarUrl').limit(8)

    const formattedUsers = matchedDocs.map((u) => ({
      username: u.username,
      name: u.displayName || `@${u.username}`,
      handle: `@${u.username}`,
      role: u.role === 'admin' ? 'System Admin' : 'Usuario Nexu',
      avatar: (u.displayName || u.username).replace(/^@/, '').slice(0, 2).toUpperCase(),
      avatarUrl: u.avatarUrl || null,
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
router.get('/profile', async (req, res) => {
  try {
    const rawUser = req.query.username || ''
    const cleanUsername = rawUser.replace(/^@/, '').toLowerCase()

    if (!cleanUsername) {
      return res.status(400).json({ success: false, message: 'username requerido' })
    }

    const user = await User.findOne({ username: cleanUsername })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    res.status(200).json({
      success: true,
      profile: {
        displayName: user.displayName || user.username,
        username: user.username,
        avatarUrl: user.avatarUrl || null
      }
    })
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    res.status(500).json({ success: false, message: 'Error interno' })
  }
})

/**
 * PUT /api/user/profile
 * Actualizar perfil de usuario
 */
router.put('/profile', async (req, res) => {
  try {
    const { username, displayName, avatarUrl, avatarType, gender, bio } = req.body
    if (!username) {
      return res.status(400).json({ success: false, message: 'username es requerido' })
    }

    const cleanUsername = username.replace(/^@/, '').toLowerCase()

    const updatedUser = await User.findOneAndUpdate(
      { username: cleanUsername },
      { 
        $set: { 
          ...(displayName && { displayName }), 
          ...(avatarUrl !== undefined && { avatarUrl })
        } 
      },
      { new: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado con éxito.',
      updated: {
        ...req.body,
        avatarUrl: updatedUser.avatarUrl
      }
    })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    res.status(500).json({ success: false, message: 'Error interno al actualizar perfil' })
  }
})

/**
 * GET /api/user/2fa/status?username=xxx
 * Consulta si el usuario tiene el doble factor activado
 */
router.get('/2fa/status', async (req, res) => {
  try {
    const rawUser = req.query.username || ''
    const cleanUsername = rawUser.replace(/^@/, '').trim().toLowerCase()

    if (!cleanUsername) {
      return res.status(400).json({ success: false, message: 'username requerido' })
    }

    const user = await User.findOne({ username: cleanUsername })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    return res.status(200).json({
      success: true,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      backupCodesCount: user.twoFactorBackupCodes?.length || 0
    })
  } catch (error) {
    console.error('Error en /2fa/status:', error.message)
    res.status(500).json({ success: false, message: 'Error al consultar estado 2FA' })
  }
})

/**
 * POST /api/user/2fa/setup
 * Inicia la configuración de 2FA generando semilla Base32 y código QR
 */
router.post('/2fa/setup', async (req, res) => {
  try {
    const { username } = req.body || {}
    const cleanUsername = (username || '').replace(/^@/, '').trim().toLowerCase()

    if (!cleanUsername) {
      return res.status(400).json({ success: false, message: 'username es requerido' })
    }

    const user = await User.findOne({ username: cleanUsername })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    // 1. Generar nuevo secreto Base32
    const secret = generateSecret(20)

    // 2. Generar URI otpauth compatible con Google Authenticator, Aegis, Authy, etc.
    const otpAuthUri = generateOtpAuthUri(user.username, secret, 'Nexu')

    // 3. Generar código QR en Base64 DataURL
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri)

    return res.status(200).json({
      success: true,
      secret,
      otpAuthUri,
      qrCodeDataUrl,
      username: user.username
    })
  } catch (error) {
    console.error('Error en /2fa/setup:', error.message)
    res.status(500).json({ success: false, message: 'Error al iniciar configuración 2FA' })
  }
})

/**
 * POST /api/user/2fa/enable
 * Confirma y activa 2FA verificando el primer código TOTP generado por la app del usuario
 */
router.post('/2fa/enable', async (req, res) => {
  try {
    const { username, secret, code } = req.body || {}
    const cleanUsername = (username || '').replace(/^@/, '').trim().toLowerCase()

    if (!cleanUsername || !secret || !code) {
      return res.status(400).json({
        success: false,
        message: 'username, secret y code son requeridos.'
      })
    }

    const user = await User.findOne({ username: cleanUsername })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    // 1. Validar el código TOTP
    const isValid = verifyTotp(code.toString().trim(), secret)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código de verificación incorrecto. Revisa tu aplicación Authenticator y que la hora de tu teléfono esté sincronizada.'
      })
    }

    // 2. Generar 5 códigos de respaldo de un solo uso
    const backupCodes = generateBackupCodes(5)

    // 3. Guardar en base de datos
    user.twoFactorEnabled = true
    user.twoFactorSecret = secret
    user.twoFactorBackupCodes = backupCodes
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Autenticación en Dos Pasos activada exitosamente.',
      twoFactorEnabled: true,
      backupCodes
    })
  } catch (error) {
    console.error('Error en /2fa/enable:', error.message)
    res.status(500).json({ success: false, message: 'Error al activar 2FA' })
  }
})

/**
 * POST /api/user/2fa/disable
 * Desactiva 2FA previa validación de contraseña de seguridad
 */
router.post('/2fa/disable', async (req, res) => {
  try {
    const { username, password } = req.body || {}
    const cleanUsername = (username || '').replace(/^@/, '').trim().toLowerCase()

    if (!cleanUsername || !password) {
      return res.status(400).json({
        success: false,
        message: 'username y password son requeridos para desactivar 2FA.'
      })
    }

    const user = await User.findOne({ username: cleanUsername })
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' })
    }

    // Validar contraseña
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contraseña incorrecta. No se pudo desactivar 2FA.'
      })
    }

    user.twoFactorEnabled = false
    user.twoFactorSecret = ''
    user.twoFactorBackupCodes = []
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Autenticación en Dos Pasos desactivada.',
      twoFactorEnabled: false
    })
  } catch (error) {
    console.error('Error en /2fa/disable:', error.message)
    res.status(500).json({ success: false, message: 'Error al desactivar 2FA' })
  }
})

export default router
