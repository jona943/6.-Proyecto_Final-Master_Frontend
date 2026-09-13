import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import {
  generateSecret,
  generateOtpAuthUri,
  generateQrCodeDataUrl,
  verifyTotp,
  generateBackupCodes
} from '../utils/totp.js'

/**
 * GET /api/user/search?q=query&currentUsername=userA
 * Busqueda de usuarios en tiempo real en MongoDB (Coincidencia exacta y sugerencias similares)
 */
export const searchUsers = async (req, res) => {
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

    // Buscar usuarios en MongoDB que coincidan total o parcialmente
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
    console.error('[Error en searchUsers]:', error.message)
    return res.status(500).json({
      success: false,
      message: 'Error al buscar usuarios en la base de datos.'
    })
  }
}

/**
 * GET /api/user/profile
 * Obtener perfil del usuario por username
 */
export const getUserProfile = async (req, res) => {
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
    console.error('[Error en getUserProfile]:', error.message)
    res.status(500).json({ success: false, message: 'Error interno al obtener perfil' })
  }
}

/**
 * PUT /api/user/profile
 * Actualizar perfil del usuario
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { username, displayName, avatarUrl } = req.body
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
      message: 'Perfil actualizado con exito.',
      updated: {
        ...req.body,
        avatarUrl: updatedUser.avatarUrl
      }
    })
  } catch (error) {
    console.error('[Error en updateUserProfile]:', error.message)
    res.status(500).json({ success: false, message: 'Error interno al actualizar perfil' })
  }
}

/**
 * GET /api/user/2fa/status?username=xxx
 * Consulta si el usuario tiene doble factor activado
 */
export const get2FAStatus = async (req, res) => {
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
    console.error('[Error en get2FAStatus]:', error.message)
    res.status(500).json({ success: false, message: 'Error al consultar estado 2FA' })
  }
}

/**
 * POST /api/user/2fa/setup
 * Inicia la configuracion de 2FA generando semilla Base32 y codigo QR
 */
export const setup2FA = async (req, res) => {
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

    // 2. Generar URI otpauth compatible con Google Authenticator, Aegis, etc.
    const otpAuthUri = generateOtpAuthUri(user.username, secret, 'Nexu')

    // 3. Generar codigo QR en Base64 DataURL
    const qrCodeDataUrl = await generateQrCodeDataUrl(otpAuthUri)

    return res.status(200).json({
      success: true,
      secret,
      otpAuthUri,
      qrCodeDataUrl,
      username: user.username
    })
  } catch (error) {
    console.error('[Error en setup2FA]:', error.message)
    res.status(500).json({ success: false, message: 'Error al iniciar configuracion 2FA' })
  }
}

/**
 * POST /api/user/2fa/enable
 * Confirma y activa 2FA verificando el primer codigo TOTP generado por la aplicacion
 */
export const enable2FA = async (req, res) => {
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

    // 1. Validar el codigo TOTP
    const isValid = verifyTotp(code.toString().trim(), secret)
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Codigo de verificacion incorrecto. Revisa tu aplicacion Authenticator.'
      })
    }

    // 2. Generar 5 codigos de respaldo de un solo uso
    const backupCodes = generateBackupCodes(5)

    // 3. Guardar en base de datos
    user.twoFactorEnabled = true
    user.twoFactorSecret = secret
    user.twoFactorBackupCodes = backupCodes
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Autenticacion en Dos Pasos activada exitosamente.',
      twoFactorEnabled: true,
      backupCodes
    })
  } catch (error) {
    console.error('[Error en enable2FA]:', error.message)
    res.status(500).json({ success: false, message: 'Error al activar 2FA' })
  }
}

/**
 * POST /api/user/2fa/disable
 * Desactiva 2FA previa validacion de contrasena
 */
export const disable2FA = async (req, res) => {
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

    // Validar contrasena
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Contrasena incorrecta. No se pudo desactivar 2FA.'
      })
    }

    user.twoFactorEnabled = false
    user.twoFactorSecret = ''
    user.twoFactorBackupCodes = []
    await user.save()

    return res.status(200).json({
      success: true,
      message: 'Autenticacion en Dos Pasos desactivada.',
      twoFactorEnabled: false
    })
  } catch (error) {
    console.error('[Error en disable2FA]:', error.message)
    res.status(500).json({ success: false, message: 'Error al desactivar 2FA' })
  }
}
