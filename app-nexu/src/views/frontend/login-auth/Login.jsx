import useAuthForm from './hooks/useAuthForm'
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
// COMPONENTE PRINCIPAL: LOGIN & AUTENTICACIÓN (USANDO CUSTOM HOOK useAuthForm)
// ============================================================================
function Login({ initialTab = 'login', onLoginSuccess, onNavigateToLanding }) {
  const {
    activeTab,
    switchTab,
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
    forgotUsername,
    setForgotUsername,
    handleForgotSubmit,
    isLoading,
    alertInfo,
    formErrors,
    setFormErrors,
    handleUsernameInput
  } = useAuthForm({ initialTab, onLoginSuccess })

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
          <span className="auth-brand-name">NexuHub</span>
          <span className="auth-badge-pill">nexuhub.me</span>
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
          NexuHub (nexuhub.me) · Protocolo de Autenticación Soberana
        </p>
      </footer>
    </div>
  )
}

export default Login
