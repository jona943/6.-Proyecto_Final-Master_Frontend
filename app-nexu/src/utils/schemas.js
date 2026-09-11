import { z } from 'zod'

/**
 * Esquema de Zod para sanitización y validación de Alias de Usuario Nexu
 */
export const aliasSchema = z
  .string()
  .min(1, 'El nombre de usuario es requerido.')
  .min(3, 'El usuario debe tener al menos 3 caracteres.')
  .max(10, 'El usuario no puede exceder los 10 caracteres.')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Solo se permiten letras, números, guión bajo (_) y guión (-).')
  .refine((val) => !/[ñÑáéíóúÁÉÍÓÚ]/.test(val), {
    message: 'No se permite la letra Ñ ni acentos.'
  })

/**
 * Esquema Zod para Formulario de Iniciar Sesión (Login)
 */
export const loginSchema = z.object({
  username: aliasSchema,
  password: z
    .string()
    .min(1, 'La contraseña es requerida.')
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
})

/**
 * Esquema Zod para Formulario de Registro
 */
export const registerSchema = z
  .object({
    username: aliasSchema,
    password: z
      .string()
      .min(1, 'La contraseña es requerida.')
      .min(8, 'La contraseña debe tener al menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña.')
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden.',
    path: ['confirmPassword']
  })

/**
 * Esquema Zod para Conectar Usuario / Buscar Contactos
 */
export const connectUserSchema = z.object({
  username: aliasSchema
})

/**
 * Función auxiliar para validar datos con un esquema Zod sin lanzar excepciones.
 * Retorna un objeto compatible con la gestión de errores de la UI.
 */
export function validateWithSchema(schema, data) {
  const result = schema.safeParse(data)
  if (result.success) {
    return { isValid: true, errors: {}, data: result.data }
  }

  const errors = {}
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] || 'general'
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message
    }
  })

  return { isValid: false, errors, data: null }
}
