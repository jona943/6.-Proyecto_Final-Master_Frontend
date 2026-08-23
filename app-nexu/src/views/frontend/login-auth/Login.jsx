import { useState } from 'react'
import './Login.css'

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
// COMPONENTE PRINCIPAL: LOGIN & AUTENTICACIÓN (COORDINADOR MODULAR)
// ============================================================================
function Login({ initialTab = 'login', onLoginSuccess, onNavigateToLanding }) {
  // Pestaña activa: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Estados del Formulario de Inicio de Sesión
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Estados del Formulario de Registro
  const [regUsername, setRegUsername] = useState(() => {
    try {
      const saved = sessionStorage.getItem('nexu_prefilled_alias')
      if (saved) {
        sessionStorage.removeItem('nexu_prefilled_alias')
        return saved
      }
    } catch {
      // ignore
    }
    return ''
  })
  const [regPassword, setRegPassword] = useState('')
  const [regConfirmPassword, setRegConfirmPassword] = useState('')
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Estados del Formulario de Recuperación
  const [forgotUsername, setForgotUsername] = useState('')

  // Estados de interacción UI (Carga, Alertas, Errores)
  const [isLoading, setIsLoading] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [formErrors, setFormErrors] = useState({})

  // Cálculo de fortaleza de la contraseña (mínimo 8 caracteres)
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', class: '' }
    if (password.length < 8) return { level: 1, label: 'Corta (mínimo 8)', class: 'weak' }
    
    let score = 1
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1

    if (score === 1) return { level: 1, label: 'Aceptable (8+ car)', class: 'medium' }
    if (score === 2) return { level: 2, label: 'Buena', class: 'medium' }
    return { level: 3, label: 'Fuerte', class: 'strong' }
  }

  const passwordStrength = getPasswordStrength(regPassword)

  // Sanitizador de Alias: Solo alfanumérico (A-Z, a-z, 0-9) y máximo 10 caracteres
  const handleUsernameInput = (value, setter, errorKey) => {
    const clean = value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10)
    setter(clean)
    if (formErrors[errorKey]) {
      setFormErrors((prev) => ({ ...prev, [errorKey]: null }))
    }
  }

  // Cuentas oficiales de prueba para la base de datos simulada
  const VALID_ACCOUNTS = [
    { username: 'adminUser', password: '12345678' },
    { username: 'rosi_master', password: 'Nexu2026Pass!' }
  ]

  // Cargar credenciales simuladas de prueba
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

  // 1. Manejar Envío del Login
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    const cleanUsername = loginUsername.trim().replace(/^@/, '')
    if (!cleanUsername) {
      errors.loginUsername = 'Introduce tu nombre de usuario.'
    } else if (cleanUsername.length < 3) {
      errors.loginUsername = 'El usuario debe tener al menos 3 caracteres.'
    }

    if (!loginPassword) {
      errors.loginPassword = 'Introduce tu contraseña.'
    } else if (loginPassword.length < 8) {
      errors.loginPassword = 'La contraseña debe tener al menos 8 caracteres.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Comprobar credenciales contra cuentas de prueba válidas
    const matchedAccount = VALID_ACCOUNTS.find(
      (acc) => acc.username.toLowerCase() === cleanUsername.toLowerCase() && acc.password === loginPassword
    )

    if (!matchedAccount) {
      setAlertInfo({
        type: 'error',
        text: 'Usuario o contraseña incorrectos. Utiliza @adminUser (clave: 12345678) o @rosi_master (clave: Nexu2026Pass!).'
      })
      return
    }

    setFormErrors({})
    setIsLoading(true)
    setAlertInfo(null)

    // Acceso exitoso
    setTimeout(() => {
      setIsLoading(false)
      if (onLoginSuccess) {
        onLoginSuccess(matchedAccount.username)
      }
    }, 600)
  }

  // 2. Manejar Registro de Usuario (Inhabilitado temporalmente)
  const handleRegisterSubmit = (e) => {
    e.preventDefault()
    setAlertInfo({
      type: 'error',
      text: 'El registro de nuevos usuarios está inhabilitado temporalmente en esta fase. Por favor, inicia sesión con @adminUser o @rosi_master.'
    })
  }

  // 3. Manejar Recuperación de Contraseña
  const handleForgotSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    const cleanUsername = forgotUsername.trim().toLowerCase().replace(/^@/, '')
    if (!cleanUsername) {
      errors.forgotUsername = 'Ingresa tu nombre de usuario.'
    } else if (cleanUsername.length < 3) {
      errors.forgotUsername = 'Ingresa un usuario válido.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setFormErrors({})
    setIsLoading(true)
    setAlertInfo(null)

    setTimeout(() => {
      setIsLoading(false)
      setAlertInfo({
        type: 'success',
        text: `Acceso simulado restablecido para el usuario @${cleanUsername}.`
      })
    }, 900)
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setAlertInfo(null)
    setFormErrors({})
  }

  return (
    <div className="auth-view-container">
      {/* 1. Cabecera: Identidad de Marca */}
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

      {/* 2. Tarjeta Principal del Módulo */}
      <main className="auth-main-wrapper">
        <div className="auth-card">
          {/* Selector de Pestañas (Iniciar Sesión / Registro) */}
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

          {/* Banner de Estado / Notificación */}
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

          {/* 2.1 Formulario de Inicio de Sesión */}
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

          {/* 2.2 Formulario de Registro */}
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

          {/* 2.3 Formulario de Recuperación de Acceso */}
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

      {/* 3. Footer del Módulo */}
      <footer className="auth-footer">
        <p className="auth-footer-text">
          Nexu · Módulo de Autenticación desarrollado por <span>Rosa</span>
        </p>
      </footer>
    </div>
  )
}

export default Login
