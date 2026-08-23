// ============================================================================
// SERVICIO DE AUTENTICACIÓN Y PERFIL (ADAPTER PATTERN)
// Actualmente opera en modo Demo-Funcional con StorageService seguro.
// Listo para reemplazar con llamadas REST/GraphQL/Firebase sin alterar componentes.
// ============================================================================

import { storage, STORAGE_KEYS } from './storageService'

const VALID_ACCOUNTS = [
  { username: 'adminUser', password: '12345678', displayName: 'Administrador Nexu', role: 'System Admin', email: 'admin@nexu.app', avatarType: 'male', gender: 'male' },
  { username: 'rosi_master', password: 'Nexu2026Pass!', displayName: 'Rosa Melano', role: 'Frontend Specialist', email: 'rosa@nexu.app', avatarType: 'female', gender: 'female' }
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

export const authService = {
  // Iniciar sesión con promesa simulada
  async login(username, password) {
    await new Promise((resolve) => setTimeout(resolve, 450))

    const clean = (username || '').trim().replace(/^@/, '').toLowerCase()
    const account = VALID_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === clean && acc.password === password
    )

    if (!account) {
      throw new Error('Usuario o contraseña incorrectos. Utiliza @adminUser (clave: 12345678) o @rosi_master (clave: Nexu2026Pass!).')
    }

    const sessionData = {
      username: account.username,
      displayName: account.displayName,
      role: account.role,
      email: account.email,
      avatarType: account.avatarType,
      gender: account.gender,
      token: `nexu_token_${Date.now()}`
    }

    storage.set(STORAGE_KEYS.ACTIVE_USER, sessionData)
    return sessionData
  },

  // Obtener usuario actualmente autenticado
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

  // Cerrar sesión
  async logout() {
    await new Promise((resolve) => setTimeout(resolve, 150))
    storage.remove(STORAGE_KEYS.ACTIVE_USER)
  },

  // Obtener perfil completo
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

  // Guardar cambios en el perfil
  async saveProfile(username, profileData) {
    await new Promise((resolve) => setTimeout(resolve, 200))
    const clean = (username || '').replace(/^@/, '').toLowerCase()

    storage.set(STORAGE_KEYS.profileKey(clean), profileData)
    if (profileData.username && profileData.username.toLowerCase() !== clean) {
      storage.set(STORAGE_KEYS.profileKey(profileData.username), profileData)
    }

    return profileData
  },

  // Actualizar contraseña
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

  // Obtener sesiones de dispositivos
  async getSessions(username) {
    const clean = (username || '').replace(/^@/, '').toLowerCase()
    return storage.get(STORAGE_KEYS.sessionsKey(clean), DEFAULT_SESSIONS)
  },

  // Cerrar sesión en dispositivo secundario
  async closeSession(username, sessionId) {
    const clean = (username || '').replace(/^@/, '').toLowerCase()
    const current = await this.getSessions(clean)
    const updated = current.filter((s) => s.id !== sessionId)
    storage.set(STORAGE_KEYS.sessionsKey(clean), updated)
    return updated
  }
}
