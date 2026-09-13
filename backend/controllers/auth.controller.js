import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { verifyTotp } from '../utils/totp.js'
import { parseDeviceInfo, formatRelativeActive } from '../utils/deviceParser.js'

/**
 * Usuarios por defecto de la demo
 */
const DEMO_USERS = [
  { username: 'adminuser', rawUsername: 'adminUser', password: '12345678', role: 'admin' },
  { username: 'rosi_master', rawUsername: 'rosi_master', password: 'Nexu2026Pass!', role: 'user' }
]

/**
 * POST /api/auth/register
 * Registro de nuevo usuario en MongoDB con contrasena encriptada
 */
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body

    // 1. Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contrasena requeridos.'
      })
    }

    const raw = username.trim().replace(/^@/, '')

    // 2. Rechazo explicito de enes y caracteres con acentos
    if (/[ñÑáéíóúÁÉÍÓÚ]/.test(raw)) {
      return res.status(400).json({
        success: false,
        message: 'No se permite la letra enie ni caracteres con acento.'
      })
    }

    // 3. Validar formato (mayusculas, minusculas, numeros, - y _)
    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se permiten letras, numeros, guion bajo (_) y guion (-).'
      })
    }

    if (raw.length < 3 || raw.length > 10) {
      return res.status(400).json({
        success: false,
        message: 'El alias debe tener entre 3 y 10 caracteres.'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contrasena debe tener al menos 6 caracteres.'
      })
    }

    const cleanUsername = raw.toLowerCase()

    // 4. Verificar si ya existe en la base de datos
    const existingUser = await User.findOne({ username: cleanUsername })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este nombre de usuario ya esta registrado.'
      })
    }

    // 5. Encriptar contrasena con bcrypt (10 rondas de salt)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 6. Registrar sesion de dispositivo y generar Token JWT
    const device = parseDeviceInfo(req)
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const newUser = new User({
      username: cleanUsername,
      displayName: raw,
      password: hashedPassword
    })

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, sessionId },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    newUser.sessions = [
      {
        id: sessionId,
        token,
        deviceName: device.deviceName,
        browser: device.browser,
        platform: device.platform,
        ip: device.ip,
        lastLoginDate: device.lastLoginDate,
        lastLoginFormattedDate: device.lastLoginFormattedDate,
        lastLoginTime: device.lastLoginTime,
        lastActive: device.lastActive,
        userAgent: device.userAgent
      }
    ]

    await newUser.save()

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        username: newUser.username,
        token
      }
    })
  } catch (error) {
    console.error('[Error en registerUser]:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar usuario.'
    })
  }
}

/**
 * POST /api/auth/login
 * Autenticacion comparando hash bcrypt y emitiendo Token JWT
 */
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contrasena requeridos.'
      })
    }

    const cleanUsername = username.trim().replace(/^@/, '').toLowerCase()

    // 1. Buscar usuario en MongoDB Atlas
    let user = await User.findOne({ username: cleanUsername })

    // Auto-crear usuarios demo si se intenta entrar por primera vez con ellos
    if (!user) {
      const demoAccount = DEMO_USERS.find((d) => d.username === cleanUsername && d.password === password)
      if (demoAccount) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(demoAccount.password, salt)
        user = new User({
          username: demoAccount.username,
          displayName: demoAccount.rawUsername,
          password: hashedPassword,
          role: demoAccount.role
        })
        await user.save()
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contrasena incorrectos.'
      })
    }

    // 2. Comparar contrasena ingresada contra el hash seguro en base de datos
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contrasena incorrectos.'
      })
    }

    // 3. Si el usuario tiene 2FA (Doble Factor) activado, emitir tempToken de verificacion
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        { id: user._id, username: user.username, pending2FA: true },
        process.env.JWT_SECRET || 'nexu_secret_default',
        { expiresIn: '5m' }
      )

      return res.status(200).json({
        success: true,
        requires2FA: true,
        tempToken,
        username: user.username
      })
    }

    // 4. Registrar sesion de dispositivo y emitir Token JWT de sesion completa
    const device = parseDeviceInfo(req)
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const token = jwt.sign(
      { id: user._id, username: user.username, sessionId },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    if (!Array.isArray(user.sessions)) {
      user.sessions = []
    }

    const existingIndex = user.sessions.findIndex(
      (s) => s.browser === device.browser && s.deviceName === device.deviceName && s.ip === device.ip
    )

    const sessionRecord = {
      id: sessionId,
      token,
      deviceName: device.deviceName,
      browser: device.browser,
      platform: device.platform,
      ip: device.ip,
      lastLoginDate: device.lastLoginDate,
      lastLoginFormattedDate: device.lastLoginFormattedDate,
      lastLoginTime: device.lastLoginTime,
      lastActive: device.lastActive,
      userAgent: device.userAgent
    }

    if (existingIndex !== -1) {
      user.sessions[existingIndex] = sessionRecord
    } else {
      user.sessions.unshift(sessionRecord)
      if (user.sessions.length > 10) {
        user.sessions = user.sessions.slice(0, 10)
      }
    }

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Autenticacion exitosa.',
      data: {
        username: user.username,
        displayName: user.displayName || user.username,
        role: user.role || 'user',
        avatarUrl: user.avatarUrl || null,
        token
      }
    })
  } catch (error) {
    console.error('[Error en loginUser]:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al autenticar.'
    })
  }
}

/**
 * POST /api/auth/login-2fa
 * Verificacion del segundo factor (codigo TOTP o codigo de respaldo)
 */
export const verify2FALogin = async (req, res) => {
  try {
    const { tempToken, code } = req.body || {}

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'tempToken y codigo son requeridos.'
      })
    }

    // 1. Verificar firma y vigencia del tempToken (5 minutos)
    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'nexu_secret_default')
    } catch {
      return res.status(401).json({
        success: false,
        message: 'La sesion temporal de verificacion ha expirado. Inicia sesion nuevamente.'
      })
    }

    if (!decoded || !decoded.username || !decoded.pending2FA) {
      return res.status(401).json({
        success: false,
        message: 'Token temporal no valido.'
      })
    }

    // 2. Buscar usuario en base de datos
    const user = await User.findOne({ username: decoded.username })
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene autenticacion de dos factores configurada.'
      })
    }

    const cleanCode = code.toString().trim()
    let isValid = false
    let usedBackupCode = false

    // 3. Probar si es un codigo dinamico TOTP de 6 digitos
    if (/^\d{6}$/.test(cleanCode)) {
      isValid = verifyTotp(cleanCode, user.twoFactorSecret)
    }

    // 4. Si no fue valido como TOTP, verificar si coincide con un Codigo de Respaldo de Emergencia
    if (!isValid && user.twoFactorBackupCodes && Array.isArray(user.twoFactorBackupCodes)) {
      const normalizedInput = cleanCode.toUpperCase()
      const codeIndex = user.twoFactorBackupCodes.findIndex(
        (c) => c.toUpperCase() === normalizedInput
      )

      if (codeIndex !== -1) {
        isValid = true
        usedBackupCode = true
        // Consumir el codigo de respaldo (son de un solo uso)
        user.twoFactorBackupCodes.splice(codeIndex, 1)
        await user.save()
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Codigo de autenticacion o de respaldo incorrecto.'
      })
    }

    // 5. Registrar sesion de dispositivo y emitir Token JWT final de sesion (7 dias)
    const device = parseDeviceInfo(req)
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

    const token = jwt.sign(
      { id: user._id, username: user.username, sessionId },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    if (!Array.isArray(user.sessions)) {
      user.sessions = []
    }

    const existingIndex = user.sessions.findIndex(
      (s) => s.browser === device.browser && s.deviceName === device.deviceName && s.ip === device.ip
    )

    const sessionRecord = {
      id: sessionId,
      token,
      deviceName: device.deviceName,
      browser: device.browser,
      platform: device.platform,
      ip: device.ip,
      lastLoginDate: device.lastLoginDate,
      lastLoginFormattedDate: device.lastLoginFormattedDate,
      lastLoginTime: device.lastLoginTime,
      lastActive: device.lastActive,
      userAgent: device.userAgent
    }

    if (existingIndex !== -1) {
      user.sessions[existingIndex] = sessionRecord
    } else {
      user.sessions.unshift(sessionRecord)
      if (user.sessions.length > 10) {
        user.sessions = user.sessions.slice(0, 10)
      }
    }

    await user.save()

    return res.status(200).json({
      success: true,
      message: usedBackupCode
        ? 'Acceso concedido mediante codigo de respaldo de emergencia.'
        : 'Autenticacion en dos pasos exitosa.',
      usedBackupCode,
      remainingBackupCodes: user.twoFactorBackupCodes?.length || 0,
      data: {
        username: user.username,
        displayName: user.displayName || user.username,
        role: user.role || 'user',
        avatarUrl: user.avatarUrl || null,
        token
      }
    })
  } catch (error) {
    console.error('[Error en verify2FALogin]:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al verificar segundo factor.'
    })
  }
}

/**
 * GET /api/auth/sessions?username=xxx
 * Listar dispositivos y sesiones activas del usuario
 */
export const getSessions = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || ''
    const currentToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    let tokenPayload = null
    if (currentToken) {
      try {
        tokenPayload = jwt.verify(currentToken, process.env.JWT_SECRET || 'nexu_secret_default')
      } catch {}
    }

    const usernameParam = req.query.username || tokenPayload?.username || ''
    const clean = (usernameParam || '').trim().replace(/^@/, '').toLowerCase()

    if (!clean) {
      return res.status(400).json({
        success: false,
        message: 'Usuario requerido para consultar sesiones.'
      })
    }

    const user = await User.findOne({ username: clean })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      })
    }

    // Si no tiene sesiones registradas en DB, crear la sesión actual en vivo
    if (!user.sessions || user.sessions.length === 0) {
      const device = parseDeviceInfo(req)
      const autoSession = {
        id: tokenPayload?.sessionId || `sess_${Date.now()}`,
        token: currentToken || 'sess_curr_token',
        deviceName: device.deviceName,
        browser: device.browser,
        platform: device.platform,
        ip: device.ip,
        lastLoginDate: device.lastLoginDate,
        lastLoginFormattedDate: device.lastLoginFormattedDate,
        lastLoginTime: device.lastLoginTime,
        lastActive: new Date(),
        userAgent: device.userAgent
      }
      user.sessions = [autoSession]
      await user.save()
    }

    const currentSessionId = tokenPayload?.sessionId

    // Formatear sesiones para el cliente
    const formattedSessions = user.sessions.map((s) => {
      const isCurrent = Boolean(
        (currentSessionId && s.id === currentSessionId) ||
        (currentToken && s.token === currentToken) ||
        (!currentSessionId && !currentToken && s.id === user.sessions[0].id)
      )

      return {
        id: s.id,
        deviceName: s.deviceName,
        browser: s.browser,
        platform: s.platform,
        ip: s.ip,
        lastLoginDate: s.lastLoginDate || 'Hoy',
        lastLoginFormattedDate: s.lastLoginFormattedDate,
        lastLoginTime: s.lastLoginTime,
        lastActive: isCurrent ? 'Activo ahora' : formatRelativeActive(s.lastActive),
        isCurrent
      }
    })

    // Asegurar que la sesión actual aparezca primera en la lista
    formattedSessions.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0))

    res.status(200).json({
      success: true,
      sessions: formattedSessions
    })
  } catch (error) {
    console.error('[Error en getSessions]:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error al consultar sesiones del usuario.'
    })
  }
}

/**
 * DELETE /api/auth/sessions/:sessionId?username=xxx
 * Cerrar sesión en un dispositivo específico
 */
export const closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params
    const authHeader = req.headers.authorization || ''
    const currentToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : ''

    let tokenPayload = null
    if (currentToken) {
      try {
        tokenPayload = jwt.verify(currentToken, process.env.JWT_SECRET || 'nexu_secret_default')
      } catch {}
    }

    const usernameParam = req.query.username || tokenPayload?.username || ''
    const clean = (usernameParam || '').trim().replace(/^@/, '').toLowerCase()

    if (!clean) {
      return res.status(400).json({
        success: false,
        message: 'Usuario requerido.'
      })
    }

    const user = await User.findOne({ username: clean })
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado.'
      })
    }

    // Eliminar la sesión solicitada
    user.sessions = (user.sessions || []).filter((s) => s.id !== sessionId)
    await user.save()

    const currentSessionId = tokenPayload?.sessionId

    const formattedSessions = user.sessions.map((s) => {
      const isCurrent = Boolean(
        (currentSessionId && s.id === currentSessionId) ||
        (currentToken && s.token === currentToken)
      )

      return {
        id: s.id,
        deviceName: s.deviceName,
        browser: s.browser,
        platform: s.platform,
        ip: s.ip,
        lastLoginDate: s.lastLoginDate || 'Hoy',
        lastLoginFormattedDate: s.lastLoginFormattedDate,
        lastLoginTime: s.lastLoginTime,
        lastActive: isCurrent ? 'Activo ahora' : formatRelativeActive(s.lastActive),
        isCurrent
      }
    })

    formattedSessions.sort((a, b) => (b.isCurrent ? 1 : 0) - (a.isCurrent ? 1 : 0))

    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente en el dispositivo.',
      sessions: formattedSessions
    })
  } catch (error) {
    console.error('[Error en closeSession]:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error al cerrar la sesión remota.'
    })
  }
}

