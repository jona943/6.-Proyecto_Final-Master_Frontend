import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { verifyTotp } from '../utils/totp.js'

const router = Router()

/**
 * Usuarios por defecto de la demo
 */
const DEMO_USERS = [
  { username: 'adminuser', rawUsername: 'adminUser', password: '12345678', role: 'admin' },
  { username: 'rosi_master', rawUsername: 'rosi_master', password: 'Nexu2026Pass!', role: 'user' }
]

/**
 * POST /api/auth/register
 * Registro real de nuevo usuario en MongoDB Atlas con contraseña encriptada
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body

    // 1. Validar campos requeridos
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos.'
      })
    }

    const raw = username.trim().replace(/^@/, '')

    // 2. Rechazo explícito de Ñ y caracteres con acentos
    if (/[ñÑáéíóúÁÉÍÓÚ]/.test(raw)) {
      return res.status(400).json({
        success: false,
        message: 'No se permite la letra Ñ ni caracteres con acento.'
      })
    }

    // 3. Validar formato (mayúsculas, minúsculas, números, - y _)
    if (!/^[a-zA-Z0-9_-]+$/.test(raw)) {
      return res.status(400).json({
        success: false,
        message: 'Solo se permiten letras, números, guión bajo (_) y guión (-).'
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
        message: 'La contraseña debe tener al menos 6 caracteres.'
      })
    }

    const cleanUsername = raw.toLowerCase()

    // 4. Verificar si ya existe en la base de datos
    const existingUser = await User.findOne({ username: cleanUsername })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este nombre de usuario ya está registrado.'
      })
    }

    // 5. Encriptar contraseña con bcrypt (10 rondas de salt)
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // 6. Guardar en MongoDB Atlas
    const newUser = new User({
      username: cleanUsername,
      displayName: raw,
      password: hashedPassword
    })
    await newUser.save()

    // 7. Generar Token JWT de sesión
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente.',
      data: {
        username: newUser.username,
        token
      }
    })
  } catch (error) {
    console.error('Error en /register:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al registrar usuario.'
    })
  }
})

/**
 * POST /api/auth/login
 * Autenticación real comparando hash bcrypt y emitiendo Token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Usuario y contraseña requeridos.'
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
        message: 'Usuario o contraseña incorrectos.'
      })
    }

    // 2. Comparar contraseña ingresada contra el hash seguro en base de datos
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Usuario o contraseña incorrectos.'
      })
    }

    // 3. Si el usuario tiene 2FA (Doble Factor) activado, emitir tempToken de verificación
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

    // 4. Emitir Token JWT de sesión completa si no tiene 2FA
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    res.status(200).json({
      success: true,
      message: 'Autenticación exitosa.',
      data: {
        username: user.username,
        displayName: user.displayName || user.username,
        role: user.role || 'user',
        avatarUrl: user.avatarUrl || null,
        token
      }
    })
  } catch (error) {
    console.error('Error en /login:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al autenticar.'
    })
  }
})

/**
 * POST /api/auth/login-2fa
 * Verificación del segundo factor (código TOTP de 6 dígitos o código de respaldo)
 */
router.post('/login-2fa', async (req, res) => {
  try {
    const { tempToken, code } = req.body || {}

    if (!tempToken || !code) {
      return res.status(400).json({
        success: false,
        message: 'tempToken y código son requeridos.'
      })
    }

    // 1. Verificar firma y vigencia del tempToken (5 minutos)
    let decoded
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'nexu_secret_default')
    } catch {
      return res.status(401).json({
        success: false,
        message: 'La sesión temporal de verificación ha expirado. Inicia sesión nuevamente.'
      })
    }

    if (!decoded || !decoded.username || !decoded.pending2FA) {
      return res.status(401).json({
        success: false,
        message: 'Token temporal no válido.'
      })
    }

    // 2. Buscar usuario en base de datos
    const user = await User.findOne({ username: decoded.username })
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: 'El usuario no tiene autenticación de dos factores configurada.'
      })
    }

    const cleanCode = code.toString().trim()
    let isValid = false
    let usedBackupCode = false

    // 3. Probar si es un código dinámico TOTP de 6 dígitos
    if (/^\d{6}$/.test(cleanCode)) {
      isValid = verifyTotp(cleanCode, user.twoFactorSecret)
    }

    // 4. Si no fue válido como TOTP, verificar si coincide con un Código de Respaldo de Emergencia
    if (!isValid && user.twoFactorBackupCodes && Array.isArray(user.twoFactorBackupCodes)) {
      const normalizedInput = cleanCode.toUpperCase()
      const codeIndex = user.twoFactorBackupCodes.findIndex(
        (c) => c.toUpperCase() === normalizedInput
      )

      if (codeIndex !== -1) {
        isValid = true
        usedBackupCode = true
        // Consumir el código de respaldo (son de un solo uso)
        user.twoFactorBackupCodes.splice(codeIndex, 1)
        await user.save()
      }
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Código de autenticación o de respaldo incorrecto.'
      })
    }

    // 5. Emitir Token JWT final de sesión (7 días)
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || 'nexu_secret_default',
      { expiresIn: '7d' }
    )

    return res.status(200).json({
      success: true,
      message: usedBackupCode
        ? 'Acceso concedido mediante código de respaldo de emergencia.'
        : 'Autenticación en dos pasos exitosa.',
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
    console.error('Error en /login-2fa:', error.message)
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al verificar segundo factor.'
    })
  }
})

export default router
