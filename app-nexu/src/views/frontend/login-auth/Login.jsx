import { useState } from 'react'
import './Login.css'

// ============================================================================
// ICONOS SVG VECTORIALES NATIVOS (Consistentes con la estética Nexu)
// ============================================================================
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const IconAtSign = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"></circle>
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
  </svg>
)

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
)

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
    <line x1="2" x2="22" y1="2" y2="22"></line>
  </svg>
)

const IconArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"></path>
    <path d="m12 5 7 7-7 7"></path>
  </svg>
)

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
)

const IconKey = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5"></circle>
    <path d="m21 2-9.6 9.6"></path>
    <path d="m15.5 7.5 3 3L22 7l-3-3"></path>
  </svg>
)

// ============================================================================
// COMPONENTE PRINCIPAL: LOGIN & AUTENTICACIÓN
// ============================================================================
function Login({ initialTab = 'login', onLoginSuccess, onNavigateToLanding }) {
  // Pestaña activa: 'login' | 'register' | 'forgot'
  const [activeTab, setActiveTab] = useState(initialTab)

  // Estados del Formulario de Inicio de Sesión
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  // Estados del Formulario de Registro (Solo Usuario y Contraseña >= 8 caracteres)
  const [regUsername, setRegUsername] = useState('')
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

  // =========================================================================
  // MANEJADORES DE SUBMIT (FRONTEND MOCK)
  // =========================================================================

  // 1. Manejar Inicio de Sesión con validación real contra mock
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    const errors = {}

    const cleanUsername = loginUsername.trim().replace(/^@/, '')
    if (!cleanUsername) {
      errors.loginUsername = 'Ingresa tu nombre de usuario.'
    }

    if (!loginPassword) {
      errors.loginPassword = 'La contraseña es requerida.'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      setAlertInfo({
        type: 'error',
        text: 'Por favor, completa los campos requeridos.'
      })
      return
    }

    // Validar coincidencia de usuario y contraseña
    const matchedAccount = VALID_ACCOUNTS.find(
      (acc) =>
        acc.username.toLowerCase() === cleanUsername.toLowerCase() &&
        acc.password === loginPassword
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
      {/* 1. CABECERA: IDENTIDAD DE MARCA */}
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

      {/* 2. TARJETA PRINCIPAL DEL MÓDULO */}
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

          {/* =================================================================
              2.1 VISTA: INICIAR SESIÓN (LOGIN)
             ================================================================= */}
          {activeTab === 'login' && (
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Bienvenido(a) a Nexu</h2>
                <p className="auth-form-desc">
                  Ingresa tu usuario único y contraseña para acceder.
                </p>
              </div>

              {/* Campo Usuario Único */}
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="login-username">Usuario único</label>
                  <span className="input-hint">Máx. 10 caracteres</span>
                </div>
                <div className="input-container">
                  <span className="input-prefix-at">@</span>
                  <input
                    id="login-username"
                    type="text"
                    className={`auth-input has-right-btn ${formErrors.loginUsername ? 'input-error' : ''}`}
                    placeholder="TuAlias"
                    value={loginUsername}
                    onChange={(e) => handleUsernameInput(e.target.value, setLoginUsername, 'loginUsername')}
                    maxLength={10}
                    autoComplete="username"
                  />
                  <span className={`input-char-counter ${loginUsername.length === 10 ? 'limit' : loginUsername.length >= 3 ? 'valid' : ''}`}>
                    {loginUsername.length}/10
                  </span>
                </div>
                {formErrors.loginUsername && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.loginUsername}
                  </span>
                )}
              </div>

              {/* Campo Contraseña */}
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="login-password">Contraseña (8+ caracteres)</label>
                  <button
                    type="button"
                    className="label-link"
                    onClick={() => switchTab('forgot')}
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="input-container">
                  <span className="input-icon-left">
                    <IconLock />
                  </span>
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    className={`auth-input has-right-btn ${formErrors.loginPassword ? 'input-error' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      if (formErrors.loginPassword) setFormErrors({ ...formErrors, loginPassword: null })
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showLoginPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
                {formErrors.loginPassword && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.loginPassword}
                  </span>
                )}
              </div>

              {/* Opción Recordar sesión */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    className="checkbox-custom"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Recordar mi sesión</span>
                </label>
              </div>

              {/* Botón de Enviar */}
              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Accediendo...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar a Nexu</span>
                    <IconArrowRight />
                  </>
                )}
              </button>

              {/* Separador y Acceso Demo Rápido */}
              <div className="auth-divider">CUENTAS DE PRUEBA</div>

              <div className="demo-credentials-box">
                <span className="demo-title">Acceso para Testing</span>
                <p className="demo-text">
                  1. <strong>@adminUser</strong> (clave: 12345678)
                  <br />
                  2. <strong>@rosi_master</strong> (clave: Nexu2026Pass!)
                </p>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => loadDemoUser('adminUser')}
                  >
                    <IconKey /> Cargar @adminUser
                  </button>
                  <button
                    type="button"
                    className="demo-chip-btn"
                    onClick={() => loadDemoUser('rosi_master')}
                  >
                    <IconKey /> Cargar @rosi_master
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =================================================================
              2.2 VISTA: CREAR USUARIO (REGISTRO SIMPLIFICADO)
             ================================================================= */}
          {activeTab === 'register' && (
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Crea tu usuario único</h2>
                <p className="auth-form-desc">
                  Sin correos ni números de teléfono. Solo tu usuario y contraseña.
                </p>
              </div>

              {/* Usuario Único */}
              <div className="form-group">
                <div className="form-label">
                  <label htmlFor="reg-username">Usuario único</label>
                  <span className="input-hint">3 a 10 caracteres alfanuméricos</span>
                </div>
                <div className="input-container">
                  <span className="input-prefix-at">@</span>
                  <input
                    id="reg-username"
                    type="text"
                    className={`auth-input has-right-btn ${formErrors.regUsername ? 'input-error' : ''}`}
                    placeholder="TuAlias"
                    value={regUsername}
                    onChange={(e) => handleUsernameInput(e.target.value, setRegUsername, 'regUsername')}
                    maxLength={10}
                    autoComplete="username"
                  />
                  <span className={`input-char-counter ${regUsername.length === 10 ? 'limit' : regUsername.length >= 3 ? 'valid' : ''}`}>
                    {regUsername.length}/10
                  </span>
                </div>
                {formErrors.regUsername && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.regUsername}
                  </span>
                )}
              </div>

              {/* Contraseña (Mínimo 8 caracteres) */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Contraseña (mínimo 8 caracteres)
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <IconLock />
                  </span>
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className={`auth-input has-right-btn ${formErrors.regPassword ? 'input-error' : ''}`}
                    placeholder="Mínimo 8 caracteres"
                    value={regPassword}
                    onChange={(e) => {
                      setRegPassword(e.target.value)
                      if (formErrors.regPassword) setFormErrors({ ...formErrors, regPassword: null })
                    }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn-toggle-pw"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    title={showRegPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showRegPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>

                {/* Indicador visual de longitud/seguridad */}
                {regPassword && (
                  <>
                    <div className="password-strength-bar">
                      <div className={`strength-segment ${passwordStrength.level >= 1 ? passwordStrength.class : ''}`} />
                      <div className={`strength-segment ${passwordStrength.level >= 2 ? passwordStrength.class : ''}`} />
                      <div className={`strength-segment ${passwordStrength.level >= 3 ? passwordStrength.class : ''}`} />
                    </div>
                    <div className="strength-label">
                      Seguridad: <strong>{passwordStrength.label}</strong>
                    </div>
                  </>
                )}

                {formErrors.regPassword && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.regPassword}
                  </span>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm-password">
                  Confirmar contraseña
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <IconLock />
                  </span>
                  <input
                    id="reg-confirm-password"
                    type={showRegPassword ? 'text' : 'password'}
                    className={`auth-input ${formErrors.regConfirmPassword ? 'input-error' : ''}`}
                    placeholder="Repite tu contraseña de 8+ caracteres"
                    value={regConfirmPassword}
                    onChange={(e) => {
                      setRegConfirmPassword(e.target.value)
                      if (formErrors.regConfirmPassword) setFormErrors({ ...formErrors, regConfirmPassword: null })
                    }}
                    autoComplete="new-password"
                  />
                </div>
                {formErrors.regConfirmPassword && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.regConfirmPassword}
                  </span>
                )}
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Creando usuario...</span>
                  </>
                ) : (
                  <>
                    <span>Crear mi usuario</span>
                    <IconArrowRight />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =================================================================
              2.3 VISTA: RECUPERAR ACCESO (FORGOT PASSWORD)
             ================================================================= */}
          {activeTab === 'forgot' && (
            <form className="auth-form" onSubmit={handleForgotSubmit} noValidate>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Recuperar acceso</h2>
                <p className="auth-form-desc">
                  Ingresa tu usuario único para restablecer tu acceso.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="forgot-username">
                  Usuario único registrado
                </label>
                <div className="input-container">
                  <span className="input-icon-left">
                    <IconAtSign />
                  </span>
                  <input
                    id="forgot-username"
                    type="text"
                    className={`auth-input ${formErrors.forgotUsername ? 'input-error' : ''}`}
                    placeholder="ej. rosi_master"
                    value={forgotUsername}
                    onChange={(e) => {
                      setForgotUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))
                      if (formErrors.forgotUsername) setFormErrors({ ...formErrors, forgotUsername: null })
                    }}
                  />
                </div>
                {formErrors.forgotUsername && (
                  <span className="input-error-msg">
                    <IconAlertCircle /> {formErrors.forgotUsername}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-auth-submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="btn-spinner"></span>
                    <span>Restableciendo...</span>
                  </>
                ) : (
                  <>
                    <span>Restablecer acceso</span>
                    <IconArrowRight />
                  </>
                )}
              </button>

              <button
                type="button"
                className="btn-auth-secondary"
                onClick={() => switchTab('login')}
              >
                Volver a Iniciar Sesión
              </button>
            </form>
          )}
        </div>
      </main>

      {/* 3. FOOTER DEL MÓDULO */}
      <footer className="auth-footer">
        <p className="auth-footer-text">
          Nexu · Módulo de Autenticación desarrollado por <span>Rosa</span>
        </p>
      </footer>
    </div>
  )
}

export default Login
