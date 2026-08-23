// ============================================================================
// FORMATEADORES DE DATOS Y TIEMPO (Funciones Puras Reutilizables)
// ============================================================================

/**
 * Formatea una fecha u hora actual en formato de 12 horas (ej. "10:30 AM").
 * @param {Date | string | number} date
 * @returns {string}
 */
export function formatTime(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Obtiene las iniciales en mayúsculas de un nombre (máximo 2 caracteres).
 * @param {string} displayName
 * @param {string} fallback
 * @returns {string}
 */
export function getInitials(displayName, fallback = 'NX') {
  if (!displayName || typeof displayName !== 'string') return fallback
  const parts = displayName.trim().split(/\s+/)
  if (parts.length === 0 || !parts[0]) return fallback
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/**
 * Asegura que el handle empiece con '@'.
 * @param {string} handle
 * @returns {string}
 */
export function formatHandle(handle) {
  if (!handle) return '@usuario'
  const clean = handle.replace(/^@+/, '').trim()
  return `@${clean}`
}

/**
 * Limpia el prefijo '@' y normaliza a minúsculas.
 * @param {string} handle
 * @returns {string}
 */
export function cleanHandle(handle) {
  if (!handle) return ''
  return handle.replace(/^@+/, '').trim().toLowerCase()
}
