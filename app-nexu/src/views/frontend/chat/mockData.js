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
