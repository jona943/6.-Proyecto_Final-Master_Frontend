// ============================================================================
// SERVICIO DE AUTENTICACIÓN Y PERFIL (ADAPTER PATTERN)
// Conectado con la API REST Backend (http://localhost:5000/api/auth)
// Con soporte resiliente offline/fallback en almacenamiento seguro (StorageService)
// Conforme a la especificación técnica ESPECIFICACION_BACKEND_AUTH.md
// ============================================================================

import api from './api'
import { storage, STORAGE_KEYS } from './storageService'

const LOCAL_ACCOUNTS_KEY = 'nexu_registered_accounts_db'

const DEFAULT_ACCOUNTS = [
  {
    id: 'usr_948201',
    username: 'adminUser',
    password: '12345678',
    displayName: 'Administrador Nexu',
    role: 'System Admin',
    email: 'admin@nexu.app',
    avatarType: 'male',
    gender: 'male'
  },
  {
    id: 'usr_839202',
    username: 'rosi_master',
    password: 'Nexu2026Pass!',
    displayName: 'Rosa Melano',
    role: 'Frontend Specialist',
    email: 'rosa@nexu.app',
    avatarType: 'female',
    gender: 'female'
  }
]

const DEFAULT_SESSIONS = [
  {
    id: 'sess-curr',
    deviceName: 'HP EliteBook 840 G5',
    browser: 'Chrome 122 · Linux x86_64',
    platform: 'Desktop',
    ip: '192.168.1.104',
    lastLoginDate: 'Hoy',
    lastLoginTime: '10:30 AM',
    lastActive: 'Activo ahora',
    isCurrent: true
  },
  {
    id: 'sess-mob-01',
    deviceName: 'Google Pixel 8 Pro',
    browser: 'Nexu Android App v1.0',
    platform: 'Mobile',
    ip: '189.217.44.12',
    lastLoginDate: 'Ayer',
    lastLoginTime: '08:15 PM',
    lastActive: 'Hace 14 horas',
    isCurrent: false
  }
]

const SUGGESTIONS_POOL = [
  'ciber_neo', 'luna_dev', 'nexus_26', 'pixel_io', 'shadow_9',
  'zen_code', 'echo_user', 'nova_run', 'sol_nexu', 'vortex_7',
  'alpha_9', 'zero_byte', 'pulse_x', 'byte_pro', 'sky_link',
  'neon_core', 'flux_8', 'grid_dev', 'krypt_26', 'apex_me'
]

/**
 * Obtiene las cuentas locales combinando las predeterminadas y las registradas
 */
function getAllLocalAccounts() {
  const registered = storage.get(LOCAL_ACCOUNTS_KEY, [])
  return [...DEFAULT_ACCOUNTS, ...registered]
}

/**
 * Guarda una nueva cuenta en el almacenamiento local
 */
function saveLocalAccount(account) {
  const registered = storage.get(LOCAL_ACCOUNTS_KEY, [])
  const exists = registered.some(
    (a) => a.username.toLowerCase() === account.username.toLowerCase()
  )
  if (!exists) {
    registered.push(account)
    storage.set(LOCAL_ACCOUNTS_KEY, registered)
  }
}

/**
 * Determina si el error es de conexión de red (backend offline)
 */
function isNetworkError(errorMsg) {
  if (!errorMsg) return true
  const lower = errorMsg.toLowerCase()
  return (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('no se pudo conectar') ||
    lower.includes('connection refused')
  )
}

export const authService = {
  /**
   * Retorna todas las cuentas registradas en la aplicación
   */
  getAllAccounts() {
    return getAllLocalAccounts()
  },

  /**
   * Genera sugerencias de alias únicos garantizando que no estén ocupados
   * @param {number} count - Cantidad de sugerencias a devolver
   * @returns {string[]} Lista de sugerencias disponibles
   */
  getAliasSuggestions(count = 4) {
    const accounts = getAllLocalAccounts()
    const takenSet = new Set(accounts.map((a) => a.username.toLowerCase()))

    const available = SUGGESTIONS_POOL.filter((alias) => !takenSet.has(alias.toLowerCase()))
    const shuffled = [...available].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  },

  /**
   * Verifica la disponibilidad de un alias único en tiempo real consultando Backend y Local
   * @param {string} username - Alias a consultar
   * @returns {Promise<{ available: boolean, state: 'idle'|'valid'|'warning'|'error', reason: string }>}
   */
  async checkUsernameAvailability(username) {
    const clean = (username || '').trim().replace(/^@/, '')

    if (!clean) {
      return {
        available: false,
        state: 'idle',
        reason: 'Introduce de 3 a 10 caracteres alfanuméricos.'
      }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      return {
        available: false,
        state: 'error',
        reason: 'Solo se permiten letras, números y guión bajo (_).'
      }
    }

    if (clean.length < 3) {
      return {
        available: false,
        state: 'warning',
        reason: `${clean.length}/3 caracteres mínimos requeridos.`
      }
    }

    if (clean.length > 10) {
      return {
        available: false,
        state: 'error',
        reason: 'Máximo 10 caracteres permitidos.'
      }
    }

    // 1. Verificación local previa inmediata
    const accounts = getAllLocalAccounts()
    const takenLocally = accounts.some(
      (acc) => acc.username.toLowerCase() === clean.toLowerCase()
    )

    if (takenLocally) {
      return {
        available: false,
        state: 'error',
        reason: `El alias @${clean} ya se encuentra registrado. Elige otro para evitar confusiones.`
      }
    }

    // 2. Verificación contra el Backend (consulta MongoDB Atlas en vivo)
    try {
      const res = await api.checkAlias(clean)
      if (res.success && res.data) {
        if (!res.data.available) {
          return {
            available: false,
            state: 'error',
            reason: res.data.message || `El alias @${clean} ya se encuentra registrado por otro usuario.`
          }
        }
      }
    } catch {
      // Si el backend no responde, se usa el estado de almacenamiento local
    }

    return {
      available: true,
      state: 'valid',
      reason: `¡@${clean} está disponible y es único!`
    }
  },

  /**
   * Iniciar sesión conectando con el backend REST: POST /api/auth/login
   * Si el backend está apagado, opera con fallback local inteligente.
   * @param {string} username - Alias único
   * @param {string} password - Contraseña
   * @param {boolean} rememberMe - Persistencia de sesión
   * @returns {Promise<Object>} Datos del usuario autenticado y token
   */
  async login(username, password, rememberMe = true) {
    const cleanUsername = (username || '').trim().replace(/^@/, '')

    try {
      const response = await api.post('/auth/login', {
        username: cleanUsername,
        password,
        rememberMe
      })

      if (response.success) {
        const payload = response.data?.data
        const userData = payload?.user || payload || {}

        const sessionData = {
          id: userData.id || `usr_${Date.now()}`,
          username: userData.username || cleanUsername,
          displayName: userData.displayName || `@${userData.username || cleanUsername}`,
          role: userData.role || 'Usuario Nexu',
          email: userData.email || `${userData.username || cleanUsername}@nexu.app`,
          avatarType: userData.avatarType || 'neutral',
          gender: userData.gender || 'neutral',
          token: payload?.token || userData?.token || `nexu_token_${Date.now()}`
        }

        saveLocalAccount({
          id: sessionData.id,
          username: sessionData.username,
          password,
          displayName: sessionData.displayName,
          role: sessionData.role,
          email: sessionData.email,
          avatarType: sessionData.avatarType,
          gender: sessionData.gender
        })

        storage.set(STORAGE_KEYS.ACTIVE_USER, sessionData)
        return sessionData
      }

      // Si el servidor respondió con un error de negocio (credenciales incorrectas, 401, 400), lanzarlo
      if (!isNetworkError(response.error)) {
        throw new Error(response.error)
      }
    } catch (err) {
      if (!isNetworkError(err.message)) {
        throw err
      }
    }

    // --- FALLBACK MODO OFFLINE / LOCAL ---
    await new Promise((resolve) => setTimeout(resolve, 300))
    const accounts = getAllLocalAccounts()
    const found = accounts.find(
      (acc) => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.password === password
    )

    if (!found) {
      throw new Error('Usuario o contraseña incorrectos. Verifica tus datos de acceso.')
    }

    const sessionData = {
      id: found.id || `usr_${Date.now()}`,
      username: found.username,
      displayName: found.displayName || `@${found.username}`,
      role: found.role || 'Usuario Nexu',
      email: found.email || `${found.username}@nexu.app`,
      avatarType: found.avatarType || 'neutral',
      gender: found.gender || 'neutral',
      token: `nexu_token_local_${Date.now()}`
    }

    storage.set(STORAGE_KEYS.ACTIVE_USER, sessionData)
    return sessionData
  },

  /**
   * Registrar nuevo usuario conectando con el backend REST: POST /api/auth/register
   * Garantiza unicidad estricta para evitar repeticiones o confusiones.
   * @param {string} username - Alias único deseado
   * @param {string} password - Contraseña segura
   * @returns {Promise<Object>} Datos del nuevo usuario registrado
   */
  async register(username, password) {
    const cleanUsername = (username || '').trim().replace(/^@/, '')

    // Validación de unicidad previa local
    const accounts = getAllLocalAccounts()
    const existsLocally = accounts.some(
      (acc) => acc.username.toLowerCase() === cleanUsername.toLowerCase()
    )

    if (existsLocally) {
      throw new Error(`El alias @${cleanUsername} ya se encuentra registrado por otro usuario. Elige un alias único.`)
    }

    try {
      const response = await api.post('/auth/register', {
        username: cleanUsername,
        password
      })

      if (response.success) {
        const payload = response.data?.data
        const userData = payload?.user || payload || {}

        const sessionData = {
          id: userData.id || `usr_${Date.now()}`,
          username: userData.username || cleanUsername,
          displayName: userData.displayName || `@${userData.username || cleanUsername}`,
          role: userData.role || 'Usuario Nexu',
          email: userData.email || `${userData.username || cleanUsername}@nexu.app`,
          avatarType: userData.avatarType || 'neutral',
          gender: userData.gender || 'neutral',
          token: payload?.token || userData?.token || `nexu_token_${Date.now()}`
        }

        // Sincronizar en local para persistencia y búsquedas
        saveLocalAccount({
          id: sessionData.id,
          username: sessionData.username,
          password,
          displayName: sessionData.displayName,
          role: sessionData.role,
          email: sessionData.email,
          avatarType: sessionData.avatarType,
          gender: sessionData.gender
        })

        storage.set(STORAGE_KEYS.ACTIVE_USER, sessionData)
        return sessionData
      }

      // Si el servidor respondió con error de unicidad (409 Conflict) u otro error de negocio
      if (!isNetworkError(response.error)) {
        throw new Error(response.error)
      }
    } catch (err) {
      if (!isNetworkError(err.message)) {
        throw err
      }
    }

    // --- FALLBACK MODO OFFLINE / LOCAL ---
    await new Promise((resolve) => setTimeout(resolve, 350))

    const newLocalAccount = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      password,
      displayName: `@${cleanUsername}`,
      role: 'Usuario Nexu',
      email: `${cleanUsername.toLowerCase()}@nexu.app`,
      avatarType: 'neutral',
      gender: 'neutral'
    }

    saveLocalAccount(newLocalAccount)

    const sessionData = {
      ...newLocalAccount,
      token: `nexu_token_local_${Date.now()}`
    }

    storage.set(STORAGE_KEYS.ACTIVE_USER, sessionData)
    return sessionData
  },

  /**
   * Solicitar recuperación de acceso: POST /api/auth/forgot-password
   * @param {string} username - Alias registrado
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async forgotPassword(username) {
    const cleanUsername = (username || '').trim().replace(/^@/, '')

    try {
      const response = await api.post('/auth/forgot-password', {
        username: cleanUsername
      })

      if (response.success) {
        return response.data
      }

      if (!isNetworkError(response.error)) {
        throw new Error(response.error)
      }
    } catch (err) {
      if (!isNetworkError(err.message)) {
        throw err
      }
    }

    // Fallback offline
    return {
      success: true,
      message: `Si la cuenta @${cleanUsername} existe, se han generado las instrucciones de recuperación de acceso.`
    }
  },

  /**
   * Obtener usuario actualmente autenticado desde el almacenamiento seguro
   */
  getCurrentUser() {
    const saved = storage.get(STORAGE_KEYS.ACTIVE_USER)
    if (saved) return saved

    // Fallback seguro por defecto
    return {
      username: 'adminUser',
      displayName: 'Administrador Nexu',
      role: 'System Admin',
      email: 'admin@nexu.app',
      avatarType: 'male',
      gender: 'male',
      token: 'demo_token_default'
    }
  },

  /**
   * Cerrar sesión invalidando localmente y notificando al backend
   */
  async logout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // Ignorar si el backend está desconectado
    }
    storage.remove(STORAGE_KEYS.ACTIVE_USER)
  },

  /**
   * Obtener perfil completo
   */
  async getProfile(username) {
    await new Promise((resolve) => setTimeout(resolve, 150))
    const clean = (username || 'adminUser').replace(/^@/, '').toLowerCase()
    const isRosi = clean === 'rosi_master'

    const saved = storage.get(STORAGE_KEYS.profileKey(clean))
    if (saved) return saved

    return {
      displayName: isRosi ? 'Rosa Melano' : 'Administrador Nexu',
      username: isRosi ? 'rosi_master' : 'adminUser',
      email: isRosi ? 'rosa@nexu.app' : 'admin@nexu.app',
      bio: isRosi
        ? 'Especialista en interfaces reactivas y arquitectura frontend de Nexu.'
        : 'Superadministrador de la plataforma de mensajería privada Nexu.',
      avatarType: isRosi ? 'female' : 'male',
      gender: isRosi ? 'female' : 'male',
      presence: 'online'
    }
  },

  /**
   * Guardar cambios en el perfil
   */
  async saveProfile(username, profileData) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const clean = (username || '').replace(/^@/, '').toLowerCase()

    storage.set(STORAGE_KEYS.profileKey(clean), profileData)
    if (profileData.username && profileData.username.toLowerCase() !== clean) {
      storage.set(STORAGE_KEYS.profileKey(profileData.username), profileData)
    }

    return profileData
  },

  /**
   * Actualizar contraseña
   */
  async changePassword(username, currentPass, newPass) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const clean = (username || '').replace(/^@/, '').toLowerCase()
    const isRosi = clean === 'rosi_master'
    const expectedPass = storage.get(STORAGE_KEYS.passKey(clean)) || (isRosi ? 'Nexu2026Pass!' : '12345678')

    if (currentPass !== expectedPass) {
      throw new Error('La contraseña actual es incorrecta')
    }
    if (!newPass || newPass.length < 8) {
      throw new Error('La nueva contraseña debe tener al menos 8 caracteres')
    }

    storage.set(STORAGE_KEYS.passKey(clean), newPass)
    return true
  },

  /**
   * Obtener sesiones de dispositivos
   */
  async getSessions(username) {
    const clean = (username || '').replace(/^@/, '').toLowerCase()
    return storage.get(STORAGE_KEYS.sessionsKey(clean), DEFAULT_SESSIONS)
  },

  /**
   * Cerrar sesión en dispositivo secundario
   */
  async closeSession(username, sessionId) {
    const clean = (username || '').replace(/^@/, '').toLowerCase()
    const current = await this.getSessions(clean)
    const updated = current.filter((s) => s.id !== sessionId)
    storage.set(STORAGE_KEYS.sessionsKey(clean), updated)
    return updated
  }
}
