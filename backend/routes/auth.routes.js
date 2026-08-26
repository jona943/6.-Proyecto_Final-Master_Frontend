import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

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

    // 3. Emitir Token JWT de sesión
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

export default router
