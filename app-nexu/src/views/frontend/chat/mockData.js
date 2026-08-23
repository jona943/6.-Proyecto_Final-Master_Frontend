/**
 * mockData.js - Base de Datos Simulada para Nexu Chat (v1.0)
 * Sin emojis - 100% iconos vectoriales e iniciales tipográficas.
 */

import { storage, STORAGE_KEYS } from '../../../services/storageService'
import { getInitials } from '../../../utils/formatters'

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

// Función para obtener perfil de usuario por alias o generar uno dinámico sincronizado
export const getUserProfile = (username) => {
  if (!username) return DEFAULT_USER
  const clean = username.replace(/^@/, '').toLowerCase()

  // 1. Verificar si existen datos actualizados en storageService
  const saved = storage.get(STORAGE_KEYS.profileKey(clean))
  if (saved) {
    const initials = getInitials(saved.displayName || saved.username || clean, 'NX')

    return {
      id: `usr_${clean}`,
      username: saved.username || clean,
      name: saved.displayName || clean,
      handle: `@${saved.username || clean}`,
      avatar: initials,
      avatarType: saved.avatarType || (clean === 'rosi_master' ? 'female' : 'initials'),
      gender: saved.gender || 'neutral',
      status: saved.presence || 'online',
      statusText: `Sesión activa · ${saved.bio ? saved.bio.slice(0, 30) + '...' : 'Nexu Member'}`,
      role: clean === 'adminuser' ? 'Administrador Nexu' : 'Desarrolladora Nexu'
    }
  }

  // 2. Si es una de las cuentas demo iniciales
  const matched = MOCK_USERS.find((u) => u.username.toLowerCase() === clean)
  if (matched) return matched

  // 3. Si es un usuario recién creado
  return {
    id: `usr_${clean}`,
    username: clean,
    name: `@${clean}`,
    handle: `@${clean}`,
    avatar: clean.slice(0, 2).toUpperCase(),
    avatarType: 'neutral',
    gender: 'neutral',
    status: 'online',
    statusText: 'Sesión activa · Nexu Member',
    role: 'Usuario Nexu'
  }
}

export const BOT_RESPONSES = [
  'Mensaje verificado. La conexión entre pares permanece cifrada.',
  'Recibido con éxito. El estándar de Nexu mantiene el hilo seguro.',
  'Perfecto. Notificación silenciosa entregada al destinatario.',
  'Entendido. La sincronización se realizó de manera privada.'
]

export const INITIAL_CHATS = [
  {
    id: 'chat_bot',
    name: 'Nexu Assistant',
    handle: '@nexu_assistant',
    avatar: 'NX',
    isBot: true,
    status: 'online',
    statusText: 'Asistente de Protocolo · En línea',
    unreadCount: 0,
    role: 'Asistente de Privacidad',
    email: 'assistant@nexu.app',
    bio: 'Bot automatizado para verificar el funcionamiento de la mensajería punto a punto.',
    messages: [
      {
        id: 'msg_01',
        sender: 'them',
        text: 'Bienvenido al santuario de comunicación privada de Nexu. Todas tus conversaciones son directas y anónimas.',
        time: '10:00 AM',
        status: 'read'
      },
      {
        id: 'msg_02',
        sender: 'them',
        text: 'Escribe un mensaje para probar la simulación de respuesta automática.',
        time: '10:01 AM',
        status: 'read'
      }
    ]
  }
]

/**
 * Registrar inicio de sesión en el dispositivo actual
 */
export const logDeviceSession = (username) => {
  const clean = (username || 'adminUser').replace(/^@/, '').toLowerCase()
  const storageKey = STORAGE_KEYS.sessionsKey(clean)

  let platform = 'Desktop'
  let deviceName = 'Equipo de Escritorio'
  let browser = 'Navegador Web'

  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
      platform = 'Mobile'
      deviceName = 'Dispositivo Android'
      browser = 'Chrome Mobile'
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      platform = 'Mobile'
      deviceName = 'Apple iPhone'
      browser = 'Safari Mobile'
    } else if (/macintosh|mac os x/i.test(ua)) {
      platform = 'Desktop'
      deviceName = 'Apple MacBook Pro'
      browser = 'Safari / Chrome'
    } else if (/windows/i.test(ua)) {
      platform = 'Desktop'
      deviceName = 'PC Windows 11'
      browser = 'Edge / Chrome'
    } else if (/linux/i.test(ua)) {
      platform = 'Desktop'
      deviceName = 'HP EliteBook 840 G5'
      browser = 'Chrome 122 · Linux'
    }
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })

  let sessions = storage.get(storageKey, [])

  // Buscar si ya existe este dispositivo
  const existingIndex = sessions.findIndex(
    (s) => s.deviceName === deviceName && s.browser === browser
  )

  if (existingIndex >= 0) {
    // Actualizar sesión existente
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
    sessions = sessions.map((s) => ({ ...s, isCurrent: false }))
    sessions.unshift(newSession)
  }

  storage.set(storageKey, sessions)
  return sessions
}

/**
 * Obtener sesiones registradas de un usuario
 */
export const getUserSessions = (username) => {
  const clean = (username || 'adminUser').replace(/^@/, '').toLowerCase()
  const storageKey = STORAGE_KEYS.sessionsKey(clean)
  const saved = storage.get(storageKey)
  if (saved && saved.length > 0) return saved
  return logDeviceSession(clean)
}
