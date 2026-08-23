// ============================================================================
// REGLAS DE NEGOCIO Y VALIDACIONES PURAS (100% Testeables con Vitest/Jest)
// ============================================================================

/**
 * Sanitiza una cadena para convertirla en un alias válido de Nexu:
 * Solo caracteres alfanuméricos y guión bajo, con longitud máxima de 10 caracteres.
 * @param {string} value
 * @param {number} maxLength
 * @returns {string}
 */
export function sanitizeAlias(value, maxLength = 10) {
  if (!value) return ''
  return value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, maxLength)
}

/**
 * Valida interactivamente el estado de un alias en tiempo real.
 * @param {string} alias
 * @returns {{ state: 'idle' | 'valid' | 'warning' | 'error', msg: string, value: string }}
 */
export function validateAlias(alias) {
  const trimmed = (alias || '').trim().replace(/^@/, '')
  if (!trimmed) {
    return {
      state: 'idle',
      msg: 'Introduce de 3 a 10 caracteres alfanuméricos',
      value: ''
    }
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return {
      state: 'error',
      msg: 'Solo letras, números y guión bajo (_)',
      value: trimmed
    }
  }
  if (trimmed.length < 3) {
    return {
      state: 'warning',
      msg: `${trimmed.length}/3 caracteres mínimos`,
      value: trimmed
    }
  }
  if (trimmed.length > 10) {
    return {
      state: 'error',
      msg: 'Máximo 10 caracteres permitidos',
      value: trimmed
    }
  }
  return {
    state: 'valid',
    msg: `@${trimmed.toLowerCase()} está disponible para reclamar`,
    value: trimmed.toLowerCase()
  }
}

/**
 * Calcula el nivel de seguridad y fortaleza de una contraseña:
 * - Mínimo 8 caracteres obligatorios.
 * - Puntaje incremental por mayúsculas, números y caracteres especiales.
 * @param {string} password
 * @returns {{ level: number, label: string, class: string }}
 */
export function getPasswordStrength(password) {
  if (!password) return { level: 0, label: '', class: '' }
  if (password.length < 8) return { level: 1, label: 'Corta (mínimo 8)', class: 'weak' }

  let score = 1
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1

  if (score === 1) return { level: 1, label: 'Aceptable (8+ car)', class: 'medium' }
  if (score === 2) return { level: 2, label: 'Buena', class: 'medium' }
  return { level: 3, label: 'Fuerte', class: 'strong' }
}

/**
 * Valida los campos requeridos para iniciar sesión.
 * @param {string} username
 * @param {string} password
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateLoginForm(username, password) {
  const errors = {}
  const cleanUsername = (username || '').trim().replace(/^@/, '')

  if (!cleanUsername) {
    errors.loginUsername = 'Introduce tu nombre de usuario.'
  } else if (cleanUsername.length < 3) {
    errors.loginUsername = 'El usuario debe tener al menos 3 caracteres.'
  }

  if (!password) {
    errors.loginPassword = 'Introduce tu contraseña.'
  } else if (password.length < 8) {
    errors.loginPassword = 'La contraseña debe tener al menos 8 caracteres.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
