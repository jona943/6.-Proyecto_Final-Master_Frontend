import { useState } from 'react'
import { useAuthStore } from '../../../../store/useAuthStore'
import { session, STORAGE_KEYS } from '../../../../services/storageService'
import { authService } from '../../../../services/authService'
import {
  sanitizeAlias,
  validateLoginForm,
  getPasswordStrength
} from '../../../../utils/validators'
import { registerSchema, validateWithSchema } from '../../../../utils/schemas'

/**
 * Custom Hook: useAuthForm
 * Encapsula la lógica de estado, validación Zod, sanitización de alias y envíos
 * para las pestañas de Iniciar Sesión, Crear Usuario y Recuperación de Contraseña.
 */
export function useAuthForm({ initialTab = 'login', onLoginSuccess } = {}) {
  const { login, setUser } = useAuthStore()

  // Pestaña activa: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Estados de Login
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null)

  // Estados de Registro con lectura de alias pre-llenado desde Landing
  const [regUsername, setRegUsername] = useState(() => {
    const saved = session.get(STORAGE_KEYS.PREFILLED_ALIAS, '')
    if (saved) {
      session.remove(STORAGE_KEYS.PREFILLED_ALIAS)
      return saved
    }
    return ''
  })
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Estados de Recuperación
  const [forgotUsername, setForgotUsername] = useState('')

  // Estados de UI y Feedback
  const [isLoading, setIsLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Fortaleza de contraseña
  const passwordStrength = getPasswordStrength(regPassword)

  // Sanitizador de alias
  const handleUsernameInput = (value, setter, errorKey) => {
    const clean = sanitizeAlias(value)
    setter(clean)
    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: null }))
    }
  }

  // Cargar credenciales de prueba (Demo User)
  const loadDemoUser = (accountUsername = 'rosi_master') => {
    setActiveTab('login')
    if (accountUsername === 'adminUser') {
      setLoginUsername('adminUser')
      setLoginPassword('12345678')
      setAlertInfo({
        type: 'info',
        text: 'Credenciales cargadas: @adminUser / 12345678'
      })
    } else {
      setLoginUsername('rosi_master')
      setLoginPassword('Nexu2026Pass!')
      setAlertInfo({
        type: 'info',
        text: 'Credenciales cargadas: @rosi_master / Nexu2026Pass!'
      })
    }
    setFormErrors({})
  }

  // 1. Envío de Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const { isValid, errors } = validateLoginForm(loginUsername, loginPassword)

    if (!isValid) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsLoading(true)
    setAlertInfo(null)

    try {
      const res = await login(loginUsername, loginPassword)
      if (res?.requires2FA) {
        setTwoFactorChallenge({
          tempToken: res.tempToken,
          username: res.username
        })
        return
      }
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.message || 'Error al iniciar sesión'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 1.1 Envío del segundo factor (TOTP / Backup Code)
  const handle2FASubmit = async (code) => {
    if (!twoFactorChallenge) return
    setIsLoading(true)
    setAlertInfo(null)

    try {
      const { login2FA } = useAuthStore.getState()
      await login2FA(twoFactorChallenge.tempToken, code)
      if (onLoginSuccess) {
        onLoginSuccess()
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.message || 'Código de autenticación incorrecto.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cancel2FA = () => {
    setTwoFactorChallenge(null)
    setAlertInfo(null)
  }

  // 2. Envío de Registro con Zod
  const handleRegisterSubmit = async (e) => {
    e.preventDefault()

    const cleanUsername = sanitizeAlias(regUsername)
    const result = validateWithSchema(registerSchema, {
      username: cleanUsername,
      password: regPassword,
      confirmPassword: regConfirmPassword
    })

    if (!result.isValid) {
      const mappedErrors = {}
      if (result.errors.username) mappedErrors.regUsername = result.errors.username
      if (result.errors.password) mappedErrors.regPassword = result.errors.password
      if (result.errors.confirmPassword) mappedErrors.regConfirmPassword = result.errors.confirmPassword
      setFormErrors(mappedErrors)
      return
    }

    setFormErrors({})
    setIsLoading(true)
    setAlertInfo(null)

    try {
      const newUser = await authService.register(cleanUsername, regPassword)
      if (setUser) {
        setUser(newUser)
      }
      setAlertInfo({
        type: 'success',
        text: `¡Usuario @${cleanUsername} registrado exitosamente! Accediendo a NexuHub...`
      })
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(newUser)
        }
      }, 700)
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.message || 'Error al crear la cuenta.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 3. Envío de Recuperación
  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    const cleanUsername = sanitizeAlias(forgotUsername).toLowerCase()
    if (!cleanUsername || cleanUsername.length < 3) {
      setFormErrors({ forgotUsername: 'Ingresa un usuario válido.' })
      return
    }

    setFormErrors({})
    setIsLoading(true)
    setAlertInfo(null)

    try {
      const response = await authService.forgotPassword(cleanUsername)
      setAlertInfo({
        type: 'success',
        text: response.message || `Instrucciones de recuperación generadas para @${cleanUsername}.`
      })
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.message || 'Error al procesar la recuperación de acceso.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setAlertInfo(null)
    setFormErrors({})
  }

  return {
    activeTab,
    switchTab,
    // Login
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    showLoginPassword,
    setShowLoginPassword,
    rememberMe,
    setRememberMe,
    handleLoginSubmit,
    loadDemoUser,
    twoFactorChallenge,
    handle2FASubmit,
    cancel2FA,
    // Register
    regUsername,
    setRegUsername,
    regPassword,
    setRegPassword,
    regConfirmPassword,
    setRegConfirmPassword,
    showRegPassword,
    setShowRegPassword,
    passwordStrength,
    handleRegisterSubmit,
    // Forgot
    forgotUsername,
    setForgotUsername,
    handleForgotSubmit,
    // Form & UI States
    isLoading,
    alertInfo,
    formErrors,
    setFormErrors,
    handleUsernameInput
  }
}

export default useAuthForm
