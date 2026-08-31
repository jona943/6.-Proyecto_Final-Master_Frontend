import { useState } from 'react'
import './Login.css'
import { useAuth } from '../../../context/AuthContext'
import { session, STORAGE_KEYS } from '../../../services/storageService'
import { authService } from '../../../services/authService'
import {
  sanitizeAlias,
  validateLoginForm,
  getPasswordStrength
} from '../../../utils/validators'
import { registerSchema, connectUserSchema, validateWithSchema } from '../../../utils/schemas'

import {
  IconUser,
  IconAtSign,
  IconCheckCircle,
  IconAlertCircle,
  IconKey
} from '../../../components/icons/Icons'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'
import ForgotPasswordForm from './components/ForgotPasswordForm'

// ============================================================================
// COMPONENTE PRINCIPAL: LOGIN & AUTENTICACIÓN (COORDINADOR + STORAGE + UTILS)
// ============================================================================
function Login({ initialTab = 'login', onLoginSuccess, onNavigateToLanding }) {
  const { login, setUser } = useAuth()

  // Pestaña activa: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Estados de Login
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Estados de Registro con lectura segura de session
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

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Cálculo de fortaleza de contraseña puro
  const passwordStrength = getPasswordStrength(regPassword)

  // Sanitizador de alias puro
  const handleUsernameInput = (value, setter, errorKey) => {
    const clean = sanitizeAlias(value)
    setter(clean)
    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: null }))
    }
  }

  // Cargar credenciales de prueba
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

  // 1. Enviar Login con validador puro
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
      await login(loginUsername, loginPassword)
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

  // 2. Manejar Registro conectando con authService / backend (Validación con Zod)
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
        text: `¡Usuario @${cleanUsername} registrado exitosamente! Accediendo a Nexu...`
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

  // 3. Manejar Recuperación conectando con authService / backend
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

  return (
    <div className="auth-view-container">
      {/* 1. Header */}
      <header className="auth-header">
        <div
          className="auth-brand-mark"
          onClick={onNavigateToLanding}
          style={{ cursor: onNavigateToLanding ? 'pointer' : 'default' }}
          title={onNavigateToLanding ? 'Volver a la página principal' : undefined}
        >
          <div className="auth-logo-box">N</div>
          <span className="auth-brand-name">Nexu</span>
          <span className="auth-badge-pill">Módulo 02 · Auth</span>
        </div>
      </header>

      {/* 2. Tarjeta Principal */}
      <main className="auth-main-wrapper">
        <div className="auth-card">
          {/* Tabs */}
          {activeTab !== 'forgot' && (
            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => switchTab('login')}
              >
                <IconUser />
                <span>Iniciar sesión</span>
              </button>

              <button
                type="button"
                className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => switchTab('register')}
              >
                <IconAtSign />
                <span>Crear usuario</span>
              </button>
            </div>
          )}

          {/* Alerta */}
          {alertInfo && (
            <div className={`auth-alert ${alertInfo.type}`}>
              <span className="alert-icon">
                {alertInfo.type === 'success' && <IconCheckCircle />}
                {alertInfo.type === 'error' && <IconAlertCircle />}
                {alertInfo.type === 'info' && <IconKey />}
              </span>
              <span>{alertInfo.text}</span>
            </div>
          )}

          {/* Form Login */}
          {activeTab === 'login' && (
            <LoginForm
              loginUsername={loginUsername}
              onUsernameChange={(val) => handleUsernameInput(val, setLoginUsername, 'loginUsername')}
              loginPassword={loginPassword}
              onPasswordChange={(val) => {
                setLoginPassword(val)
                if (formErrors.loginPassword) setFormErrors({ ...formErrors, loginPassword: null })
              }}
              showLoginPassword={showLoginPassword}
              onToggleShowPassword={() => setShowLoginPassword(!showLoginPassword)}
              rememberMe={rememberMe}
              onRememberMeChange={setRememberMe}
              formErrors={formErrors}
              isLoading={isLoading}
              onSubmit={handleLoginSubmit}
              onForgotPasswordClick={() => switchTab('forgot')}
              onLoadDemoUser={loadDemoUser}
            />
          )}

          {/* Form Registro */}
          {activeTab === 'register' && (
            <RegisterForm
              regUsername={regUsername}
              onUsernameChange={(val) => handleUsernameInput(val, setRegUsername, 'regUsername')}
              regPassword={regPassword}
              onPasswordChange={(val) => {
                setRegPassword(val)
                if (formErrors.regPassword) setFormErrors({ ...formErrors, regPassword: null })
              }}
              regConfirmPassword={regConfirmPassword}
              onConfirmPasswordChange={(val) => {
                setRegConfirmPassword(val)
                if (formErrors.regConfirmPassword) setFormErrors({ ...formErrors, regConfirmPassword: null })
              }}
              showRegPassword={showRegPassword}
              onToggleShowPassword={() => setShowRegPassword(!showRegPassword)}
              passwordStrength={passwordStrength}
              formErrors={formErrors}
              isLoading={isLoading}
              onSubmit={handleRegisterSubmit}
            />
          )}

          {/* Form Recuperar */}
          {activeTab === 'forgot' && (
            <ForgotPasswordForm
              forgotUsername={forgotUsername}
              onUsernameChange={(val) => {
                setForgotUsername(val)
                if (formErrors.forgotUsername) setFormErrors({ ...formErrors, forgotUsername: null })
              }}
              formErrors={formErrors}
              isLoading={isLoading}
              onSubmit={handleForgotSubmit}
              onBackToLogin={() => switchTab('login')}
            />
          )}
        </div>
      </main>

      {/* 3. Footer */}
      <footer className="auth-footer">
        <p className="auth-footer-text">
          Nexu · Módulo de Autenticación desarrollado por <span>Rosa</span>
        </p>
      </footer>
    </div>
  )
}

export default Login
