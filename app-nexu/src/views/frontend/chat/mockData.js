/**
 * mockData.js - Base de Datos Simulada para Nexu Chat (v1.0)
 * Sin emojis - 100% iconos vectoriales e iniciales tipográficas.
 */

export const MOCK_USERS = [
  {
    id: 'usr_admin',
    username: 'adminUser',
    name: 'Admin User',
    handle: '@adminUser',
    avatar: 'AU',
    status: 'online',
    statusText: 'Sesión activa · Administrador',
    role: 'Administrador Nexu'
  },
  {
    id: 'usr_rosi',
    username: 'rosi_master',
    name: 'Rosy Master',
    handle: '@rosi_master',
    avatar: 'RM',
    status: 'online',
    statusText: 'Sesión activa · Frontend Auth',
    role: 'Desarrolladora Nexu'
  }
]

export const DEFAULT_USER = MOCK_USERS[0]
export const CURRENT_USER = DEFAULT_USER

// Función para obtener perfil de usuario por alias o generar uno dinámico
export const getUserProfile = (username) => {
  if (!username) return DEFAULT_USER
  const clean = username.replace(/^@/, '')
  const found = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === clean.toLowerCase()
  )
  if (found) return found

  return {
    id: `usr_${clean.toLowerCase()}`,
    username: clean,
    name: clean,
    handle: `@${clean}`,
    avatar: clean.slice(0, 2).toUpperCase(),
    status: 'online',
    statusText: 'Sesión activa',
    role: 'Usuario Nexu'
  }
}

// Lista de conversaciones vacía por defecto (bandeja privada)
export const INITIAL_CHATS = []

export const BOT_RESPONSES = [
  'Mensaje recibido y procesado por el despachador de eventos.',
  'Confirmación de entrega en tiempo real: paquete verificado con latencia de 12ms.',
  'Evento de mensajería ejecutado correctamente en el cliente.',
  'Simulación de respuesta automática completada sin errores.',
  'Flujo de comunicación validado en el Módulo 03.'
]

/**
 * Detectar información del dispositivo y navegador del cliente
 */
export const detectCurrentDevice = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      deviceName: 'Escritorio Web',
      browser: 'Navegador Web',
      platform: 'Desktop'
    }
  }

  const ua = navigator.userAgent
  let deviceName = 'Linux Desktop'
  let browser = 'Google Chrome'
  let platform = 'Desktop'

  // Detección de Sistema Operativo
  if (/Android/i.test(ua)) {
    deviceName = 'Dispositivo Android'
    platform = 'Mobile'
  } else if (/iPhone/i.test(ua)) {
    deviceName = 'Apple iPhone'
    platform = 'Mobile'
  } else if (/iPad/i.test(ua)) {
    deviceName = 'Apple iPad'
    platform = 'Tablet'
  } else if (/Windows/i.test(ua)) {
    deviceName = 'Windows PC'
    platform = 'Desktop'
  } else if (/Macintosh|Mac OS/i.test(ua)) {
    deviceName = 'MacBook / macOS'
    platform = 'Desktop'
  } else if (/Linux/i.test(ua)) {
    deviceName = 'Linux (Ubuntu / Desktop)'
    platform = 'Desktop'
  }

  // Detección de Navegador
  if (/Edg\//i.test(ua)) browser = 'Microsoft Edge'
  else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox'
  else if (/Chrome\//i.test(ua)) browser = 'Google Chrome'
  else if (/Safari\//i.test(ua)) browser = 'Apple Safari'

  return { deviceName, browser, platform }
}

/**
 * Registrar o actualizar sesión de dispositivo de un usuario
 * Si el dispositivo ya existe para este usuario, actualiza fecha, hora y última actividad sin duplicar.
 */
export const logDeviceSession = (username) => {
  const clean = (username || 'adminUser').replace(/^@/, '').toLowerCase()
  const { deviceName, browser, platform } = detectCurrentDevice()
  const storageKey = `nexu_sessions_${clean}`

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })

  let sessions = []
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) sessions = JSON.parse(saved)
  } catch {
    sessions = []
  }

  // Buscar si ya existe este dispositivo
  const existingIndex = sessions.findIndex(
    (s) => s.deviceName === deviceName && s.browser === browser
  )

  if (existingIndex >= 0) {
    // Actualizar la sesión existente sin duplicar
    sessions[existingIndex] = {
      ...sessions[existingIndex],
      lastLoginDate: dateStr,
      lastLoginTime: timeStr,
      lastActive: 'Activo ahora',
      isCurrent: true,
      status: 'online'
    }
  } else {
    // Crear nueva sesión para este dispositivo
    const newSession = {
      id: `dev_${Date.now()}`,
      deviceName,
      browser,
      platform,
      ip: '127.0.0.1 (Local)',
      firstLoginDate: dateStr,
      lastLoginDate: dateStr,
      lastLoginTime: timeStr,
      lastActive: 'Activo ahora',
      isCurrent: true,
      status: 'online'
    }
    // Marcar otras como no actuales
    sessions = sessions.map((s) => ({ ...s, isCurrent: false }))
    sessions.unshift(newSession)
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(sessions))
  } catch {
    // Manejo de error silencioso
  }

  return sessions
}

/**
 * Obtener sesiones registradas de un usuario
 */
export const getUserSessions = (username) => {
  const clean = (username || 'adminUser').replace(/^@/, '').toLowerCase()
  const storageKey = `nexu_sessions_${clean}`
  try {
    const saved = localStorage.getItem(storageKey)
    if (saved) return JSON.parse(saved)
  } catch {
    // fallback
  }
  return logDeviceSession(clean)
}
