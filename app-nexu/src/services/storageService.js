// ============================================================================
// SERVICIO DE ALMACENAMIENTO LOCAL RESILIENTE (STORAGE SERVICE)
// Provee serialización segura, manejo de excepciones y llaves centralizadas.
// Listo para escalar con JWT, caché offline y sincronización con Backend.
// ============================================================================

/**
 * Constantes centralizadas de llaves para evitar magic strings.
 */
export const STORAGE_KEYS = {
  ACTIVE_USER: 'nexu_active_user',
  CHATS_DATA: 'nexu_chats_data',
  PREFILLED_ALIAS: 'nexu_prefilled_alias',
  THEME_MODE: 'nexu_theme_mode',
  
  profileKey: (handle) => `nexu_profile_${(handle || 'adminUser').trim().replace(/^@/, '').toLowerCase()}`,
  passKey: (handle) => `nexu_custom_pass_${(handle || 'adminUser').trim().replace(/^@/, '').toLowerCase()}`,
  sessionsKey: (handle) => `nexu_sessions_${(handle || 'adminUser').trim().replace(/^@/, '').toLowerCase()}`
}

/**
 * Wrapper seguro para localStorage con auto-serialización JSON y tolerancia a fallos.
 */
export const storage = {
  get(key, fallback = null) {
    if (typeof window === 'undefined' || !window.localStorage) return fallback
    try {
      const item = window.localStorage.getItem(key)
      if (item === null || item === undefined) return fallback
      return JSON.parse(item)
    } catch (err) {
      console.warn(`[StorageService] Error al leer llave "${key}":`, err)
      return fallback
    }
  },

  set(key, value) {
    if (typeof window === 'undefined' || !window.localStorage) return false
    try {
      const serialized = JSON.stringify(value)
      window.localStorage.setItem(key, serialized)
      return true
    } catch (err) {
      console.warn(`[StorageService] Error al guardar llave "${key}":`, err)
      return false
    }
  },

  remove(key) {
    if (typeof window === 'undefined' || !window.localStorage) return false
    try {
      window.localStorage.removeItem(key)
      return true
    } catch (err) {
      console.warn(`[StorageService] Error al eliminar llave "${key}":`, err)
      return false
    }
  }
}

/**
 * Wrapper seguro para sessionStorage.
 */
export const session = {
  get(key, fallback = null) {
    if (typeof window === 'undefined' || !window.sessionStorage) return fallback
    try {
      const item = window.sessionStorage.getItem(key)
      if (item === null || item === undefined) return fallback
      return JSON.parse(item)
    } catch (err) {
      console.warn(`[SessionStorage] Error al leer llave "${key}":`, err)
      return fallback
    }
  },

  set(key, value) {
    if (typeof window === 'undefined' || !window.sessionStorage) return false
    try {
      const serialized = JSON.stringify(value)
      window.sessionStorage.setItem(key, serialized)
      return true
    } catch (err) {
      console.warn(`[SessionStorage] Error al guardar llave "${key}":`, err)
      return false
    }
  },

  remove(key) {
    if (typeof window === 'undefined' || !window.sessionStorage) return false
    try {
      window.sessionStorage.removeItem(key)
      return true
    } catch (err) {
      console.warn(`[SessionStorage] Error al eliminar llave "${key}":`, err)
      return false
    }
  }
}
