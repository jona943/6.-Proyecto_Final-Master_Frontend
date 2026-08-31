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
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, maxLength)
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
      msg: 'Introduce de 3 a 10 caracteres',
      value: ''
    }
  }
  // Rechazo explícito de Ñ y caracteres con acento
  if (/[ñÑáéíóúÁÉÍÓÚ]/.test(trimmed)) {
    return {
      state: 'error',
      msg: 'No se permite la letra Ñ ni acentos',
      value: trimmed
    }
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      state: 'error',
      msg: 'Solo letras, números, guión bajo (_) y guión (-)',
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
    msg: 'Formato válido',
    value: trimmed
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

import { loginSchema, validateWithSchema } from './schemas'

/**
 * Valida los campos requeridos para iniciar sesión utilizando Zod.
 * @param {string} username
 * @param {string} password
 * @returns {{ isValid: boolean, errors: Record<string, string> }}
 */
export function validateLoginForm(username, password) {
  const cleanUsername = (username || '').trim().replace(/^@/, '')
  const result = validateWithSchema(loginSchema, {
    username: cleanUsername,
    password
  })

  // Mapear llaves para mantener compatibilidad exacta con los nombres de campos del formulario
  const mappedErrors = {}
  if (result.errors.username) mappedErrors.loginUsername = result.errors.username
  if (result.errors.password) mappedErrors.loginPassword = result.errors.password

  return {
    isValid: result.isValid,
    errors: mappedErrors
  }
}
