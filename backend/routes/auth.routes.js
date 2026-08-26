import { Router } from 'express'

const router = Router()

// ============================================================================
// BASE DE DATOS EN MEMORIA (USUARIOS Y SESIONES PRECONFIGURADAS)
// Conforme a la Especificación Técnica: ESPECIFICACION_BACKEND_AUTH.md
// ============================================================================
const USERS_DATABASE = [
  {
    id: 'usr_948201',
    username: 'adminUser',
    usernameNormalized: 'adminuser',
    password: '12345678',
    displayName: 'Administrador Nexu',
    email: 'admin@nexu.app',
    role: 'System Admin',
    avatarType: 'male',
    gender: 'male',
    status: 'active',
    failedLoginAttempts: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_839202',
    username: 'rosi_master',
    usernameNormalized: 'rosi_master',
    password: 'Nexu2026Pass!',
    displayName: 'Rosa Melano',
    email: 'rosa@nexu.app',
    role: 'Frontend Specialist',
    avatarType: 'female',
    gender: 'female',
    status: 'active',
    failedLoginAttempts: 0,
    createdAt: '2026-01-01T00:00:00.000Z'
  }
]

// Expresión regular para validar alias: 3 a 20 caracteres alfanuméricos y guión bajo
const ALIAS_REGEX = /^[a-zA-Z0-9_]{3,20}$/

/**
 * Función auxiliar para sanitizar el alias
 */
function sanitizeUsername(raw) {
  if (!raw || typeof raw !== 'string') return ''
  return raw.trim().replace(/^@/, '')
}

/**
 * Función auxiliar para generar token de sesión firmado simulado
 */
function generateSessionToken(userId, username, rememberMe = false) {
  const expiry = rememberMe ? '7d' : '24h'
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      username,
      exp: expiry,
      iat: Math.floor(Date.now() / 1000)
    })
  ).toString('base64url')
  const signature = Buffer.from(`nexu_sec_${userId}_${Date.now()}`).toString('base64url')
  return `${header}.${payload}.${signature}`
}

// ============================================================================
// ENDPOINTS RESTFUL DE AUTENTICACIÓN
// ============================================================================

/**
 * GET /api/auth/check-alias?alias=xxx
 * Responsable: Rosy (Módulo de Autenticación)
 * Comprueba reactivamente la disponibilidad de un alias único en USERS_DATABASE.
 */
router.get('/check-alias', (req, res) => {
  const raw = req.query.alias || req.query.username
  const clean = sanitizeUsername(raw)

  if (!clean || clean.length < 3) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'El alias debe tener al menos 3 caracteres alfanuméricos.'
    })
  }

  if (!ALIAS_REGEX.test(clean)) {
    return res.status(400).json({
      success: false,
      available: false,
      message: 'El alias solo puede contener letras, números y guión bajo (_).'
    })
  }

  const normalized = clean.toLowerCase()
  const isTaken = USERS_DATABASE.some(
    (u) => u.usernameNormalized === normalized || u.username.toLowerCase() === normalized
  )

  return res.status(200).json({
    success: true,
    available: !isTaken,
    alias: clean,
    formatted: `@${clean}`,
    message: isTaken
      ? `El alias @${clean} ya se encuentra registrado o sellado por otro usuario.`
      : `El alias @${clean} está disponible para reclamar.`
  })
})

/**
 * POST /api/auth/login
 * Responsable: Rosy (Módulo de Autenticación)
 * Autentica credenciales y emite token de sesión.
 */
router.post('/login', (req, res) => {
  const { username, password, rememberMe = false } = req.body || {}

  const cleanUsername = sanitizeUsername(username)

  // 1. Validación de campos requeridos y formato
  if (!cleanUsername || !password) {
    return res.status(400).json({
      success: false,
      message: 'Usuario único y contraseña son obligatorios.'
    })
  }

  if (!ALIAS_REGEX.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      message: 'Formato de alias inválido. Debe tener entre 3 y 10 caracteres alfanuméricos.'
    })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 8 caracteres.'
    })
  }

  // 2. Búsqueda de la cuenta en la base de datos
  const normalizedSearch = cleanUsername.toLowerCase()
  const user = USERS_DATABASE.find(
    (u) => u.usernameNormalized === normalizedSearch || u.username.toLowerCase() === normalizedSearch
  )

  // 3. Verificación de credenciales
  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Usuario o contraseña incorrectos. Verifica tus credenciales.'
    })
  }

  // 4. Generación de Token de Acceso
  const token = generateSessionToken(user.id, user.username, Boolean(rememberMe))

  // 5. Respuesta Exitosa (200 OK)
  return res.status(200).json({
    success: true,
    message: 'Autenticación exitosa.',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        role: user.role,
        avatarType: user.avatarType,
        gender: user.gender
      }
    }
  })
})

/**
 * POST /api/auth/register
 * Responsable: Rosy (Módulo de Autenticación)
 * Registra un nuevo usuario con alias soberano y contraseña garantizando no duplicación.
 */
router.post('/register', (req, res) => {
  const { username, password } = req.body || {}

  const cleanUsername = sanitizeUsername(username)

  // 1. Validación de entrada
  if (!cleanUsername || !password) {
    return res.status(400).json({
      success: false,
      message: 'Usuario único y contraseña son obligatorios.'
    })
  }

  if (!ALIAS_REGEX.test(cleanUsername)) {
    return res.status(400).json({
      success: false,
      message: 'El alias debe tener entre 3 y 10 caracteres alfanuméricos (a-z, A-Z, 0-9, _).'
    })
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña no cumple con los 8 caracteres mínimos obligatorios.'
    })
  }

  // 2. Verificación de disponibilidad de Alias (Índice único normalizado)
  const normalizedSearch = cleanUsername.toLowerCase()
  const exists = USERS_DATABASE.some(
    (u) => u.usernameNormalized === normalizedSearch || u.username.toLowerCase() === normalizedSearch
  )

  if (exists) {
    return res.status(409).json({
      success: false,
      message: `El alias @${cleanUsername} ya se encuentra registrado o sellado por otro usuario.`
    })
  }

  // 3. Creación del nuevo usuario en el sistema
  const newUserId = `usr_${Math.floor(100000 + Math.random() * 900000)}`
  const newUser = {
    id: newUserId,
    username: cleanUsername,
    usernameNormalized: normalizedSearch,
    password,
    displayName: `@${cleanUsername}`,
    email: `${normalizedSearch}@nexu.app`,
    role: 'Usuario Nexu',
    avatarType: 'neutral',
    gender: 'neutral',
    status: 'active',
    failedLoginAttempts: 0,
    createdAt: new Date().toISOString()
  }

  USERS_DATABASE.push(newUser)

  // 4. Generación de Token de Acceso
  const token = generateSessionToken(newUser.id, newUser.username)

  // 5. Respuesta Exitosa (201 Created)
  return res.status(201).json({
    success: true,
    message: 'Usuario creado exitosamente.',
    data: {
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        avatarType: newUser.avatarType,
        gender: newUser.gender
      }
    }
  })
})

/**
 * POST /api/auth/forgot-password
 * Responsable: Rosy (Módulo de Autenticación)
 * Procesa la solicitud simulada de restablecimiento de acceso.
 */
router.post('/forgot-password', (req, res) => {
  const { username } = req.body || {}
  const cleanUsername = sanitizeUsername(username)

  if (!cleanUsername || cleanUsername.length < 3) {
    return res.status(400).json({
      success: false,
      message: 'Ingresa un usuario único válido para restablecer el acceso.'
    })
  }

  return res.status(200).json({
    success: true,
    message: `Si la cuenta @${cleanUsername} existe, se han generado las instrucciones de recuperación de acceso.`
  })
})

/**
 * POST /api/auth/logout
 * Invalida la sesión activa
 */
router.post('/logout', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Sesión cerrada correctamente.'
  })
})

/**
 * GET /api/auth/me
 * Retorna la información del usuario autenticado por defecto o según token
 */
router.get('/me', (req, res) => {
  const defaultUser = USERS_DATABASE[0]
  return res.status(200).json({
    success: true,
    data: {
      id: defaultUser.id,
      username: defaultUser.username,
      displayName: defaultUser.displayName,
      email: defaultUser.email,
      role: defaultUser.role,
      avatarType: defaultUser.avatarType,
      gender: defaultUser.gender
    }
  })
})

export default router
